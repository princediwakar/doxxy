'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/integrations/supabase/server';
import type { Database } from '@/integrations/supabase/types';

type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];

export async function createAppointment(data: AppointmentInsert) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('appointments').insert(data);

  if (error) return { error: error.message };

  revalidatePath('/today');
  return { success: true };
}

export async function updateAppointment(
  id: string,
  data: Database['public']['Tables']['appointments']['Update'],
) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('appointments').update(data).eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/today');
  return { success: true };
}

export async function cancelAppointment(id: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'Cancelled' })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/today');
  return { success: true };
}
