import { parseISO, isToday } from 'date-fns';
import { createServerSupabase } from '@/integrations/supabase/server';
import type { DbPatientByClinic } from '@/types/core';

export async function getTodayAppointments(clinicId: string) {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase.rpc(
    'get_appointments_with_details_by_clinic',
    { clinic_id: clinicId },
  );

  if (error) throw new Error(error.message);

  // appointments.date is text with mixed formats (plain "2026-05-02" or full "2026-05-02 00:00:00+05:30")
  const todayApps = (data || []).filter((app) =>
    isToday(parseISO(app.date)),
  );

  const inProgress = todayApps.filter((a) => a.status === 'In Progress');
  const scheduled = todayApps.filter((a) => a.status === 'Scheduled');
  const completed = todayApps.filter((a) => a.status === 'Completed');

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

  return { patient: patient as DbPatientByClinic, consultations: consultations || [] };
}
