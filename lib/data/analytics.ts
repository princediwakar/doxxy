import { cache } from 'react';
import { createServerSupabase } from '@/integrations/supabase/server';

export const getClinicAnalytics = cache(
  async (clinicId: string, startDate: string, endDate: string) => {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.rpc('get_clinic_analytics', {
      _clinic_id: clinicId,
      _start_date: startDate,
      _end_date: endDate,
    });
    if (error) throw new Error(error.message);
    return data;
  },
);

export const getDoctorAnalytics = cache(
  async (doctorId: string, startDate: string, endDate: string) => {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.rpc('get_doctor_analytics', {
      _doctor_id: doctorId,
      _start_date: startDate,
      _end_date: endDate,
    });
    if (error) throw new Error(error.message);
    return data;
  },
);

export const getAggregatedDemographics = cache(
  async (clinicId: string, doctorId?: string) => {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.rpc('get_aggregated_demographics', {
      _clinic_id: clinicId,
      _doctor_id: doctorId || undefined,
    });
    if (error) throw new Error(error.message);
    return data;
  },
);

export const getProviderPerformanceMatrix = cache(
  async (clinicId: string, startDate: string, endDate: string) => {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.rpc(
      'get_provider_performance_matrix',
      {
        _clinic_id: clinicId,
        _start_date: startDate,
        _end_date: endDate,
      },
    );
    if (error) throw new Error(error.message);
    return data;
  },
);

export const getDashboardData = cache(async (clinicId: string) => {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc('get_dashboard_data', {
    _clinic_id: clinicId,
  });
  if (error) throw new Error(error.message);
  return data;
});

export const getDoctorDashboardData = cache(
  async (clinicId: string, userId: string) => {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.rpc('get_doctor_dashboard_data', {
      _clinic_id: clinicId,
      _user_id: userId,
    });
    if (error) throw new Error(error.message);
    return data;
  },
);
