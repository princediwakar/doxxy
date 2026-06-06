'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/integrations/supabase/server';
import type { DbClinicMemberInsert, DbClinicMemberUpdate, DbClinicUpdate, DbProfileInsert, Json } from '@/types/core';
import type { GooglePlaceData } from '@/types/google-places';

export async function inviteClinicMember(data: DbClinicMemberInsert) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('clinic_members').insert(data);
  if (error) return { error: error.message };
  revalidatePath('/clinic/staff');
  return { success: true };
}

export async function updateClinicMember(id: string, data: DbClinicMemberUpdate) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('clinic_members').update(data).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/clinic/staff');
  return { success: true };
}

export async function removeClinicMember(id: string) {
  const supabase = await createServerSupabase();

  const { data: member, error } = await supabase
    .from('clinic_members')
    .delete()
    .eq('id', id)
    .select('user_id, clinic_id')
    .single();

  if (error) return { error: error.message };

  if (member?.user_id && member.clinic_id) {
    // clinic_members has no email column — look up from profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', member.user_id)
      .maybeSingle();

    if (profile?.email) {
      await supabase.from('pending_invitations').delete().eq('email', profile.email).eq('clinic_id', member.clinic_id);
    }
    await supabase.from('doctors').delete().eq('user_id', member.user_id).eq('clinic_id', member.clinic_id);
  }

  revalidatePath('/clinic/staff');
  return { success: true };
}

export async function updateClinic(id: string, data: DbClinicUpdate) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('clinics').update(data).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/clinic');
  revalidatePath('/clinic/staff');
  revalidatePath('/clinic/departments');
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
  googlePlaceId?: string;
  googlePlaceData?: GooglePlaceData;
}) {
  const supabase = await createServerSupabase();
  const { userId, clinicId, name, email, primarySpecialization, consultationFee, bio, googlePlaceId, googlePlaceData } = params;

  const { error } = await supabase.from('doctors').insert({
    user_id: userId,
    clinic_id: clinicId,
    name,
    email,
    primary_specialization: primarySpecialization || null,
    phone: null,
    is_active: true,
    google_place_id: googlePlaceId || null,
    google_place_data: (googlePlaceData ?? null) as unknown as Json | null,
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
  googlePlaceId?: string;
  googlePlaceData?: GooglePlaceData;
  userId: string;
  departments: string[];
  isDoctor: boolean;
  selectedDepartment?: string;
  consultationFee?: number;
  invitedDoctorEmail?: string;
  userName?: string;
  userEmail?: string;
}) {
  const supabase = await createServerSupabase();

  // Ensure profile row exists so clinic_members FK doesn't fail.
  // Only include phone when a value is provided — otherwise upsert overwrites
  // an existing phone with null, breaking isProfileComplete on the next layout render.
  const profileUpsert: DbProfileInsert = {
    id: params.userId,
    name: params.userName || params.userEmail || '',
    email: params.userEmail || '',
    updated_at: new Date().toISOString(),
  };
  if (params.userPhone) {
    profileUpsert.phone = params.userPhone;
  }
  await supabase.from('profiles').upsert(profileUpsert, { onConflict: 'id' });

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
      google_place_id: params.googlePlaceId || null,
      google_place_data: (params.googlePlaceData ?? null) as unknown as Json | null,
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
      const match = insertedDepartments.find(
        (dept) => dept.department_type_id === params.selectedDepartment,
      );
      if (match) userDepartmentId = match.id;
    }
  }

  // Auto-create clinic_department if doctor picked a department not in step 2
  if (params.isDoctor && params.selectedDepartment && !userDepartmentId) {
    const { data: newDept, error: newDeptError } = await supabase
      .from('clinic_departments')
      .insert({
        clinic_id: createdClinicId,
        department_type_id: params.selectedDepartment,
      })
      .select('id')
      .single();
    if (!newDeptError && newDept) {
      userDepartmentId = newDept.id;
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

    if (params.invitedDoctorEmail) {
      await supabase.functions.invoke('invite-member', {
        body: {
          memberData: {
            email: params.invitedDoctorEmail,
            name: params.invitedDoctorEmail,
            role: 'doctor',
            clinic_id: createdClinicId,
          },
        },
      });
    }
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

export async function getLatestClinicInviteLink(clinicId: string) {
  const supabase = await createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { link: null };

  const { data: member } = await supabase
    .from('clinic_members')
    .select('role')
    .eq('user_id', session.user.id)
    .eq('clinic_id', clinicId)
    .maybeSingle();

  if (!member || member.role !== 'superadmin') return { link: null };

  const { data: invitation } = await supabase
    .from('pending_invitations')
    .select('invitation_token, email')
    .eq('clinic_id', clinicId)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!invitation) return { link: null };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://doxxy.app';
  const link = `${siteUrl}/auth?token=${invitation.invitation_token}&type=invite&email=${encodeURIComponent(invitation.email)}`;

  return { link };
}
