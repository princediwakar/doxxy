import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/integrations/supabase/server';

export async function getAuthenticatedUser() {
  const supabase = await createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect('/auth');
  }

  return session.user;
}

export async function getActiveClinic(userId: string) {
  const supabase = await createServerSupabase();

  const { data: member } = await supabase
    .from('clinic_members')
    .select('*, clinics(*)')
    .eq('user_id', userId)
    .maybeSingle();

  return member ?? null;
}
