"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { subDays, differenceInDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useAppState } from "@/contexts/AppStateContext";
import { queryClinicAnalytics, queryDoctorAnalytics, queryDemographics, queryProviderPerformance, queryDoctorId } from "@/lib/queries/analytics";
import { DashboardStatsCard } from "@/components/dashboard/DashboardStatsCard";
import { WeeklyAppointmentsChart } from "@/components/dashboard/WeeklyAppointmentsChart";
import { DoctorPerformanceTable } from "@/components/dashboard/DoctorPerformanceTable";
import { PatientDemographics } from "@/components/dashboard/PatientDemographics";
import { Spinner } from "@/components/ui/loading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { showErrorToast } from "@/lib/error-utils";
import { Users, CalendarCheck, Clock, Activity, Heart, TrendingDown } from "lucide-react";
import type { AnalyticsTrend, TrendDirection, ClinicAnalytics, DoctorAnalytics } from "@/types/dashboard";

type Period = "7d" | "30d";

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function computeTrend(current: number, previous: number): { value: number; direction: TrendDirection; pct: number } {
  if (previous === 0) return { value: 0, direction: "neutral", pct: 0 };
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
  metric: "total_appointments" | "completed" | "pending" | "no_shows" | "cancelled",
): AnalyticsTrend {
  const curr = current?.[metric] ?? 0;
  const prev = previous?.[metric] ?? 0;
  const trend = computeTrend(curr, prev);
  return { value: trend.value, direction: trend.direction, label: trend.pct >= 0 ? `+${trend.pct}%` : `${trend.pct}%` };
}

function computeNoShowTrend(
  current: ClinicAnalytics | DoctorAnalytics | null | undefined,
  previous: ClinicAnalytics | DoctorAnalytics | null | undefined,
): AnalyticsTrend {
  const trend = computeMetricTrend(current, previous, "no_shows");
  if (trend.direction === "up") return { ...trend, direction: "down" };
  if (trend.direction === "down") return { ...trend, direction: "up" };
  return trend;
}

function getDateRange(period: Period) {
  const end = new Date();
  const days = period === "7d" ? 6 : 29;
  return { startDate: subDays(end, days), endDate: end };
}

