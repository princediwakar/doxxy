'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/integrations/supabase/server';
import type { DbAppointmentInsert, DbAppointmentUpdate } from '@/types/core';

export async function createAppointment(data: DbAppointmentInsert) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('appointments').insert(data);

  if (error) return { error: error.message };

  revalidatePath('/schedule');
  return { success: true };
}

export async function updateAppointment(
  id: string,
  data: DbAppointmentUpdate,
) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('appointments').update(data).eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/schedule');
  return { success: true };
}

export async function cancelAppointment(id: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'Cancelled' })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/schedule');
  return { success: true };
}

export async function startConsultation(params: {
  appointmentId: string;
  clinicId: string;
  role: string;
}) {
  const supabase = await createServerSupabase();
  const { appointmentId, clinicId, role } = params;

  const { data: existing, error: checkError } = await supabase
    .from('consultations')
    .select('id')
    .eq('appointment_id', appointmentId)
    .maybeSingle();

  if (checkError) return { error: checkError.message };

  if (existing) {
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'In Progress' })
      .eq('id', appointmentId);
    if (updateError) return { error: updateError.message };

    revalidatePath('/schedule');
    return { success: true };
  }

  if (role !== 'superadmin') {
    const { data: credits } = await supabase
      .from('clinic_credits')
      .select('credit_balance')
      .eq('clinic_id', clinicId)
      .maybeSingle();

    const balance = credits?.credit_balance || 0;
    if (balance < 1) {
      return { error: 'Insufficient credits. Please purchase more.' };
    }
  }

  const { data: appData, error: appError } = await supabase
    .from('appointments')
    .select('patient_id, doctor_id')
    .eq('id', appointmentId)
    .single();

  if (appError) return { error: appError.message };

  const { error: insertError } = await supabase
    .from('consultations')
    .insert({
      appointment_id: appointmentId,
      clinic_id: clinicId,
      patient_id: appData.patient_id,
      doctor_id: appData.doctor_id,
      specialty_data: {},
      clinical_notes: {},
    });

  if (insertError) return { error: insertError.message };

  const { error: statusError } = await supabase
    .from('appointments')
    .update({ status: 'In Progress' })
    .eq('id', appointmentId);

  if (statusError) return { error: statusError.message };

  revalidatePath('/schedule');
  return { success: true };
}
