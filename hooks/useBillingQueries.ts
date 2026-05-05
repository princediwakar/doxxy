"use client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getSupabase } from "@/integrations/supabase/client";
import { useAppState } from "@/contexts/AppStateContext";
import type { AppointmentForBilling, DoctorFeeInfo, ServiceItem } from "@/types/billing";
import type { DbPatient, PrescriptionMedication } from "@/types/core";
import type { Json } from "@/types/core";
import { queryKeys } from "@/lib/query-keys";

const supabase = getSupabase();

export function useBillingQueries(
  open: boolean,
  selectedPatientId: string,
  selectedAppointmentId: string | null,
  mode?: string,
) {
  const { activeClinicId } = useAppState();

  const { data: appointments, isLoading: isLoadingAppointments, error: appointmentsError } = useQuery({
    queryKey: queryKeys.appointments.byClinic(activeClinicId ?? ""),
    queryFn: async () => {
      if (!activeClinicId) return [];
      const { data, error } = await supabase
        .rpc("get_appointments_with_details_by_clinic", { clinic_id: activeClinicId });
      if (error) throw error;
      return (data || []) as AppointmentForBilling[];
    },
    enabled: open && !!activeClinicId,
    staleTime: 2 * 60 * 1000,
  });

  const { data: patients, isLoading: isLoadingPatients, error: patientsError } = useQuery({
    queryKey: queryKeys.patients.byClinic(activeClinicId ?? ""),
    queryFn: async () => {
      if (!activeClinicId) return [];
      const { data, error } = await supabase
        .from("patients")
        .select("id, name, phone, email, medical_id")
        .eq("clinic_id", activeClinicId)
        .order("name");
      if (error) throw error;
      return (data || []) as DbPatient[];
    },
    enabled: open && !!activeClinicId,
    staleTime: 2 * 60 * 1000,
  });

  // Find selected appointment from loaded appointments
  const selectedAppointment = appointments?.find((apt) => apt.id === selectedAppointmentId);

  // Fetch doctor consultation fee (derives doctor_id from selected appointment internally)
  const { data: doctorFee, error: doctorFeeError } = useQuery({
    queryKey: ["doctorFee", selectedAppointment?.doctor_id],
    queryFn: async () => {
      if (!selectedAppointment?.doctor_id) return null;
      const { data, error } = await supabase
        .from("doctors")
        .select("consultation_fee, name")
        .eq("id", selectedAppointment.doctor_id)
        .single();
      if (error) throw error;
      return {
        consultation_fee: data.consultation_fee || 0,
        doctor_name: data.name,
      } as DoctorFeeInfo;
    },
    enabled: !!selectedAppointment?.doctor_id && mode !== "view",
    staleTime: 5 * 60 * 1000,
  });

  // Fetch prescriptions linked to this appointment's consultation
  const { data: prescriptions } = useQuery({
    queryKey: ["billing-prescriptions", selectedAppointmentId],
    queryFn: async () => {
      if (!selectedAppointmentId) return [];
      const { data: consultation } = await supabase
        .from("consultations")
        .select("id")
        .eq("appointment_id", selectedAppointmentId)
        .maybeSingle();
      if (!consultation) return [];
      const { data, error } = await supabase
        .from("prescriptions")
        .select("id, medications")
        .eq("consultation_id", consultation.id);
      if (error) throw error;
      return (data || []) as { id: string; medications: Json | null }[];
    },
    enabled: !!selectedAppointmentId && mode !== "view",
    staleTime: 2 * 60 * 1000,
  });

  // Extract unique medication names from prescriptions
  const medicationNames = useMemo(() => {
    if (!prescriptions?.length) return [];
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
  }, [prescriptions]);

  // Batch-fetch medicine prices
  const { data: medicinePrices } = useQuery({
    queryKey: ["medicine-prices", medicationNames],
    queryFn: async () => {
      if (!medicationNames.length) return {};
      const { data, error } = await supabase
        .from("medicines")
        .select("name, price")
        .in("name", medicationNames);
      if (error) throw error;
      const map: Record<string, number> = {};
      for (const row of data || []) {
        if (row.name && row.price != null) {
          map[row.name] = row.price;
        }
      }
      return map;
    },
    enabled: medicationNames.length > 0 && mode !== "view",
    staleTime: 5 * 60 * 1000,
  });

  // Build prescription service items
  const prescriptionItems = useMemo((): ServiceItem[] => {
    if (!prescriptions?.length) return [];
    const items: ServiceItem[] = [];
    for (const rx of prescriptions) {
      const meds = rx.medications as PrescriptionMedication[] | null | undefined;
      if (!meds) continue;
      for (const med of meds) {
        if (!med.name) continue;
        const price = medicinePrices?.[med.name] ?? 0;
        const label = [med.name, med.dosage].filter(Boolean).join(" ");
        items.push({ description: label, quantity: 1, rate: price, amount: price });
      }
    }
    return items;
  }, [prescriptions, medicinePrices]);

  // Filter appointments by selected patient
  const filteredAppointments = (appointments || []).filter((apt) => {
    if (!selectedPatientId) return true;
    return apt.patient_id === selectedPatientId;
  });

  return {
    appointments: filteredAppointments,
    patients: patients || [],
    isLoadingAppointments,
    isLoadingPatients,
    appointmentsError: appointmentsError as Error | null,
    patientsError: patientsError as Error | null,
    doctorFee: doctorFee || null,
    doctorFeeError: doctorFeeError as Error | null,
    selectedAppointment,
    prescriptionItems,
  };
}
