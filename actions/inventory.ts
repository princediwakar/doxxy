'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/integrations/supabase/server';
import type { Database } from '@/integrations/supabase/types';

export async function addMedicine(data: Database['public']['Tables']['medicines']['Insert']) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('medicines').insert(data);
  if (error) return { error: error.message };
  revalidatePath('/pharmacy');
  return { success: true };
}

export async function updateMedicine(id: number, data: Database['public']['Tables']['medicines']['Update']) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('medicines').update(data).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/pharmacy');
  return { success: true };
}

export async function deleteMedicine(id: number) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('medicines').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/pharmacy');
  return { success: true };
}

export async function createProcurement(data: Database['public']['Tables']['procurements']['Insert']) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('procurements').insert(data);
  if (error) return { error: error.message };
  revalidatePath('/pharmacy');
  return { success: true };
}
