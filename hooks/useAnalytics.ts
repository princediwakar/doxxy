"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/query-keys";
import {
  ClinicAnalytics,
  DoctorAnalytics,
  AggregatedDemographics,
  ProviderPerformanceRow,
  DailyBreakdown,
  AgeGroup,
  GenderSplit,
  AnalyticsTrend,
  TrendDirection,
} from "@/types/dashboard";
import { useMemo } from "react";
import { subDays, differenceInDays } from "date-fns";

const supabase = getSupabase();

interface UseAnalyticsOptions {
  startDate: Date;
  endDate: Date;
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function parseDailyBreakdown(raw: unknown): DailyBreakdown[] {
  if (!Array.isArray(raw)) return [];
  return raw as DailyBreakdown[];
}

function computeTrend(
  current: number,
  previous: number
): { value: number; direction: TrendDirection; pct: number } {
  if (previous === 0) {
    return { value: 0, direction: "neutral", pct: 0 };
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  return {
    value: Math.abs(pct),
    direction: pct > 0 ? "up" : pct < 0 ? "down" : "neutral",
    pct,
  };
}

function computeMetricTrend(
  current: ClinicAnalytics | DoctorAnalytics | null | undefined,
  previous: ClinicAnalytics | DoctorAnalytics | null | undefined,
  metric: "total_appointments" | "completed" | "pending" | "no_shows" | "cancelled"
): AnalyticsTrend {
  const curr = current?.[metric] ?? 0;
  const prev = previous?.[metric] ?? 0;
  const trend = computeTrend(curr, prev);
  return {
    value: trend.value,
    direction: trend.direction,
    label: trend.pct >= 0 ? `+${trend.pct}%` : `${trend.pct}%`,
  };
}

function computeNoShowTrend(
  current: ClinicAnalytics | DoctorAnalytics | null | undefined,
  previous: ClinicAnalytics | DoctorAnalytics | null | undefined
): AnalyticsTrend {
  const trend = computeMetricTrend(current, previous, "no_shows");
  // A drop in no-shows is good → flip direction
  if (trend.direction === "up") return { ...trend, direction: "down" };
  if (trend.direction === "down") return { ...trend, direction: "up" };
  return trend;
}

export function useAnalytics({ startDate, endDate }: UseAnalyticsOptions) {
  const { activeClinic, user, activeClinicRole } = useAuth();

  const daysDiff = differenceInDays(endDate, startDate);
  const previousStartDate = subDays(startDate, daysDiff + 1);
  const previousEndDate = subDays(startDate, 1);

  const clinicId = activeClinic?.clinic_id ?? "";
  const isDoctor = activeClinicRole === "doctor";
  const isSuperadmin = activeClinicRole === "superadmin";

  // Resolve doctor_id for the current user
  const { data: doctorId } = useQuery({
    queryKey: ["doctorId", user?.id, clinicId],
    queryFn: async () => {
      if (!user?.id || !clinicId) return null;
      const { data, error } = await supabase
        .from("doctors")
        .select("id")
        .eq("user_id", user.id)
        .eq("clinic_id", clinicId)
        .maybeSingle();
      if (error) throw error;
      return data?.id ?? null;
    },
    enabled: !!user?.id && !!clinicId && (isDoctor || isSuperadmin),
    staleTime: 5 * 60 * 1000,
  });

  const hasDoctorProfile = !!doctorId;

  // --- Clinic Analytics (current period, superadmin only) ---
  const {
    data: clinicCurrent,
    isLoading: clinicCurrentLoading,
    error: clinicCurrentError,
  } = useQuery({
    queryKey: queryKeys.dashboard.analytics(
      clinicId,
      formatDate(startDate),
      formatDate(endDate)
    ),
    queryFn: async () => {
      if (!clinicId) return null;
      const { data, error } = await supabase.rpc("get_clinic_analytics", {
        _clinic_id: clinicId,
        _start_date: formatDate(startDate),
        _end_date: formatDate(endDate),
      });
      if (error) throw error;
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
    },
    enabled: !!clinicId && isSuperadmin,
    staleTime: 5 * 60 * 1000,
  });

  // --- Clinic Analytics (previous period, superadmin only) ---
  const { data: clinicPrevious } = useQuery({
    queryKey: queryKeys.dashboard.analytics(
      clinicId,
      formatDate(previousStartDate),
      formatDate(previousEndDate)
    ),
    queryFn: async () => {
      if (!clinicId) return null;
      const { data, error } = await supabase.rpc("get_clinic_analytics", {
        _clinic_id: clinicId,
        _start_date: formatDate(previousStartDate),
        _end_date: formatDate(previousEndDate),
      });
      if (error) throw error;
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
    },
    enabled: !!clinicId && isSuperadmin,
    staleTime: 5 * 60 * 1000,
  });

  // --- Doctor Analytics (current period) ---
  const {
    data: doctorCurrent,
    isLoading: doctorCurrentLoading,
    error: doctorCurrentError,
  } = useQuery({
    queryKey: queryKeys.dashboard.doctorAnalytics(
      doctorId ?? "",
      formatDate(startDate),
      formatDate(endDate)
    ),
    queryFn: async () => {
      if (!doctorId) return null;
      const { data, error } = await supabase.rpc("get_doctor_analytics", {
        _doctor_id: doctorId,
        _start_date: formatDate(startDate),
        _end_date: formatDate(endDate),
      });
      if (error) throw error;
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
    },
    enabled: !!doctorId && (isDoctor || isSuperadmin),
    staleTime: 5 * 60 * 1000,
  });

  // --- Doctor Analytics (previous period) ---
  const { data: doctorPrevious } = useQuery({
    queryKey: queryKeys.dashboard.doctorAnalytics(
      doctorId ?? "",
      formatDate(previousStartDate),
      formatDate(previousEndDate)
    ),
    queryFn: async () => {
      if (!doctorId) return null;
      const { data, error } = await supabase.rpc("get_doctor_analytics", {
        _doctor_id: doctorId,
        _start_date: formatDate(previousStartDate),
        _end_date: formatDate(previousEndDate),
      });
      if (error) throw error;
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
    },
    enabled: !!doctorId && (isDoctor || isSuperadmin),
    staleTime: 5 * 60 * 1000,
  });

  // --- Demographics ---
  const {
    data: demographics,
    isLoading: demographicsLoading,
  } = useQuery({
    queryKey: queryKeys.dashboard.demographics(clinicId, doctorId ?? null),
    queryFn: async () => {
      if (!clinicId) return null;
      const { data, error } = await supabase.rpc(
        "get_aggregated_demographics",
        {
          _clinic_id: clinicId,
          _doctor_id: doctorId || undefined,
        }
      );
      if (error) throw error;
      const raw = data?.[0];
      if (!raw) return null;
      return {
        age_groups: (Array.isArray(raw.age_groups) ? raw.age_groups : []) as unknown as AgeGroup[],
        gender_split: (Array.isArray(raw.gender_split) ? raw.gender_split : []) as unknown as GenderSplit[],
      } as AggregatedDemographics;
    },
    enabled: !!clinicId && (isDoctor || (isSuperadmin && hasDoctorProfile)),
    staleTime: 5 * 60 * 1000,
  });

  // --- Provider Performance Matrix (superadmin only) ---
  const {
    data: providerPerformance,
    isLoading: providerPerformanceLoading,
  } = useQuery({
    queryKey: queryKeys.dashboard.providerPerformance(
      clinicId,
      formatDate(startDate),
      formatDate(endDate)
    ),
    queryFn: async () => {
      if (!clinicId) return [];
      const { data, error } = await supabase.rpc(
        "get_provider_performance_matrix",
        {
          _clinic_id: clinicId,
          _start_date: formatDate(startDate),
          _end_date: formatDate(endDate),
        }
      );
      if (error) throw error;
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
    },
    enabled: !!clinicId && isSuperadmin,
    staleTime: 5 * 60 * 1000,
  });

  // --- Compute Trends ---
  const trends = useMemo(() => {
    const source = isDoctor ? doctorCurrent : clinicCurrent;
    const prev = isDoctor ? doctorPrevious : clinicPrevious;
    if (!source) return null;

    return {
      totalAppointments: computeMetricTrend(source, prev, "total_appointments"),
      completed: computeMetricTrend(source, prev, "completed"),
      pending: computeMetricTrend(source, prev, "pending"),
      noShows: computeNoShowTrend(source, prev),
      cancelled: computeMetricTrend(source, prev, "cancelled"),
    };
  }, [isDoctor, clinicCurrent, doctorCurrent, clinicPrevious, doctorPrevious]);

  const analyticsData = isDoctor ? doctorCurrent : clinicCurrent;
  const chartBreakdown = analyticsData?.daily_breakdown ?? [];
  const isLoading =
    (isSuperadmin && clinicCurrentLoading) ||
    ((isDoctor || (isSuperadmin && hasDoctorProfile)) && doctorCurrentLoading);

  return {
    clinicData: clinicCurrent as ClinicAnalytics | null | undefined,
    practiceData: (isDoctor ? doctorCurrent : hasDoctorProfile ? doctorCurrent : null) as DoctorAnalytics | null | undefined,
    analyticsData,
    chartBreakdown,
    trends,
    demographics,
    providerPerformance,
    isLoading,
    isLoadingDemographics: demographicsLoading,
    isLoadingProviderPerformance: providerPerformanceLoading,
    hasDoctorProfile,
    error: clinicCurrentError || doctorCurrentError,
  };
}
