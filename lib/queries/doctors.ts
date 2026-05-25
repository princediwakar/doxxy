'use server';

import { createServerSupabase } from '@/integrations/supabase/server';
import { getFallbackDoctors } from '@/lib/data/fallback-doctors';

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
