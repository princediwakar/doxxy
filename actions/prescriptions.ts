'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/integrations/supabase/server';
import type { DbPrescriptionBaseInsert } from '@/types/core';

export async function createPrescription(data: DbPrescriptionBaseInsert) {
  const supabase = await createServerSupabase();

  const { data: prescription, error } = await supabase
    .from('prescriptions')
    .insert(data)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/schedule');
  return { success: true, data: prescription };
}
