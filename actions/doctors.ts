'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/integrations/supabase/server';

export async function quickOnboardDoctor(params: {
  name: string;
  departmentId: string;
  specialization?: string;
  consultationFee: number;
  userId: string;
  userEmail?: string | null;
  userPhone?: string | null;
  clinicId: string;
  existingDoctorProfile: boolean;
  signature?: string;
  googlePlaceId?: string;
}) {
  const supabase = await createServerSupabase();
  const {
    name,
    departmentId,
    specialization,
    consultationFee,
    userId,
    userEmail,
    userPhone,
    clinicId,
    existingDoctorProfile,
    signature,
    googlePlaceId,
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

  // 4. Update clinic member department
  const { error: deptError } = await supabase
    .from('clinic_members')
    .update({ department_id: departmentId })
    .eq('user_id', userId)
    .eq('clinic_id', clinicId);
  if (deptError) return { error: deptError.message };

  revalidatePath('/profile');
  revalidatePath('/clinic/staff');
  return { success: true };
}
