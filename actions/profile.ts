// actions/profile.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/integrations/supabase/server';
import type { DbDoctorUpdate } from '@/types/core';

export async function updateProfile(profileData: {
  full_name?: string;
  avatar_url?: string;
}) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase.auth.updateUser({ data: profileData });
  if (error) return { error: error.message };

  revalidatePath('/profile');
  revalidatePath('/clinic/staff');
  return { success: true };
}

const IDENTITY_BOUND_FIELDS = ['signature', 'google_place_id', 'google_place_data'] as const;

export async function updateDoctorProfile(doctorId: string, data: DbDoctorUpdate) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: doctor } = await supabase
    .from('doctors')
    .select('user_id, clinic_id')
    .eq('id', doctorId)
    .single();
  if (!doctor) return { error: 'Doctor not found' };

  const isSelf = doctor.user_id === user.id;

  if (!isSelf) {
    const { data: member } = await supabase
      .from('clinic_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('clinic_id', doctor.clinic_id)
      .maybeSingle();

    if (!member || member.role !== 'superadmin') {
      return { error: 'Unauthorized' };
    }

    for (const field of IDENTITY_BOUND_FIELDS) {
      if ((data as Record<string, unknown>)[field] !== undefined) {
        return { error: `Only the doctor can update their ${field.replace(/_/g, ' ')}` };
      }
    }
  }

  const { error } = await supabase
    .from('doctors')
    .update(data)
    .eq('id', doctorId);

  if (error) return { error: error.message };

  revalidatePath('/profile');
  revalidatePath('/clinic/staff');
  return { success: true };
}

export async function upsertProfile(params: {
  userId: string;
  name: string;
  phone: string | null;
  avatarUrl?: string;
  email?: string;
}) {
  const supabase = await createServerSupabase();
  const { userId, name, phone, avatarUrl, email } = params;

  if (phone) {
    await supabase.auth.updateUser({ data: { phone } });
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      name,
      phone: phone || null,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error && error.code === 'PGRST116') {
    const { error: insertError } = await supabase.from('profiles').insert({
      id: userId,
      name,
      phone: phone || null,
      email,
      avatar_url: avatarUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (insertError) return { error: insertError.message };
  } else if (error) {
    return { error: error.message };
  }

  revalidatePath('/profile');
  revalidatePath('/clinic/staff');
  return { success: true };
}

interface UpdateProfileInput {
  name: string;
  phone: string;
  profilePhoto: File | null;
  currentAvatarUrl?: string;
  userEmail?: string;
}

export async function updateProfileEditor(params: {
  userId: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  userEmail?: string;
  activeClinicId?: string;
  signature?: string;
}) {
  const supabase = await createServerSupabase();
  const { userId, name, phone, avatarUrl, userEmail, activeClinicId, signature } = params;

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      name,
      avatar_url: avatarUrl,
    },
  });
  if (authError) return { error: authError.message };

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  const profileData = {
    name,
    phone: phone || null,
    email: userEmail || null,
    avatar_url: avatarUrl,
    updated_at: new Date().toISOString(),
  };

  if (!existingProfile) {
    const { error } = await supabase.from('profiles').insert({
      id: userId,
      created_at: new Date().toISOString(),
      ...profileData,
    });
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId);
    if (error) return { error: error.message };
  }

  const { data: doctorProfile } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (doctorProfile) {
    const { error } = await supabase
      .from('doctors')
      .update({
        name,
        phone: phone || null,
        signature: signature ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
    if (error) return { error: error.message };
  }

  revalidatePath('/profile');
  if (activeClinicId) revalidatePath('/clinic/staff');
  return { success: true };
}
