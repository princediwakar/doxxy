import { cache } from 'react';
import { parseISO, format } from 'date-fns';
import { createServerSupabase } from '@/integrations/supabase/server';
import type { DbPatientByClinic } from '@/types/core';
import { getCurrentDateStringIST } from '@/lib/utils';

export const resolveUserDoctor = cache(async (userId: string, clinicId: string) => {
  const supabase = await createServerSupabase();

  const { data } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', userId)
    .eq('clinic_id', clinicId)
    .maybeSingle();

  return data?.id ?? null;
});

export async function getTodayAppointments(clinicId: string, doctorId?: string | null, date?: string | null) {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase.rpc(
    'get_appointments_with_details_by_clinic',
    { clinic_id: clinicId, filter_doctor_id: doctorId ?? undefined },
  );

  if (error) throw new Error(error.message);

  const targetDate = date || getCurrentDateStringIST();
  
  // appointments.date is text with mixed formats (plain "2026-05-02" or full "2026-05-02 00:00:00+05:30")
  const filtered = (data || []).filter((app) => {
    if (!app.date) return false;
    return app.date.substring(0, 10) === targetDate;
  });

  const inProgress = filtered.filter((a) => a.status === 'In Progress');
  const scheduled = filtered.filter((a) => a.status === 'Scheduled');
  const completed = filtered.filter((a) => a.status === 'Completed');

  return { inProgress, scheduled, completed };
}

export async function getPatientById(patientId: string) {
  const supabase = await createServerSupabase();

  const { data: patient, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .single();

  if (error) return null;

  const { data: consultations } = await supabase
    .from('consultations')
    .select('*, appointments(id, date, time, status, doctor_id, type, created_at, doctors(name))')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
    .limit(20);

  const { data: bills } = await supabase
    .from('bills')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  return { patient: patient as DbPatientByClinic, consultations: consultations || [], bills: bills || [] };
}
