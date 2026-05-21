'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/integrations/supabase/server';
import type { DbPatientInsert, DbPatientUpdate } from '@/types/core';

export async function createPatient(data: DbPatientInsert) {
  const supabase = await createServerSupabase();
  const { data: patient, error } = await supabase
    .from('patients')
    .insert(data)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/schedule');
  return { success: true, data: patient };
}

export async function updatePatient(id: string, data: DbPatientUpdate) {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from('patients')
    .update(data)
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/schedule');
  return { success: true };
}
