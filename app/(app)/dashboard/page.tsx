"use client";
import { logger } from "@/lib/logger";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  CalendarCheck,
  Users,
  Stethoscope,
  Activity,
  Clock,
  Building2,
  Heart,
  Plus,
} from "lucide-react";
import { UpcomingAppointmentsList } from "@/components/dashboard/UpcomingAppointmentsList";
import { formatTimeIST } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  DatabaseAppointment,
} from "@/types/dashboard";
import { AppointmentData } from "@/types/patients";
import DoctorDashboard from "@/components/role/DoctorDashboard";
import { WeeklyAppointmentsChart } from "@/components/dashboard/WeeklyAppointmentsChart";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DashboardStatsCard } from "@/components/dashboard/DashboardStatsCard";
import React, { useState, useMemo } from "react";
import { AppointmentStatus, AppointmentType } from "@/types/core";
import { Button } from "@/components/ui/button";
import { AppointmentModal } from "@/components/appointments/AppointmentModal";
import { Suspense, lazy } from "react";
import { useHasDoctorProfile } from "@/hooks/useHasDoctorProfile";
import { useDoctorDashboardData } from "@/hooks/useDoctorDashboardData";
import { useDashboardData } from "@/hooks/useDashboardData";

// Lazy load heavy components
const ConsultationViewModal = lazy(() =>
  import("@/components/consultation/ConsultationViewModal").then((module) => ({
    default: module.ConsultationViewModal,
  }))
);

