'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/integrations/supabase/server';
import type { DbPatientInsert, DbPatientUpdate } from '@/types/core';

// Private generator — do not export
async function generateUhid(clinicId: string): Promise<string> {
  const supabase = await createServerSupabase();

  try {
    const { data, error } = await supabase.rpc('generate_uhid', {
      clinic_id_arg: clinicId,
    });
    if (!error && data) return data as string;
  } catch { /* fall through */ }

  try {
    const { data: latestPatient } = await supabase
      .from('patients')
      .select('uhid')
      .eq('clinic_id', clinicId)
      .order('uhid', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestPatient?.uhid && latestPatient.uhid.length >= 9) {
      const seq = parseInt(latestPatient.uhid.slice(-6), 10) + 1;
      const prefix = latestPatient.uhid.slice(0, -6);
      return prefix + String(seq).padStart(6, '0');
    }
  } catch { /* fall through */ }

  const clinic = await supabase.from('clinics').select('name').eq('id', clinicId).single();
  const clinicInitial = (clinic.data?.name?.charAt(0) || 'C').toUpperCase();
  const yearShort = new Date().getFullYear() % 100;
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

  return `${clinicInitial}${String(yearShort).padStart(2, '0')}${random}`;
}

export async function createPatient(data: Omit<DbPatientInsert, 'uhid'> & { clinic_id: string }) {
  const supabase = await createServerSupabase();
  const uhid = await generateUhid(data.clinic_id);

  const { data: patient, error } = await supabase
    .from('patients')
    .insert({ ...data, uhid })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/schedule');
  revalidatePath('/patients');
  return { success: true, data: patient };
}

export async function updatePatient(id: string, data: Partial<DbPatientUpdate>) {
  const supabase = await createServerSupabase();

  // Strip uhid from incoming payload to prevent accidental overwrites
  const { uhid, ...safeUpdateData } = data;

  const { data: patient, error } = await supabase
    .from('patients')
    .update(safeUpdateData)
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath('/schedule');
  revalidatePath('/patients');
  return { success: true, data: patient };
}
