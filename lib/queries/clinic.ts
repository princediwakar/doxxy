'use server';

import { createServerSupabase } from '@/integrations/supabase/server';

export async function queryDepartmentTypes() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('department_types').select('*');
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function queryClinicDepartments(clinicId: string) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('clinic_departments')
    .select('id, department_types(id, name)')
    .eq('clinic_id', clinicId);
  if (error) throw new Error(error.message);
  return data ?? [];
}
