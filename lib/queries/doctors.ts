'use server';

import { cache } from 'react';
import { createServerSupabase } from '@/integrations/supabase/server';

// --- From lib/data/fallback-doctors.ts ---

export interface FallbackDoctor {
  id: string;
  user_id: string;
  name: string;
  department_name: string;
  phone: string | null;
  email: string | null;
  bio: string | null;
  signature: string | null;
  primary_specialization: string | null;
}

async function getFallbackDoctors(clinicId: string): Promise<FallbackDoctor[]> {
  const supabase = await createServerSupabase();

  const [doctorsResult, membersResult] = await Promise.all([
    supabase
      .from('doctors')
      .select('id, user_id, name, primary_specialization, phone, email, bio, signature')
      .eq('clinic_id', clinicId)
      .eq('is_active', true),
    supabase
      .from('clinic_members')
      .select('user_id')
      .eq('clinic_id', clinicId)
      .not('department_id', 'is', null),
  ]);

  if (doctorsResult.error) throw new Error(doctorsResult.error.message);

  const deptUserIds = new Set((membersResult.data || []).map(m => m.user_id));
  return (doctorsResult.data || [])
    .filter(d => deptUserIds.has(d.user_id))
    .map(d => ({
      ...d,
      department_name: d.primary_specialization || 'General Medicine',
    }));
}

// --- From lib/data/doctors.ts ---

export const getDoctorsByClinic = cache(async (clinicId: string) => {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc('get_doctors_by_clinic', {
    clinic_id: clinicId,
  });
  if (error) throw new Error(error.message);
  return data || [];
});

export const getActiveDoctors = cache(async (clinicId: string) => {
  const data = await getDoctorsByClinic(clinicId);
  return (data || []).map(d => ({
    id: d.id,
    name: d.name,
    user_id: d.user_id,
    primary_specialization: d.department_name || null,
  }));
});

export const getDoctorForAppointment = cache(
  async (clinicId: string, doctorId: string) => {
    const supabase = await createServerSupabase();

    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'get_doctors_by_clinic',
      { clinic_id: clinicId },
    );

    if (!rpcError && rpcData) {
      const doctor = rpcData.find((d: { id: string }) => d.id === doctorId);
      if (doctor) return [doctor];
      return null;
    }

    if (rpcError) {
      const fallback = await getFallbackDoctors(clinicId);
      const doctor = fallback.find((d) => d.id === doctorId);
      return doctor ? [doctor] : null;
    }

    return null;
  },
);

// --- Existing lib/queries/doctors.ts functions ---

export async function queryCurrentDoctorDetails(clinicId: string, doctorId: string) {
  const supabase = await createServerSupabase();

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    'get_doctors_by_clinic',
    { clinic_id: clinicId },
  );

  if (!rpcError && rpcData) {
    const doctor = rpcData.find((d: { id: string }) => d.id === doctorId);
    if (doctor) return [doctor];
    return null;
  }

  if (rpcError) {
    const fallback = await getFallbackDoctors(clinicId);
    const doctor = fallback.find((d) => d.id === doctorId);
    return doctor ? [doctor] : null;
  }

  return null;
}

export async function queryCurrentDoctorByUserId(
  userId: string,
  clinicId: string,
): Promise<{
  id: string;
  name: string;
  department_name: string;
  phone?: string | null;
  email?: string | null;
  bio?: string | null;
  user_id?: string;
  signature?: string | null;
} | null> {
  const supabase = await createServerSupabase();

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    'get_doctors_by_clinic',
    { clinic_id: clinicId },
  );

  if (!rpcError && rpcData) {
    const doctor = rpcData.find(
      (d: { user_id: string }) => d.user_id === userId,
    );
    if (doctor) return doctor as unknown as ReturnType<typeof queryCurrentDoctorByUserId>;
    return null;
  }

  if (rpcError) {
    const fallback = await getFallbackDoctors(clinicId);
    const doctor = fallback.find((d) => d.user_id === userId);
    return doctor ?? null;
  }

  return null;
}
