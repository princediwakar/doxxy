'use server';

import { createServerSupabase } from '@/integrations/supabase/server';
import type { AppointmentForBilling, DoctorFeeInfo, ServiceItem } from '@/types/billing';
import type { DbPatient, PrescriptionMedication } from '@/types/core';

function extractMedicationNames(
  prescriptions: { id: string; medications: unknown }[],
): string[] {
  const names: string[] = [];
  const seen = new Set<string>();
  for (const rx of prescriptions) {
    const meds = rx.medications as PrescriptionMedication[] | null | undefined;
    if (meds) {
      for (const med of meds) {
        if (med.name && !seen.has(med.name)) {
          seen.add(med.name);
          names.push(med.name);
        }
      }
    }
  }
  return names;
}

function buildPrescriptionItems(
  prescriptions: { id: string; medications: unknown }[],
  medicinePrices: Record<string, number>,
): ServiceItem[] {
  const items: ServiceItem[] = [];
  for (const rx of prescriptions) {
    const meds = rx.medications as PrescriptionMedication[] | null | undefined;
    if (!meds) continue;
    for (const med of meds) {
      if (!med.name) continue;
      const price = medicinePrices[med.name] ?? 0;
      const label = [med.name, med.dosage].filter(Boolean).join(' ');
      items.push({ description: label, quantity: 1, rate: price, amount: price });
    }
  }
  return items;
}

export async function getBillingContext(
  clinicId: string,
  selectedAppointmentId: string | null,
  mode?: string,
) {
  const supabase = await createServerSupabase();

  const [appointmentsResult, patientsResult] = await Promise.all([
    supabase.rpc('get_appointments_with_details_by_clinic', { clinic_id: clinicId }),
    supabase
      .from('patients')
      .select('id, name, phone, email, uhid')
      .eq('clinic_id', clinicId)
      .order('name'),
  ]);

  if (appointmentsResult.error) throw new Error(appointmentsResult.error.message);
  if (patientsResult.error) throw new Error(patientsResult.error.message);

  const appointments = (appointmentsResult.data || []) as AppointmentForBilling[];
  const patients = (patientsResult.data || []) as DbPatient[];

  const selectedAppointment = appointments.find((apt) => apt.id === selectedAppointmentId);

  let doctorFee: DoctorFeeInfo | null = null;
  let prescriptionItems: ServiceItem[] = [];

  if (selectedAppointment?.doctor_id && mode !== 'view' && selectedAppointmentId) {
    try {
      const [doctorResult, consultationResult] = await Promise.all([
        supabase
          .from('doctors')
          .select('consultation_fee, name')
          .eq('id', selectedAppointment.doctor_id)
          .single(),
        supabase
          .from('consultations')
          .select('id')
          .eq('appointment_id', selectedAppointmentId)
          .maybeSingle(),
      ]);

      if (doctorResult.data) {
        doctorFee = {
          consultation_fee: doctorResult.data.consultation_fee || 0,
          doctor_name: doctorResult.data.name,
        };
      }

      if (consultationResult.data) {
        const { data: prescriptions } = await supabase
          .from('prescriptions')
          .select('id, medications')
          .eq('consultation_id', consultationResult.data.id);

        if (prescriptions?.length) {
          const medNames = extractMedicationNames(prescriptions);

          if (medNames.length > 0) {
            const { data: medicines } = await supabase
              .from('medicines')
              .select('name, price')
              .in('name', medNames);

            const priceMap: Record<string, number> = {};
            for (const row of medicines || []) {
              if (row.name && row.price != null) {
                priceMap[row.name] = row.price;
              }
            }

            prescriptionItems = buildPrescriptionItems(prescriptions, priceMap);
          }
        }
      }
    } catch {
      // Non-critical: doctor fee and prescriptions are best-effort
    }
  }

  return { appointments, patients, doctorFee, selectedAppointment, prescriptionItems };
}
