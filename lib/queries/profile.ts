'use server';

import { createServerSupabase } from '@/integrations/supabase/server';

export async function queryUserProfile(userId: string) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function queryDoctorProfile(userId: string, clinicId: string) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('doctors')
    .select(
      'id, user_id, clinic_id, name, email, phone, bio, primary_specialization, consultation_fee, is_active, created_at, updated_at, signature, google_place_id, google_place_data',
    )
    .eq('user_id', userId)
    .eq('clinic_id', clinicId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const { data: memberData } = await supabase
    .from('clinic_members')
    .select(
      `department_id,
      clinic_departments(
        id,
        department_types(id, name)
      )`,
    )
    .eq('user_id', userId)
    .eq('clinic_id', clinicId)
    .maybeSingle();

  return {
    ...data,
    department_id: memberData?.department_id ?? null,
    department_type_id: memberData?.clinic_departments?.department_types?.id ?? null,
    department_name: memberData?.clinic_departments?.department_types?.name ?? 'No Department',
  };
}
