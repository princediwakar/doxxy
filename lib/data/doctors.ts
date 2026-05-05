import { cache } from 'react';
import { createServerSupabase } from '@/integrations/supabase/server';

export const getDoctorsByClinic = cache(async (clinicId: string) => {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc('get_doctors_by_clinic', {
    clinic_id: clinicId,
  });
  if (error) throw new Error(error.message);
  return data || [];
});

export const getActiveDoctors = cache(async (clinicId: string) => {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('doctors')
    .select('id, name, user_id, primary_specialization')
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .order('name');
  if (error) throw new Error(error.message);
  return data || [];
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
    }

    const { data: fallbackData, error: fallbackError } = await supabase
      .from('doctors')
      .select('id, name, primary_specialization, phone, email, bio')
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
    }));

    const doctor = transformedData.find((d) => d.id === doctorId);
    return doctor ? [doctor] : null;
  },
);
