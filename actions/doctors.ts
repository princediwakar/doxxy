'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/integrations/supabase/server';
import type { GooglePlaceData } from '@/types/google-places';
import type { Json } from '@/types/core';

export async function quickOnboardDoctor(params: {
  name: string;
  departmentTypeId: string;
  specialization?: string;
  consultationFee: number;
  userId: string;
  userEmail?: string | null;
  userPhone?: string | null;
  clinicId: string;
  existingDoctorProfile: boolean;
  signature?: string;
  googlePlaceId?: string;
  googlePlaceData?: GooglePlaceData;
}) {
  const supabase = await createServerSupabase();
  const {
    name,
    departmentTypeId,
    specialization,
    consultationFee,
    userId,
    userEmail,
    userPhone,
    clinicId,
    existingDoctorProfile,
    signature,
    googlePlaceId,
    googlePlaceData,
  } = params;

  const trimmedName = name.trim();

  // 1. Upsert profile
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, phone')
    .eq('id', userId)
    .maybeSingle();

  if (!existingProfile) {
    await supabase.from('profiles').insert({
      id: userId,
      name: trimmedName,
      email: userEmail,
      created_at: new Date().toISOString(),
    });
  } else {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ name: trimmedName })
      .eq('id', userId);
    if (profileError) return { error: profileError.message };
  }

  // 2. Update auth metadata
  const { error: authError } = await supabase.auth.updateUser({
    data: { name: trimmedName },
  });
  if (authError) return { error: authError.message };

  // 3. Upsert doctor record
  const doctorData = {
    name: trimmedName,
    email: userEmail || '',
    phone: existingProfile?.phone || userPhone || '',
    primary_specialization: specialization || null,
    consultation_fee: consultationFee,
    bio: specialization
      ? `Medical professional specializing in ${specialization}`
      : 'Medical professional',
    is_active: true,
    signature: signature ?? null,
    google_place_id: googlePlaceId || null,
    google_place_data: (googlePlaceData ?? null) as unknown as Json | null,
    updated_at: new Date().toISOString(),
  };

  if (existingDoctorProfile) {
    const { error: doctorError } = await supabase
      .from('doctors')
      .update(doctorData)
      .eq('user_id', userId)
      .eq('clinic_id', clinicId);
    if (doctorError) return { error: doctorError.message };
  } else {
    const { error: doctorError } = await supabase
      .from('doctors')
      .insert({
        ...doctorData,
        user_id: userId,
        clinic_id: clinicId,
      });
    if (doctorError) return { error: doctorError.message };
  }

  // 4. Look up or create clinic_department for this department_type + clinic
  const { data: existingDept } = await supabase
    .from('clinic_departments')
    .select('id')
    .eq('clinic_id', clinicId)
    .eq('department_type_id', departmentTypeId)
    .maybeSingle();

  let clinicDepartmentId: string;
  if (existingDept) {
    clinicDepartmentId = existingDept.id;
  } else {
    const { data: newDept, error: createError } = await supabase
      .from('clinic_departments')
      .insert({ clinic_id: clinicId, department_type_id: departmentTypeId })
      .select('id')
      .single();
    if (createError || !newDept) return { error: 'Failed to create clinic department' };
    clinicDepartmentId = newDept.id;
  }

  // 5. Set clinic_members.department_id to the clinic_department.id
  const { error: deptError } = await supabase
    .from('clinic_members')
    .update({ department_id: clinicDepartmentId })
    .eq('user_id', userId)
    .eq('clinic_id', clinicId);
  if (deptError) return { error: deptError.message };

  revalidatePath('/profile');
  revalidatePath('/clinic/staff');
  return { success: true };
}
