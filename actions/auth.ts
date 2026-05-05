'use server';

import { createServerSupabase } from '@/integrations/supabase/server';
import { redirect } from 'next/navigation';

export async function signOutAction() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect('/auth');
}
