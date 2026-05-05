'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/integrations/supabase/server';
import type { Database } from '@/integrations/supabase/types';

type PrescriptionInsert = Database['public']['Tables']['prescriptions']['Insert'];

export async function createPrescription(data: PrescriptionInsert) {
  const supabase = await createServerSupabase();

  const { data: prescription, error } = await supabase
    .from('prescriptions')
    .insert(data)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/today');
  return { success: true, data: prescription };
}
