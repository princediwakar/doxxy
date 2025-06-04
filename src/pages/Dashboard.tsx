import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { CalendarCheck, User, Users, Stethoscope } from "lucide-react";
import { UpcomingAppointmentsList } from "@/components/UpcomingAppointmentsList";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FormattedAppointment, DatabaseAppointment, StaffDashboardData, DoctorDashboardData } from "@/types/dashboard";
import DoctorDashboard from "@/components/role/DoctorDashboard";
import { WeeklyAppointmentsChart } from "@/components/WeeklyAppointmentsChart";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DashboardStatsCard } from "@/components/DashboardStatsCard";
import { useState } from "react";
import { Enums } from "@/integrations/supabase/types";

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

export default function Dashboard() {
  const { activeClinic, user, activeClinicRole, loading: authLoading, profileName } = useAuth();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  // Pagination state for upcoming appointments
  const [currentUpcomingPage, setCurrentUpcomingPage] = useState(1);
  const appointmentsPerPage = 5;

  // Doctor-specific dashboard query
  const { data: doctorDashboardData, isLoading: isDoctorLoading, error: doctorError } = useQuery<DoctorDashboardData | null>({
    queryKey: ['doctorDashboardData', activeClinic?.clinic_id, user?.id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id || !user?.id || activeClinicRole !== 'doctor') return null;
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
        result.my_patients = Array.isArray(result.my_patients)
          ? result.my_patients.map(p => ({
              id: p.id ?? '',
              name: p.name ?? '',
              last_visit: p.last_visit ?? undefined,
              address: p.address ?? undefined,
              clinic_id: p.clinic_id ?? undefined,
              created_at: p.created_at ?? null,
              date_of_birth: p.date_of_birth ?? null,
              email: p.email ?? '',
              gender: p.gender ?? '',
              medical_id: p.medical_id ?? '',
              phone: p.phone ?? '',
            }))
          : [];
      }
      return result;
    },
    enabled: !!activeClinic?.clinic_id && !!user?.id && activeClinicRole === 'doctor',
    staleTime: 5 * 60 * 1000,
  });

  // Clinic-wide dashboard query
  const { data: dashboardData, isLoading, error } = useQuery<StaffDashboardData | null>({
    queryKey: ['dashboardData', activeClinic?.clinic_id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id || activeClinicRole === 'doctor') return null;
      const { data, error } = await supabase.rpc('get_dashboard_data', { _clinic_id: activeClinic.clinic_id });
      if (error) throw error;
      const result = (data?.[0] ?? null) as unknown as StaffDashboardData | null;
      if (result) {
        // Ensure all_relevant_appointments is an array of valid appointments
        result.all_relevant_appointments = Array.isArray(result.all_relevant_appointments)
          ? result.all_relevant_appointments.filter(isValidDatabaseAppointment)
          : [];
      }
      return result;
    },
    enabled: !!activeClinic?.clinic_id && activeClinicRole !== 'doctor' && !authLoading,
    staleTime: 5 * 60 * 1000,
  });

  // Greeting logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  const userName = profileName || user?.email || "there";
  const greeting = `${getGreeting()}, ${userName}`;

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
            <h2 className="text-xl font-semibold mb-2 text-destructive">Error Loading Dashboard</h2>
            <p className="text-muted-foreground">{(error || doctorError)?.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || isDoctorLoading) {
    return (
      <div className="space-y-6">
        {user ? (
          <h2 className="text-2xl font-semibold mb-6">{greeting}</h2>
        ) : (
          <div className="h-8 w-64 bg-muted rounded animate-pulse mb-6" />
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

  if (activeClinicRole === 'doctor') {
    return <DoctorDashboard />;
  }

  // Prepare appointments data
  const allAppointments: DatabaseAppointment[] = dashboardData?.all_relevant_appointments ?? [];
  console.log('All appointments for chart:', allAppointments);

  const todaysAppointments: FormattedAppointment[] = allAppointments
    .filter(apt => apt.date === today)
    .sort((a, b) => b.time.localeCompare(a.time))
    .map(apt => ({
      id: apt.id,
      patient: apt.patient_name,
      doctor: apt.doctor_name,
      time: apt.time,
      date: apt.date,
      status: apt.status as Enums<'appointment_status'>,
      type: apt.type as Enums<'appointment_type'>,
    }));

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

  // Card click handlers
  const handlePatientsCardClick = () => navigate('/patients');
  const handleDoctorsCardClick = () => navigate('/doctors');
  const handleAppointmentsTodayCardClick = () => navigate('/appointments?filter=today');
  const handlePendingConsultationsCardClick = () => navigate('/appointments?filter=pending');
  const handleCompletedConsultationsCardClick = () => navigate('/consultations?filter=completed');

  // Appointment row click handler
  const handleAppointmentClick = (appointmentId: string) => {
    toast.info("Appointment details modal coming soon!");
  };

  // Weekly chart bar click handler
  const handleChartBarClick = (date: string) => {
    navigate(`/appointments?filter=date&date=${date}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold">{greeting}</h1>
          <p className="text-muted-foreground">Here's a quick overview of your clinic's activity today.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardStatsCard
          icon={<Users size={18} className="mr-2 text-blue-500" />}
          label="Total Patients"
          value={dashboardData?.total_patients ?? 0}
          onClick={handlePatientsCardClick}
          ariaLabel="View Patients"
        />
        <DashboardStatsCard
          icon={<Stethoscope size={18} className="mr-2 text-green-500" />}
          label="Total Appointments"
          value={dashboardData?.total_appointments ?? 0}
          onClick={handleAppointmentsTodayCardClick}
          ariaLabel="View Appointments"
        />
        <DashboardStatsCard
          icon={<CalendarCheck size={18} className="mr-2 text-orange-500" />}
          label="Pending Consultations"
          value={dashboardData?.pending_consultations ?? 0}
          onClick={handlePendingConsultationsCardClick}
          ariaLabel="View Pending Consultations"
        />
        <DashboardStatsCard
          icon={<CalendarCheck size={18} className="mr-2 text-green-500" />}
          label="Completed Consultations"
          value={dashboardData?.completed_consultations ?? 0}
          onClick={handleCompletedConsultationsCardClick}
          ariaLabel="View Completed Consultations"
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
          onAppointmentClick={handleAppointmentClick}
          showViewAllButton={true}
          onViewAll={() => navigate('/appointments?filter=upcoming')}
        />
        <WeeklyAppointmentsChart appointments={allAppointments} onBarClick={handleChartBarClick} />
      </div>
    </div>
  );
}