const Dashboard = React.memo(() => {
  const {
    activeClinic,
    user,
    activeClinicRole,
    loading: authLoading,
    profileName,
  } = useAuth();
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  // Pagination state for upcoming appointments
  const [currentUpcomingPage, setCurrentUpcomingPage] = useState(1);
  const appointmentsPerPage = 5;

  // State for appointment modal
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  // State for consultation view modal
  const [isConsultationViewModalOpen, setIsConsultationViewModalOpen] =
    useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentData | null>(null);

  const { data: hasDoctorProfile, isLoading: isDoctorProfileLoading } =
    useHasDoctorProfile();

  const {
    data: doctorDashboardData,
    isLoading: isDoctorLoading,
    error: doctorError,
  } = useDoctorDashboardData(hasDoctorProfile !== false);

  const {
    data: dashboardData,
    isLoading,
    error,
  } = useDashboardData();

  // Greeting logic - memoized
  const greeting = useMemo(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good morning";
      if (hour < 18) return "Good afternoon";
      return "Good evening";
    };
    const userName = profileName || user?.email || "there";
    return `${getGreeting()}, ${userName}`;
  }, [profileName, user?.email]);

  // Prepare appointments data with proper fallbacks - memoized
  const allAppointments: DatabaseAppointment[] =
    dashboardData?.all_relevant_appointments ?? [];
  const doctorAppointments: DatabaseAppointment[] =
    doctorDashboardData?.upcoming_appointments ?? [];

  // Enhanced logic for superadmins: show both clinic-wide and personal stats if applicable
  const isEnhancedSuperadmin =
    activeClinicRole === "superadmin" &&
    hasDoctorProfile &&
    doctorDashboardData;

  // Use doctor appointments for chart if superadmin has doctor profile, otherwise use clinic-wide
  const chartAppointments = isEnhancedSuperadmin
    ? doctorAppointments
    : allAppointments;

  // Use the same logic for upcoming appointments list
  const appointmentsForList = isEnhancedSuperadmin
    ? doctorAppointments
    : allAppointments;

  const upcomingAppointments = useMemo(() => {
    logger.log("Dashboard appointments for chart:", chartAppointments);

    return appointmentsForList
      .filter((apt) => apt.date >= today)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      })
      .map((apt) => ({
        id: apt.id,
        patient: apt.patient_name,
        doctor: apt.doctor_name,
        time: apt.time,
        date: apt.date,
        status: apt.status as AppointmentStatus,
        type: apt.type as AppointmentType,
      }));
  }, [appointmentsForList, today, chartAppointments]);

  // Guard: Only render dashboard when activeClinic and activeClinicRole are defined and not loading
  if (authLoading || !activeClinic || !activeClinicRole) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || doctorError) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2 text-destructive">
              Error Loading Dashboard
            </h2>
            <p className="text-muted-foreground">
              {(error || doctorError)?.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || isDoctorLoading || isDoctorProfileLoading) {
    return (
      <div className="space-y-6 ">
        {user ? (
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">{greeting}</h1>
            <div className="h-4 w-96 bg-muted/50 rounded animate-pulse" />
          </div>
        ) : (
          <div className="h-8 w-64 bg-muted rounded animate-pulse mb-6" />
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // For pure doctor role, use the dedicated DoctorDashboard component
  if (activeClinicRole === "doctor") {
    return <DoctorDashboard />;
  }

  const totalUpcomingPages = Math.max(
    1,
    Math.ceil(upcomingAppointments.length / appointmentsPerPage)
  );

  // Appointment row click handler
  const handleAppointmentClick = (appointmentId: string) => {
    // Find the appointment in the original database appointments data
    const appointment = appointmentsForList.find(
      (apt) => apt.id === appointmentId
    );
    if (appointment) {
      // Convert DatabaseAppointment to the structure expected by ConsultationViewModal
      const appointmentForModal: AppointmentData = {
        id: appointment.id,
        patient_id: appointment.patient_id,
        doctor_id: appointment.doctor_id,
        clinic_id: appointment.clinic_id,
        date: appointment.date,
        time: formatTimeIST(appointment.time),
        type: appointment.type,
        status: appointment.status,
        patient_name: appointment.patient_name,
        doctor_name: appointment.doctor_name,
        department_name: "", // Not available here, but required for the modal
        created_at: new Date().toISOString(), // Not available, provide a placeholder
        notes: undefined,
      };
      setSelectedAppointment(appointmentForModal);
      setIsConsultationViewModalOpen(true);
    } else {
      toast.error("Appointment not found");
    }
  };

  // Weekly chart bar click handler
  const handleChartBarClick = (date: string) => {
    router.push(`/appointments?filter=date&date=${date}`);
  };

  // Handle new appointment
  const handleNewAppointment = () => {
    setIsAppointmentModalOpen(true);
  };

  return (
    <div className="space-y-6 ">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
            <Activity size={18} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{greeting}</h1>
            <p className="text-muted-foreground">
              {isEnhancedSuperadmin
                ? "Complete overview of clinic operations and your personal practice."
                : "Here's a quick overview of your clinic's activity today."}
            </p>
          </div>
        </div>
        <div className="flex gap-4 shrink-0">
          {/* Show New Appointment button for Doctors, Staff and Superadmins */}
          {(activeClinicRole === "staff" ||
            activeClinicRole === "superadmin" ||
            activeClinicRole === "doctor") && (
            <Button
              onClick={handleNewAppointment}
              className="bg-primary text-primary-foreground hover:bg-primary/90 "
            >
              <Plus size={18} className="mr-2" />
              New Appointment
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced Stats Grid for Superadmins */}
      {isEnhancedSuperadmin ? (
        <>
          {/* Clinic-wide Stats Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <Building2 size={18} className="text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Clinic Overview
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardStatsCard
                icon={<Users size={18} className="mr-2 text-medical-blue" />}
                label="Total Patients"
                value={dashboardData?.total_patients ?? 0}
                ariaLabel="View All Patients"
              />
              <DashboardStatsCard
                icon={
                  <Stethoscope size={18} className="mr-2 text-medical-teal" />
                }
                label="Total Doctors"
                value={dashboardData?.total_doctors ?? 0}
                ariaLabel="Manage Clinic Members"
              />
              <DashboardStatsCard
                icon={<CalendarCheck size={18} className="mr-2 text-success" />}
                label="Total Appointments"
                value={dashboardData?.total_appointments ?? 0}
                ariaLabel="View All Appointments"
              />
              <DashboardStatsCard
                icon={<Clock size={18} className="mr-2 text-warning" />}
                label="Today's Appointments"
                value={dashboardData?.appointments_today ?? 0}
                ariaLabel="View Today's Appointments"
              />
            </div>
          </div>

          {/* Personal Doctor Stats Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10">
                <Heart size={18} className="text-accent" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                My Practice
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardStatsCard
                icon={<Users size={18} className="mr-2 text-medical-blue" />}
                label="My Patients"
                value={doctorDashboardData?.total_patients ?? 0}
                ariaLabel="View My Patients"
              />
              <DashboardStatsCard
                icon={<CalendarCheck size={18} className="mr-2 text-primary" />}
                label="My Appointments"
                value={doctorDashboardData?.total_appointments ?? 0}
                ariaLabel="View My Appointments"
              />
              <DashboardStatsCard
                icon={<Clock size={18} className="mr-2 text-warning" />}
                label="Pending Consultations"
                value={doctorDashboardData?.pending_consultations ?? 0}
                ariaLabel="View Pending Consultations"
              />
              <DashboardStatsCard
                icon={<Activity size={18} className="mr-2 text-success" />}
                label="Completed Consultations"
                value={doctorDashboardData?.completed_consultations ?? 0}
                ariaLabel="View Completed Consultations"
              />
            </div>
          </div>
        </>
      ) : (
        /* Standard Stats Grid for Staff/Admin */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardStatsCard
            icon={<Users size={18} className="mr-2 text-medical-blue" />}
            label="Total Patients"
            value={dashboardData?.total_patients ?? 0}
            ariaLabel="View Patients"
          />
          <DashboardStatsCard
            icon={<Stethoscope size={18} className="mr-2 text-primary" />}
            label="Total Appointments"
            value={dashboardData?.total_appointments ?? 0}
            ariaLabel="View Appointments"
          />
          <DashboardStatsCard
            icon={<CalendarCheck size={18} className="mr-2 text-warning" />}
            label="Pending Consultations"
            value={dashboardData?.pending_consultations ?? 0}
            ariaLabel="View Pending Consultations"
          />
          <DashboardStatsCard
            icon={<Activity size={18} className="mr-2 text-success" />}
            label="Completed Consultations"
            value={dashboardData?.completed_consultations ?? 0}
            ariaLabel="View Completed Consultations"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingAppointmentsList
          upcomingAppointments={upcomingAppointments}
          loading={isLoading}
          appointmentsPerPage={appointmentsPerPage}
          currentPage={currentUpcomingPage}
          setCurrentPage={setCurrentUpcomingPage}
          totalPages={totalUpcomingPages}
          onAppointmentClick={handleAppointmentClick}
          showViewAllButton={true}
          onViewAll={() => router.push("/appointments?filter=upcoming")}
        />
        <WeeklyAppointmentsChart
          appointments={chartAppointments}
          onBarClick={handleChartBarClick}
        />
      </div>

      {/* Appointment Modal */}
      <AppointmentModal
        open={isAppointmentModalOpen}
        onOpenChange={setIsAppointmentModalOpen}
        appointment={null}
        patient={null}
      />

      {/* Consultation View Modal */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        }
      >
        <ConsultationViewModal
          open={isConsultationViewModalOpen}
          onOpenChange={setIsConsultationViewModalOpen}
          appointment={selectedAppointment}
        />
      </Suspense>
      </div>
  );
});

export default Dashboard;