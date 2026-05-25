// lib/auth-server.ts
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/integrations/supabase/server';
import type { ClinicMemberWithClinic, DbClinic } from '@/types/core';

export const getAuthenticatedUser = cache(async () => {
  const supabase = await createServerSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/auth');
  }

  return user;
});

function mapClinicMember(member: Record<string, unknown>): ClinicMemberWithClinic {
  return {
    id: member.member_id as string,
    user_id: member.member_user_id as string,
    clinic_id: member.clinic_id as string,
    role: member.role as ClinicMemberWithClinic['role'],
    department_id: member.department_id as string | null,
    created_at: member.created_at as string,
    clinics: member.clinic_data as unknown as DbClinic,
    clinic_name: (member.clinic_data as Record<string, unknown>)?.name as string | undefined,
    joined_at: member.created_at as string,
  };
}

export const getUserClinics = cache(async (userId: string) => {
  const supabase = await createServerSupabase();

  const { data: members, error } = await supabase.rpc(
    'get_user_clinic_memberships',
    { user_id: userId },
  );

  if (error || !members || members.length === 0) return [];

  return (members as Record<string, unknown>[]).map(mapClinicMember);
});

export const getActiveClinic = cache(async (userId: string) => {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const activeClinicId = cookieStore.get('active-clinic-id')?.value;

  const clinics = await getUserClinics(userId);
  if (clinics.length === 0) return null;

  if (activeClinicId) {
    const match = clinics.find((c) => c.clinic_id === activeClinicId);
    if (match) return match;
  }

  return clinics[0];
});

const getProfile = cache(async (userId: string) => {
  const supabase = await createServerSupabase();
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, phone')
    .eq('id', userId)
    .maybeSingle();
  return profile;
});

export const getProfileName = cache(async (userId: string) => {
  const profile = await getProfile(userId);
  return profile?.name ?? null;
});

export const isProfileComplete = cache(async (userId: string) => {
  const profile = await getProfile(userId);
  return !!(profile?.name && profile?.phone);
});

export const isDoctorOnboardingComplete = cache(async (userId: string, clinicId: string) => {
  const supabase = await createServerSupabase();

  const [doctorResult, memberResult] = await Promise.all([
    supabase
      .from('doctors')
      .select('id')
      .eq('user_id', userId)
      .eq('clinic_id', clinicId)
      .maybeSingle(),
    supabase
      .from('clinic_members')
      .select('department_id')
      .eq('user_id', userId)
      .eq('clinic_id', clinicId)
      .maybeSingle(),
  ]);

  if (!doctorResult.data) return true;

  return memberResult.data?.department_id != null;
});
