'use server';

import { createServerSupabase } from '@/integrations/supabase/server';

export async function queryConsultationData(appointmentId: string) {
  const supabase = await createServerSupabase();

  const { data: consultation, error } = await supabase
    .from('consultations')
    .select('*')
    .eq('appointment_id', appointmentId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  const { data: prescriptions } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('consultation_id', consultation?.id || '')
    .order('created_at', { ascending: false });

  return { consultation, prescriptions: prescriptions || [] };
}

export async function getConsultationContext(
  appointmentId: string,
  clinicId: string,
  patientId: string | undefined,
  doctorUserId: string | undefined,
  hasPrefetchedConsultations: boolean,
) {
  const supabase = await createServerSupabase();

  const [
    existingConsultationResult,
    previousConsultationsResult,
    recentPrescriptionsResult,
    departmentInfoResult,
  ] = await Promise.all([
    supabase
      .from('consultations')
      .select('*')
      .eq('appointment_id', appointmentId)
      .maybeSingle(),

    patientId && !hasPrefetchedConsultations
      ? supabase
          .from('consultations')
          .select('*, appointment:appointments(date, time)')
          .eq('patient_id', patientId)
          .eq('clinic_id', clinicId)
          .neq('appointment_id', appointmentId)
          .order('created_at', { ascending: false })
          .limit(5)
      : Promise.resolve({ data: null, error: null }),

    patientId
      ? supabase
          .from('prescriptions')
          .select('*')
          .eq('patient_id', patientId)
          .eq('clinic_id', clinicId)
          .order('created_at', { ascending: false })
          .limit(3)
      : Promise.resolve({ data: [], error: null }),

    doctorUserId && clinicId
      ? supabase
          .from('clinic_members')
          .select('department_id, clinic_departments(department_types(name))')
          .eq('user_id', doctorUserId)
          .eq('clinic_id', clinicId)
          .single()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (existingConsultationResult.error) throw new Error(existingConsultationResult.error.message);
  if (previousConsultationsResult.error) throw new Error(previousConsultationsResult.error.message);
  if (recentPrescriptionsResult.error) throw new Error(recentPrescriptionsResult.error.message);
  if (departmentInfoResult.error && departmentInfoResult.error.code !== 'PGRST116') {
    throw new Error(departmentInfoResult.error.message);
  }

  return {
    existingConsultation: existingConsultationResult.data,
    previousConsultations: previousConsultationsResult.data || [],
    recentPrescriptions: recentPrescriptionsResult.data || [],
    departmentInfo: departmentInfoResult.data?.clinic_departments?.department_types
      ? {
          name: departmentInfoResult.data.clinic_departments.department_types.name,
          clinic_departments: departmentInfoResult.data.clinic_departments,
        }
      : null,
  };
}
