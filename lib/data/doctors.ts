import { cache } from 'react';
import { createServerSupabase } from '@/integrations/supabase/server';
import { getFallbackDoctors } from './fallback-doctors';

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
