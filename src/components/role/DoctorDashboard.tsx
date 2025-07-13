import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Users, Stethoscope, Activity, Clock, User, Plus } from "lucide-react";
import { UpcomingAppointmentsList } from "@/components/dashboard/UpcomingAppointmentsList";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { getSupabase } from '@/integrations/supabase/client';
import { FormattedAppointment, DatabaseAppointment, DoctorDashboardData, EnhancedPatientForDoctorList } from "@/types/dashboard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { WeeklyAppointmentsChart } from "@/components/dashboard/WeeklyAppointmentsChart";
import { DashboardStatsCard } from "@/components/dashboard/DashboardStatsCard";
import { useNavigate } from "react-router-dom";
import { Enums } from "@/integrations/supabase/types";
import { Button } from '@/components/ui/button';
import { AppointmentModal } from '@/components/appointments/AppointmentModal';

const supabase = getSupabase();

// Type guard to check if an object is a valid DatabaseAppointment
function isValidDatabaseAppointment(obj: unknown): obj is DatabaseAppointment {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.date === 'string' &&
    typeof o.time === 'string' &&
    typeof o.type === 'string' &&
    typeof o.status === 'string' &&
    typeof o.patient_id === 'string' &&
    typeof o.patient_name === 'string' &&
    typeof o.doctor_id === 'string' &&
    typeof o.doctor_name === 'string' &&
    typeof o.clinic_id === 'string'
  );
}

export default function DoctorDashboard() {
  const { activeClinic, user, activeClinicRole, profileName } = useAuth();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  // Pagination state for upcoming appointments
  const [currentUpcomingPage, setCurrentUpcomingPage] = useState(1);
  const appointmentsPerPage = 5;



  // Doctor-specific dashboard query
  const { data: doctorDashboardData, isLoading, error } = useQuery<DoctorDashboardData | null>({
    queryKey: ['doctorDashboardData', activeClinic?.clinic_id, user?.id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id || !user?.id || (activeClinicRole !== 'doctor' && activeClinicRole !== 'superadmin')) return null;
      const { data, error } = await supabase.rpc('get_doctor_dashboard_data', {
        _clinic_id: activeClinic.clinic_id,
        _user_id: user.id,
      });
      if (error) throw error;
      const result = (data?.[0] ?? null) as unknown as DoctorDashboardData | null;
      if (result) {
        // Ensure JSON fields are arrays, fallback to empty arrays if invalid
        result.upcoming_appointments = Array.isArray(result.upcoming_appointments)
          ? result.upcoming_appointments.filter(isValidDatabaseAppointment)
          : [];
      }
      return result;
    },
    enabled: !!activeClinic?.clinic_id && !!user?.id && (activeClinicRole === 'doctor' || activeClinicRole === 'superadmin'),
    staleTime: 5 * 60 * 1000,
  });

  // Prepare appointments and patients data
  const allAppointments: DatabaseAppointment[] = doctorDashboardData?.upcoming_appointments ?? [];


  console.log("DoctorDashboard: All upcoming appointments raw:", allAppointments, "Today:", today);

  const upcomingAppointments: FormattedAppointment[] = allAppointments
    .filter(apt => apt.date >= today)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    })
    .map(apt => ({
      id: apt.id,
      patient: apt.patient_name,
      doctor: apt.doctor_name,
      time: apt.time,
      date: apt.date,
      status: apt.status as Enums<'appointment_status'>,
      type: apt.type as Enums<'appointment_type'>,
    }));

  const totalUpcomingPages = Math.max(1, Math.ceil(upcomingAppointments.length / appointmentsPerPage));


  // Greeting logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  const userName = profileName || user?.email || "there";
  const greeting = `${getGreeting()}, ${userName}`;

  // Card click handlers
  const handlePatientsCardClick = () => navigate('/patients');
  const handleAppointmentsTodayCardClick = () => navigate('/appointments?filter=today');
  const handlePendingConsultationsCardClick = () => navigate('/appointments?filter=pending');
  const handleCompletedConsultationsCardClick = () => navigate('/consultations?filter=completed');

  // Weekly chart bar click handler
  const handleChartBarClick = (date: string) => {
    navigate(`/appointments?filter=date&date=${date}`);
  };

  // Calculate some additional stats
  const completionRate = doctorDashboardData?.total_appointments 
    ? ((doctorDashboardData.completed_consultations / doctorDashboardData.total_appointments) * 100).toFixed(1)
    : '0';

  // Handle new appointment
  const handleNewAppointment = () => {
    setIsAppointmentModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {user ? (
          <h2 className="text-2xl font-semibold mb-6">{greeting}</h2>
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

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2 text-destructive">Error Loading Dashboard</h2>
            <p className="text-muted-foreground">{error.message}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Please ensure you have a doctor profile set up for this clinic.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">{greeting}</h1>
          <p className="text-muted-foreground">Review your appointments and patient updates for today.</p>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={handleNewAppointment}
            className="bg-primary text-primary-foreground hover:bg-primary/90 "
          >
            <Plus size={18} className="mr-2" />
            New Appointment
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <DashboardStatsCard
          icon={<Users size={18} className="mr-2 text-primary" />}
          label="My Patients"
          value={doctorDashboardData?.total_patients ?? 0}
          ariaLabel="View My Patients"
          onClick={handlePatientsCardClick}
          description={`Active patient relationships`}
        />
        <DashboardStatsCard
          icon={<Stethoscope size={18} className="mr-2 text-primary" />}
          label="Total Appointments"
          value={doctorDashboardData?.total_appointments ?? 0}
          ariaLabel="View My Appointments"
          onClick={handleAppointmentsTodayCardClick}
          description={`${completionRate}% completion rate`}
        />
        <DashboardStatsCard
          icon={<Clock size={18} className="mr-2 text-warning" />}
          label="Pending Consultations"
          value={doctorDashboardData?.pending_consultations ?? 0}
          ariaLabel="View Pending Consultations"
          onClick={handlePendingConsultationsCardClick}
          variant={doctorDashboardData?.pending_consultations ? "secondary" : "default"}
        />
        <DashboardStatsCard
          icon={<Activity size={18} className="mr-2 text-success" />}
          label="Completed Consultations"
          value={doctorDashboardData?.completed_consultations ?? 0}
          ariaLabel="View Completed Consultations"
          onClick={handleCompletedConsultationsCardClick}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingAppointmentsList 
          upcomingAppointments={upcomingAppointments} 
          loading={isLoading} 
          appointmentsPerPage={appointmentsPerPage}
          currentPage={currentUpcomingPage}
          setCurrentPage={setCurrentUpcomingPage}
          totalPages={totalUpcomingPages}
          showViewAllButton={true}
          onViewAll={() => navigate('/appointments?filter=upcoming')}
        />
        <WeeklyAppointmentsChart appointments={allAppointments} onBarClick={handleChartBarClick} />
      </div>
      <AppointmentModal
        open={isAppointmentModalOpen}
        onOpenChange={setIsAppointmentModalOpen}
        appointment={null}
        patient={null}
      />
    </div>
  );
}