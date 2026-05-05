'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/integrations/supabase/server';
import type { Database } from '@/integrations/supabase/types';

export async function inviteClinicMember(data: Database['public']['Tables']['clinic_members']['Insert']) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('clinic_members').insert(data);
  if (error) return { error: error.message };
  revalidatePath('/clinic/staff');
  return { success: true };
}

export async function updateClinicMember(id: string, data: Database['public']['Tables']['clinic_members']['Update']) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('clinic_members').update(data).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/clinic/staff');
  return { success: true };
}

export async function removeClinicMember(id: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('clinic_members').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/clinic/staff');
  return { success: true };
}

export async function updateClinic(id: string, data: Database['public']['Tables']['clinics']['Update']) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('clinics').update(data).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/clinic');
  return { success: true };
}

export async function createDoctorForMember(params: {
  userId: string;
  clinicId: string;
  name: string;
  email: string;
  primarySpecialization?: string;
  consultationFee?: number;
  bio?: string;
  departmentId?: string;
}) {
  const supabase = await createServerSupabase();
  const { userId, clinicId, name, email, primarySpecialization, consultationFee, bio } = params;

  const { error } = await supabase.from('doctors').insert({
    user_id: userId,
    clinic_id: clinicId,
    name,
    email,
    primary_specialization: primarySpecialization || null,
    phone: null,
    is_active: true,
  });
  if (error) return { error: error.message };

  revalidatePath('/clinic/staff');
  return { success: true };
}

export async function createClinicWithAdmin(params: {
  userPhone?: string;
  clinicName: string;
  address?: string;
  email?: string;
  phone?: string;
  website?: string;
  userId: string;
  departments: string[];
  isDoctor: boolean;
  doctorBio?: string;
  doctorPhone?: string;
  selectedDepartment?: string;
  consultationFee?: number;
  userName?: string;
  userEmail?: string;
}) {
  const supabase = await createServerSupabase();

  const { data: clinicResult, error: clinicError } = await supabase
    .rpc('create_clinic_with_admin', {
      clinic_name: params.clinicName,
      user_phone: params.userPhone || undefined,
    })
    .single();

  if (clinicError) return { error: clinicError.message };
  if (!clinicResult) return { error: 'Clinic creation failed - no result returned.' };

  const createdClinicId = (clinicResult as { clinic_id: string }).clinic_id;

  const { error: updateError } = await supabase
    .from('clinics')
    .update({
      address: params.address || null,
      email: params.email || null,
      phone: params.phone || null,
      website: params.website || null,
      created_by: params.userId,
    })
    .eq('id', createdClinicId);

  if (updateError) return { error: updateError.message };

  let userDepartmentId: string | null = null;
  if (params.departments.length > 0) {
    const departmentRows = params.departments.map((departmentTypeId) => ({
      clinic_id: createdClinicId,
      department_type_id: departmentTypeId,
    }));
    const { data: insertedDepartments, error: deptError } = await supabase
      .from('clinic_departments')
      .insert(departmentRows)
      .select('id, department_type_id');
    if (deptError) return { error: deptError.message };

    if (params.isDoctor && params.selectedDepartment && insertedDepartments) {
      const userDepartment = insertedDepartments.find(
        (dept) => dept.department_type_id === params.selectedDepartment,
      );
      userDepartmentId = userDepartment?.id || null;
    }
  }

  if (params.isDoctor) {
    const { error: memberUpdateError } = await supabase
      .from('clinic_members')
      .update({ department_id: userDepartmentId, role: 'superadmin' })
      .eq('user_id', params.userId)
      .eq('clinic_id', createdClinicId);

    if (memberUpdateError) return { error: memberUpdateError.message };

    const { error: doctorError } = await supabase.from('doctors').upsert(
      {
        user_id: params.userId,
        clinic_id: createdClinicId,
        name: params.userName || params.userEmail || '',
        email: params.userEmail,
        primary_specialization: null,
        consultation_fee: params.consultationFee || 0,
        bio: params.doctorBio,
        is_active: true,
      },
      { onConflict: 'user_id,clinic_id' },
    );
    if (doctorError) return { error: doctorError.message };
  } else {
    const { error: adminMemberError } = await supabase
      .from('clinic_members')
      .upsert(
        {
          user_id: params.userId,
          clinic_id: createdClinicId,
          role: 'superadmin',
          department_id: null,
        },
        { onConflict: 'user_id,clinic_id' },
      );

    if (adminMemberError) return { error: adminMemberError.message };
  }

  revalidatePath('/clinic');
  return { success: true, clinicId: createdClinicId };
}

export async function addClinicDepartment(clinicId: string, departmentTypeId: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from('clinic_departments')
    .insert({ clinic_id: clinicId, department_type_id: departmentTypeId });
  if (error) return { error: error.message };
  revalidatePath('/clinic/departments');
  return { success: true };
}

export async function removeClinicDepartment(clinicDepartmentId: string) {
  const supabase = await createServerSupabase();

  const { count, error: countError } = await supabase
    .from('clinic_members')
    .select('*', { count: 'exact', head: true })
    .eq('department_id', clinicDepartmentId);

  if (countError) return { error: `Failed to check for department members: ${countError.message}` };
  if (count && count > 0) return { error: `Cannot remove department: ${count} member(s) are still assigned.` };

  const { error } = await supabase
    .from('clinic_departments')
    .delete()
    .eq('id', clinicDepartmentId);

  if (error) {
    if (error.message.includes('violates foreign key constraint')) {
      return { error: 'This department is in use and cannot be removed.' };
    }
    return { error: error.message };
  }
  revalidatePath('/clinic/departments');
  return { success: true };
}

export async function removeMemberWithCleanup(memberId: string, userId: string | null, clinicId: string, email: string | null) {
  const supabase = await createServerSupabase();

  const { error } = await supabase.from('clinic_members').delete().eq('id', memberId);
  if (error) return { error: error.message };

  if (email) {
    await supabase.from('pending_invitations').delete().eq('email', email).eq('clinic_id', clinicId);
  }
  if (userId) {
    await supabase.from('doctors').delete().eq('user_id', userId).eq('clinic_id', clinicId);
  }

  revalidatePath('/clinic/staff');
  return { success: true };
}