export function AnalyticsPage() {
  const router = useRouter();
  const { activeClinicId, activeClinicRole, user } = useAppState();
  const [period, setPeriod] = useState<Period>("7d");
  const { startDate, endDate } = useMemo(() => getDateRange(period), [period]);

  const clinicId = activeClinicId ?? "";
  const isDoctor = activeClinicRole === "doctor";
  const isSuperadmin = activeClinicRole === "superadmin";
  const isStaff = activeClinicRole === "staff";

  const daysDiff = differenceInDays(endDate, startDate);
  const previousStartDate = subDays(startDate, daysDiff + 1);
  const previousEndDate = subDays(startDate, 1);

  const { data: doctorId } = useQuery({
    queryKey: ["doctorId", user?.id, clinicId],
    queryFn: () => queryDoctorId(user?.id!, clinicId),
    enabled: !!user?.id && !!clinicId && (isDoctor || isSuperadmin),
    staleTime: 5 * 60 * 1000,
  });

  const hasDoctorProfile = !!doctorId;

  const { data: clinicCurrent, isLoading: clinicCurrentLoading, error: clinicCurrentError } = useQuery({
    queryKey: ["clinicAnalytics", clinicId, formatDate(startDate), formatDate(endDate)],
    queryFn: () => queryClinicAnalytics(clinicId, formatDate(startDate), formatDate(endDate)),
    enabled: !!clinicId && (isSuperadmin || isStaff),
    staleTime: 5 * 60 * 1000,
  });

  const { data: clinicPrevious } = useQuery({
    queryKey: ["clinicAnalytics", clinicId, formatDate(previousStartDate), formatDate(previousEndDate)],
    queryFn: () => queryClinicAnalytics(clinicId, formatDate(previousStartDate), formatDate(previousEndDate)),
    enabled: !!clinicId && (isSuperadmin || isStaff),
    staleTime: 5 * 60 * 1000,
  });

  const { data: doctorCurrent, isLoading: doctorCurrentLoading, error: doctorCurrentError } = useQuery({
    queryKey: ["doctorAnalytics", doctorId, formatDate(startDate), formatDate(endDate)],
    queryFn: () => queryDoctorAnalytics(doctorId!, formatDate(startDate), formatDate(endDate)),
    enabled: !!doctorId && (isDoctor || isSuperadmin),
    staleTime: 5 * 60 * 1000,
  });

  const { data: doctorPrevious } = useQuery({
    queryKey: ["doctorAnalytics", doctorId, formatDate(previousStartDate), formatDate(previousEndDate)],
    queryFn: () => queryDoctorAnalytics(doctorId!, formatDate(previousStartDate), formatDate(previousEndDate)),
    enabled: !!doctorId && (isDoctor || isSuperadmin),
    staleTime: 5 * 60 * 1000,
  });

  const { data: demographics, isLoading: isLoadingDemographics } = useQuery({
    queryKey: ["demographics", clinicId, doctorId],
    queryFn: () => queryDemographics(clinicId!, doctorId ?? null),
    enabled: !!clinicId && (isDoctor || (isSuperadmin && hasDoctorProfile) || isStaff),
    staleTime: 5 * 60 * 1000,
  });

  const { data: providerPerformance, isLoading: isLoadingProviderPerformance } = useQuery({
    queryKey: ["providerPerformance", clinicId, formatDate(startDate), formatDate(endDate)],
    queryFn: () => queryProviderPerformance(clinicId, formatDate(startDate), formatDate(endDate)),
    enabled: !!clinicId && (isSuperadmin || isStaff),
    staleTime: 5 * 60 * 1000,
  });

  // Compute trends (from original hook logic)
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

  const clinicData = clinicCurrent;
  const practiceData = (isDoctor ? doctorCurrent : hasDoctorProfile ? doctorCurrent : null);
  const analyticsData = isDoctor ? doctorCurrent : clinicCurrent;
  const chartBreakdown = analyticsData?.daily_breakdown ?? [];
  const isLoading =
    ((isSuperadmin || isStaff) && clinicCurrentLoading) ||
    ((isDoctor || (isSuperadmin && hasDoctorProfile)) && doctorCurrentLoading);
  const error = clinicCurrentError || doctorCurrentError;

  if (!activeClinicId || !activeClinicRole) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Spinner size="xl" />
      </div>
    );
  }

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  const showClinicWide = isSuperadmin || isStaff;
  const showPractice = isDoctor || (isSuperadmin && hasDoctorProfile);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Overview</h1>
            <p className="hidden sm:block text-sm text-muted-foreground">
              {showClinicWide
                ? "Clinic-wide analytics & provider performance"
                : "Your practice analytics"}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant={period === "7d" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("7d")}
          >
            7D
          </Button>
          <Button
            variant={period === "30d" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("30d")}
          >
            30D
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                <div className="h-8 bg-muted rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Clinic-wide stat cards */}
          {showClinicWide && clinicData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <DashboardStatsCard
                icon={<Users size={18} className="text-medical-blue" />}
                label="Patients Seen"
                value={clinicData.total_patients_seen}
                trendDirection={trends?.totalAppointments?.direction}
                trendLabel={trends?.totalAppointments?.label}
              />
              <DashboardStatsCard
                icon={<CalendarCheck size={18} className="text-success" />}
                label="Appointments"
                value={clinicData.total_appointments}
                trendDirection={trends?.totalAppointments?.direction}
                trendLabel={trends?.totalAppointments?.label}
              />
              <DashboardStatsCard
                icon={<Activity size={18} className="text-medical-teal" />}
                label="Completed"
                value={clinicData.completed}
                trendDirection={trends?.completed?.direction}
                trendLabel={trends?.completed?.label}
                onClick={() => router.push("/today?status=completed")}
              />
              <DashboardStatsCard
                icon={<TrendingDown size={18} className="text-red-500" />}
                label="No-Shows"
                value={clinicData.no_shows}
                trendDirection={trends?.noShows?.direction}
                trendLabel={trends?.noShows?.label}
                onClick={() => router.push("/today?status=no-show")}
              />
              <DashboardStatsCard
                icon={<Clock size={18} className="text-warning" />}
                label="Pending"
                value={clinicData.pending}
                trendDirection={trends?.pending?.direction}
                trendLabel={trends?.pending?.label}
              />
            </div>
          )}

          {/* Doctor/Superadmin-with-profile: Practice stat cards */}
          {showPractice && practiceData && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Heart size={18} className="text-accent" />
                <h3 className="text-lg font-medium">My Practice</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <DashboardStatsCard
                  icon={<Users size={18} className="text-medical-blue" />}
                  label="My Patients"
                  value={practiceData.total_patients}
                  trendDirection={trends?.totalAppointments?.direction}
                  trendLabel={trends?.totalAppointments?.label}
                />
                <DashboardStatsCard
                  icon={<CalendarCheck size={18} className="text-success" />}
                  label="Appointments"
                  value={practiceData.total_appointments}
                  trendDirection={trends?.totalAppointments?.direction}
                  trendLabel={trends?.totalAppointments?.label}
                />
                <DashboardStatsCard
                  icon={<Activity size={18} className="text-medical-teal" />}
                  label="Completed"
                  value={practiceData.completed}
                  trendDirection={trends?.completed?.direction}
                  trendLabel={trends?.completed?.label}
                  onClick={() => router.push("/today?status=completed")}
                />
                <DashboardStatsCard
                  icon={<TrendingDown size={18} className="text-red-500" />}
                  label="No-Shows"
                  value={practiceData.no_shows}
                  trendDirection={trends?.noShows?.direction}
                  trendLabel={trends?.noShows?.label}
                  onClick={() => router.push("/today?status=no-show")}
                />
                <DashboardStatsCard
                  icon={<Clock size={18} className="text-warning" />}
                  label="Pending"
                  value={practiceData.pending}
                  trendDirection={trends?.pending?.direction}
                  trendLabel={trends?.pending?.label}
                />
              </div>
            </div>
          )}

          {/* Chart + Demographics + Provider Table */}
          {showClinicWide && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <WeeklyAppointmentsChart
                    data={chartBreakdown}
                    onBarClick={(date) => router.push(`/today?date=${date}`)}
                  />
                </div>
                <div className="lg:col-span-1">
                  <PatientDemographics data={demographics} loading={isLoadingDemographics} />
                </div>
              </div>
              <DoctorPerformanceTable
                data={providerPerformance ?? []}
                loading={isLoadingProviderPerformance}
              />
            </>
          )}

          {/* Doctor: Chart + Demographics */}
          {isDoctor && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <WeeklyAppointmentsChart
                  data={chartBreakdown}
                  onBarClick={(date) => router.push(`/today?date=${date}`)}
                />
              </div>
              <div className="lg:col-span-1">
                <PatientDemographics data={demographics} loading={isLoadingDemographics} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
