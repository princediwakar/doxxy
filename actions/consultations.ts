'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/integrations/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DbConsultationBaseInsert, DbConsultationBaseUpdate, DbJson } from '@/types/core';

interface UpsertConsultationParams {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  clinicId: string;
  specialtyData: Record<string, unknown>;
  prescriptions?: Array<{ name?: string; [key: string]: unknown }>;
}

export async function upsertConsultation(
  supabase: SupabaseClient,
  params: UpsertConsultationParams,
) {
  const { appointmentId, patientId, doctorId, clinicId, specialtyData, prescriptions } = params;

  const consultationData: DbConsultationBaseInsert = {
    appointment_id: appointmentId,
    patient_id: patientId,
    doctor_id: doctorId,
    clinic_id: clinicId,
    specialty_data: specialtyData as DbJson,
  };

  const { data: existing } = await supabase
    .from('consultations')
    .select('id')
    .eq('appointment_id', appointmentId)
    .maybeSingle();

  let consultationId: string;

  if (existing) {
    const { error } = await supabase
      .from('consultations')
      .update(consultationData as DbConsultationBaseUpdate)
      .eq('id', existing.id);

    if (error) throw error;
    consultationId = existing.id;
  } else {
    const { data: created, error } = await supabase
      .from('consultations')
      .insert(consultationData)
      .select()
      .single();

    if (error) throw error;
    consultationId = created.id;
  }

  if (prescriptions !== undefined) {
    const validPrescriptions = prescriptions.filter(
      (med) => med.name && med.name.trim().length > 0
    );

    if (validPrescriptions.length > 0) {
      const prescriptionData = {
        consultation_id: consultationId,
        patient_id: patientId,
        doctor_id: doctorId,
        clinic_id: clinicId,
        medications: validPrescriptions as unknown as DbJson,
      };

      const { error: prescError } = await supabase
        .from('prescriptions')
        .upsert(prescriptionData, {
          onConflict: 'consultation_id,patient_id,doctor_id',
          ignoreDuplicates: false,
        });

      if (prescError) throw prescError;
    } else {
      await supabase
        .from('prescriptions')
        .delete()
        .eq('consultation_id', consultationId);
    }
  }

  return { id: consultationId };
}

export async function saveConsultation(params: UpsertConsultationParams) {
  const supabase = await createServerSupabase();
  try {
    const result = await upsertConsultation(supabase, params);
    revalidatePath('/schedule');
    return { success: true, id: result.id };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function completeConsultation(appointmentId: string, clinicId: string) {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .rpc('complete_appointment', {
      p_appointment_id: appointmentId,
      p_clinic_id: clinicId,
    });

  if (error) return { error: error.message };

  const result = data as { success: boolean; error?: string };

  if (!result.success) {
    return { error: result.error || 'Failed to complete consultation' };
  }

  revalidatePath('/schedule');
  return { success: true };
}
