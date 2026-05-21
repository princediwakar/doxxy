'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/integrations/supabase/server';
import type { DbConsultationBaseInsert, DbConsultationBaseUpdate } from '@/types/core';

export async function saveConsultation(data: DbConsultationBaseInsert) {
  const supabase = await createServerSupabase();

  const { data: existing } = await supabase
    .from('consultations')
    .select('id')
    .eq('appointment_id', data.appointment_id!)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('consultations')
      .update(data as DbConsultationBaseUpdate)
      .eq('id', existing.id);

    if (error) return { error: error.message };

    revalidatePath('/schedule');
    return { success: true, id: existing.id };
  }

  const { data: created, error } = await supabase
    .from('consultations')
    .insert(data)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/schedule');
  return { success: true, id: created.id };
}

export async function completeConsultation(appointmentId: string) {
  const supabase = await createServerSupabase();

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'Completed' })
    .eq('id', appointmentId);

  if (error) return { error: error.message };

  revalidatePath('/schedule');
  return { success: true };
}
