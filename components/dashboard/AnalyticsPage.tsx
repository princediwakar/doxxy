"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { subDays } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { DashboardStatsCard } from "@/components/dashboard/DashboardStatsCard";
import { WeeklyAppointmentsChart } from "@/components/dashboard/WeeklyAppointmentsChart";
import { DoctorPerformanceTable } from "@/components/dashboard/DoctorPerformanceTable";
import { PatientDemographics } from "@/components/dashboard/PatientDemographics";
import { Spinner } from "@/components/ui/loading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { showErrorToast } from "@/lib/error-utils";
import { Users, CalendarCheck, Clock, Activity, Heart, TrendingDown } from "lucide-react";

type Period = "7d" | "30d";

function getDateRange(period: Period) {
  const end = new Date();
  const days = period === "7d" ? 6 : 29;
  return { startDate: subDays(end, days), endDate: end };
}

export function AnalyticsPage() {
  const router = useRouter();
  const { activeClinic, activeClinicRole, loading: authLoading } = useAuth();
  const [period, setPeriod] = useState<Period>("7d");
  const { startDate, endDate } = useMemo(() => getDateRange(period), [period]);

  const {
    clinicData,
    practiceData,
    chartBreakdown,
    trends,
    demographics,
    providerPerformance,
    isLoading,
    isLoadingDemographics,
    isLoadingProviderPerformance,
    hasDoctorProfile,
    error,
  } = useAnalytics({ startDate, endDate });

  if (!authLoading && activeClinicRole === "staff") {
    router.replace("/today");
    return null;
  }

  if (authLoading || !activeClinic || !activeClinicRole) {
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

  const isDoctor = activeClinicRole === "doctor";
  const isSuperadmin = activeClinicRole === "superadmin";
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
              {isSuperadmin
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
          {/* Superadmin: Clinic-wide stat cards */}
          {isSuperadmin && clinicData && (
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

          {/* Superadmin: Chart + Demographics + Provider Table */}
          {isSuperadmin && (
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
