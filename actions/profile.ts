'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/integrations/supabase/server';
import type { Database } from '@/integrations/supabase/types';

type DoctorUpdate = Database['public']['Tables']['doctors']['Update'];

export async function updateProfile(profileData: {
  full_name?: string;
  avatar_url?: string;
}) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase.auth.updateUser({ data: profileData });
  if (error) return { error: error.message };

  revalidatePath('/profile');
  return { success: true };
}

export async function updateDoctorProfile(doctorId: string, data: DoctorUpdate) {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from('doctors')
    .update(data)
    .eq('id', doctorId);

  if (error) return { error: error.message };

  revalidatePath('/profile');
  return { success: true };
}
