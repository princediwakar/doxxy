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
