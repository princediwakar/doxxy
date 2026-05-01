"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useDoctorDashboardData } from "@/hooks/useDoctorDashboardData";
import { useHasDoctorProfile } from "@/hooks/useHasDoctorProfile";
import { DashboardStatsCard } from "@/components/dashboard/DashboardStatsCard";
import { WeeklyAppointmentsChart } from "@/components/dashboard/WeeklyAppointmentsChart";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/loading";
import { Users, CalendarCheck, Clock, Activity, Heart } from "lucide-react";

export function AnalyticsPage() {
  const { activeClinic, activeClinicRole, loading: authLoading } = useAuth();
  const { data: hasDoctorProfile, isLoading: isDoctorProfileLoading } = useHasDoctorProfile();
  const { data: doctorData, isLoading: isDoctorLoading } = useDoctorDashboardData(
    hasDoctorProfile !== false
  );
  const { data: dashboardData, isLoading, error } = useDashboardData();

  const chartAppointments = dashboardData?.all_relevant_appointments ?? [];

  if (authLoading || !activeClinic || !activeClinicRole) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Spinner size="xl" />
      </div>
    );
  }

  if (isLoading || isDoctorLoading || isDoctorProfileLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                <div className="h-8 bg-muted rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-destructive">Error Loading Analytics</h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  const isEnhanced = hasDoctorProfile && doctorData;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Overview</h2>
        <p className="text-sm text-muted-foreground">
          {isEnhanced
            ? "Clinic overview and your personal practice analytics."
            : "Clinic-wide analytics and appointment trends."}
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardStatsCard
            icon={<Users size={18} className="mr-2 text-medical-blue" />}
            label="Total Patients"
            value={dashboardData?.total_patients ?? 0}
          />
          <DashboardStatsCard
            icon={<CalendarCheck size={18} className="mr-2 text-success" />}
            label="Total Appointments"
            value={dashboardData?.total_appointments ?? 0}
          />
          <DashboardStatsCard
            icon={<Clock size={18} className="mr-2 text-warning" />}
            label="Today's Appointments"
            value={dashboardData?.appointments_today ?? 0}
          />
          <DashboardStatsCard
            icon={<Activity size={18} className="mr-2 text-medical-teal" />}
            label="Completed Consultations"
            value={dashboardData?.completed_consultations ?? 0}
          />
        </div>
      </div>

      {isEnhanced && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-accent" />
            <h3 className="text-lg font-medium">My Practice</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardStatsCard
              icon={<Users size={18} className="mr-2 text-medical-blue" />}
              label="My Patients"
              value={doctorData.total_patients ?? 0}
            />
            <DashboardStatsCard
              icon={<CalendarCheck size={18} className="mr-2 text-primary" />}
              label="My Appointments"
              value={doctorData.total_appointments ?? 0}
            />
            <DashboardStatsCard
              icon={<Clock size={18} className="mr-2 text-warning" />}
              label="Pending Consultations"
              value={doctorData.pending_consultations ?? 0}
            />
            <DashboardStatsCard
              icon={<Activity size={18} className="mr-2 text-success" />}
              label="Completed Consultations"
              value={doctorData.completed_consultations ?? 0}
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-medium">This Week's Appointments</h3>
        <WeeklyAppointmentsChart appointments={chartAppointments} />
      </div>
    </div>
  );
}
