import { cache } from 'react';
import { createServerSupabase } from '@/integrations/supabase/server';

export const getDoctorProfile = cache(
  async (userId: string, clinicId: string) => {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
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
          department_types(name)
        )`,
      )
      .eq('user_id', userId)
      .eq('clinic_id', clinicId)
      .maybeSingle();

    return {
      ...data,
      department_id: memberData?.department_id ?? null,
      department_name:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (memberData?.clinic_departments as any)?.department_types?.name ??
        null,
    };
  },
);

export const getUserProfile = cache(async (userId: string) => {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
});

export const hasDoctorProfile = cache(
  async (userId: string, clinicId: string) => {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', userId)
      .eq('clinic_id', clinicId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data !== null;
  },
);
