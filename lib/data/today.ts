import { startOfDay, formatISO } from 'date-fns';
import { createServerSupabase } from '@/integrations/supabase/server';

export async function getTodayAppointments(clinicId: string) {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase.rpc(
    'get_appointments_with_details_by_clinic',
    { clinic_id: clinicId },
  );

  if (error) throw new Error(error.message);

  const today = formatISO(startOfDay(new Date()), { representation: 'date' });
  const todayApps = (data || []).filter((app) => app.date === today);

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

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', patientId)
    .order('date', { ascending: false })
    .limit(20);

  return { patient, appointments: appointments || [] };
}
