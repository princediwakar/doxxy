'use server';

import { createServerSupabase } from '@/integrations/supabase/server';
import type {
  ClinicAnalytics,
  DoctorAnalytics,
  AggregatedDemographics,
  ProviderPerformanceRow,
  DailyBreakdown,
  AgeGroup,
  GenderSplit,
} from '@/types/dashboard';

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function parseDailyBreakdown(raw: unknown): DailyBreakdown[] {
  if (!Array.isArray(raw)) return [];
  return raw as DailyBreakdown[];
}

export async function queryClinicAnalytics(
  clinicId: string,
  startDate: string,
  endDate: string,
): Promise<ClinicAnalytics | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc('get_clinic_analytics', {
    _clinic_id: clinicId,
    _start_date: startDate,
    _end_date: endDate,
  });
  if (error) throw new Error(error.message);
  const raw = data?.[0];
  if (!raw) return null;
  return {
    total_patients_seen: raw.total_patients_seen,
    total_appointments: raw.total_appointments,
    completed: raw.completed,
    pending: raw.pending,
    no_shows: raw.no_shows,
    cancelled: raw.cancelled,
    daily_breakdown: parseDailyBreakdown(raw.daily_breakdown),
  } as ClinicAnalytics;
}

export async function queryDoctorAnalytics(
  doctorId: string,
  startDate: string,
  endDate: string,
): Promise<DoctorAnalytics | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc('get_doctor_analytics', {
    _doctor_id: doctorId,
    _start_date: startDate,
    _end_date: endDate,
  });
  if (error) throw new Error(error.message);
  const raw = data?.[0];
  if (!raw) return null;
  return {
    total_patients: raw.total_patients,
    total_appointments: raw.total_appointments,
    completed: raw.completed,
    pending: raw.pending,
    no_shows: raw.no_shows,
    cancelled: raw.cancelled,
    daily_breakdown: parseDailyBreakdown(raw.daily_breakdown),
  } as DoctorAnalytics;
}

export async function queryDemographics(
  clinicId: string,
  doctorId: string | null,
): Promise<AggregatedDemographics | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc('get_aggregated_demographics', {
    _clinic_id: clinicId,
    _doctor_id: doctorId || undefined,
  });
  if (error) throw new Error(error.message);
  const raw = data?.[0];
  if (!raw) return null;
  return {
    age_groups: (Array.isArray(raw.age_groups) ? raw.age_groups : []) as unknown as AgeGroup[],
    gender_split: (Array.isArray(raw.gender_split) ? raw.gender_split : []) as unknown as GenderSplit[],
  } as AggregatedDemographics;
}

export async function queryProviderPerformance(
  clinicId: string,
  startDate: string,
  endDate: string,
): Promise<ProviderPerformanceRow[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc('get_provider_performance_matrix', {
    _clinic_id: clinicId,
    _start_date: startDate,
    _end_date: endDate,
  });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => {
    const completed = Number(row.completed) || 0;
    const noShows = Number(row.no_shows) || 0;
    const totalBooked = Number(row.total_booked) || 0;
    return {
      doctor_id: row.doctor_id,
      doctor_name: row.doctor_name,
      total_booked: totalBooked,
      completed,
      pending: Number(row.pending) || 0,
      no_shows: noShows,
      cancelled: Number(row.cancelled) || 0,
      completion_rate: totalBooked > 0 ? Math.round((completed / totalBooked) * 100) : 0,
      no_show_rate: totalBooked > 0 ? Math.round((noShows / totalBooked) * 100) : 0,
      utilization: totalBooked > 0 ? Math.round((completed / totalBooked) * 100) : 0,
    } as ProviderPerformanceRow;
  });
}

export async function queryDoctorId(userId: string, clinicId: string): Promise<string | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', userId)
    .eq('clinic_id', clinicId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.id ?? null;
}

export async function queryDoctorDashboardData(clinicId: string, userId: string) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc('get_doctor_dashboard_data', {
    _clinic_id: clinicId,
    _user_id: userId,
  });
  if (error) throw new Error(error.message);
  return data?.[0] ?? null;
}
