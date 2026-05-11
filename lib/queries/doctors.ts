'use server';

import { createServerSupabase } from '@/integrations/supabase/server';

export async function queryCurrentDoctorDetails(clinicId: string, doctorId: string) {
  const supabase = await createServerSupabase();

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    'get_doctors_by_clinic',
    { clinic_id: clinicId },
  );

  if (!rpcError && rpcData) {
    const doctor = rpcData.find((d: { id: string }) => d.id === doctorId);
    if (doctor) return [doctor];
  }

  const { data: fallbackData, error: fallbackError } = await supabase
    .from('doctors')
    .select('id, name, primary_specialization, phone, email, bio, signature')
    .eq('clinic_id', clinicId)
    .eq('is_active', true);

  if (fallbackError) throw new Error(fallbackError.message);

  const transformedData = (fallbackData || []).map((doctor) => ({
    id: doctor.id,
    name: doctor.name,
    department_name: doctor.primary_specialization || 'General Medicine',
    phone: doctor.phone,
    email: doctor.email,
    bio: doctor.bio,
    signature: doctor.signature,
  }));

  const doctor = transformedData.find((d) => d.id === doctorId);
  return doctor ? [doctor] : null;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (doctor) return doctor as any;
    return null;
  }

  const { data, error } = await supabase
    .from('doctors')
    .select('id, name, primary_specialization, phone, email, bio, user_id, signature')
    .eq('user_id', userId)
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    ...data,
    department_name: data.primary_specialization || 'General Medicine',
  };
}
