'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/integrations/supabase/server';
import type { Database } from '@/integrations/supabase/types';

export async function inviteClinicMember(data: Database['public']['Tables']['clinic_members']['Insert']) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('clinic_members').insert(data);
  if (error) return { error: error.message };
  revalidatePath('/clinic/staff');
  return { success: true };
}

export async function updateClinicMember(id: string, data: Database['public']['Tables']['clinic_members']['Update']) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('clinic_members').update(data).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/clinic/staff');
  return { success: true };
}

export async function removeClinicMember(id: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('clinic_members').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/clinic/staff');
  return { success: true };
}

export async function updateClinic(id: string, data: Database['public']['Tables']['clinics']['Update']) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('clinics').update(data).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/clinic');
  return { success: true };
}
