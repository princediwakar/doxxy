import { cache } from 'react';
import { createServerSupabase } from '@/integrations/supabase/server';

export const getClinicDetails = cache(async (clinicId: string) => {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('id', clinicId)
    .single();
  if (error) throw new Error(error.message);
  return data;
});

export const getClinicMembers = cache(async (clinicId: string) => {
  const supabase = await createServerSupabase();

  const { data: clinicMembersData, error } = await supabase
    .from('clinic_members')
    .select(
      `id, user_id, clinic_id, role, department_id, created_at, updated_at,
      profiles!clinic_members_user_id_fkey(id, name, email, phone, avatar_url, created_at, updated_at)`,
    )
    .eq('clinic_id', clinicId);

  if (error) throw new Error(error.message);
  if (!clinicMembersData) return [];

  return Promise.all(
    clinicMembersData.map(async (member) => {
      const { data: doctorProfile } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', member.user_id || '')
        .eq('clinic_id', clinicId)
        .maybeSingle();

      let departmentInfo = null;
      if (member.department_id) {
        const { data: deptData } = await supabase
          .from('clinic_departments')
          .select('*, department_types(*)')
          .eq('id', member.department_id)
          .maybeSingle();
        departmentInfo = deptData;
      }

      return {
        id: member.id,
        user_id: member.user_id,
        clinic_id: member.clinic_id,
        role: member.role,
        department_id: member.department_id,
        created_at: member.created_at,
        updated_at: member.updated_at,
        profile: member.profiles,
        department: departmentInfo,
        hasDoctor: !!doctorProfile,
      };
    }),
  );
});

export const getClinicDepartments = cache(async (clinicId: string) => {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('clinic_departments')
    .select('*, department_types(*)')
    .eq('clinic_id', clinicId);
  if (error) throw new Error(error.message);
  return data || [];
});

export const getDepartmentTypes = cache(async () => {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('department_types')
    .select('*')
    .order('name');
  if (error) throw new Error(error.message);
  return data || [];
});
