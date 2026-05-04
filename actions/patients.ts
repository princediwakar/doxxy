'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/integrations/supabase/server';
import type { Database } from '@/integrations/supabase/types';

type PatientInsert = Database['public']['Tables']['patients']['Insert'];
type PatientUpdate = Database['public']['Tables']['patients']['Update'];

export async function createPatient(data: PatientInsert) {
  const supabase = await createServerSupabase();
  const { data: patient, error } = await supabase
    .from('patients')
    .insert(data)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/today');
  return { success: true, data: patient };
}

export async function updatePatient(id: string, data: PatientUpdate) {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from('patients')
    .update(data)
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/today');
  return { success: true };
}
