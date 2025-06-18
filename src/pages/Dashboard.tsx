import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CalendarCheck, Users, Stethoscope, Activity, Clock, Building2, Heart, Plus } from "lucide-react";
import { UpcomingAppointmentsList } from "@/components/dashboard/UpcomingAppointmentsList";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { FormattedAppointment, DatabaseAppointment, StaffDashboardData, DoctorDashboardData } from "@/types/dashboard";
import DoctorDashboard from "@/components/role/DoctorDashboard";
import { WeeklyAppointmentsChart } from "@/components/dashboard/WeeklyAppointmentsChart";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DashboardStatsCard } from "@/components/dashboard/DashboardStatsCard";
import { useState } from "react";
import { Enums } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppointmentModal } from "@/components/appointments/AppointmentModal";

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

const Dashboard = () => {
  const { activeClinic, user, activeClinicRole, loading: authLoading, profileName } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  // Pagination state for upcoming appointments
  const [currentUpcomingPage, setCurrentUpcomingPage] = useState(1);
  const appointmentsPerPage = 5;

  // State for appointment modal
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  // Query: Does the current user have a doctor profile for this clinic?
  const { data: hasDoctorProfile, isLoading: isDoctorProfileLoading } = useQuery({
    queryKey: ['hasDoctorProfile', user?.id, activeClinic?.clinic_id],
    queryFn: async () => {
      if (!user?.id || !activeClinic?.clinic_id) return false;
      const { data, error } = await supabase
        .from('doctors')
        .select('id')
        .eq('id', user.id)
        .eq('clinic_id', activeClinic.clinic_id)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!user?.id && !!activeClinic?.clinic_id && activeClinicRole === 'superadmin',
    staleTime: 60 * 1000,
  });

  // Doctor-specific dashboard query for superadmins who have doctor profiles
  const { data: doctorDashboardData, isLoading: isDoctorLoading, error: doctorError } = useQuery<DoctorDashboardData | null>({
    queryKey: ['doctorDashboardData', activeClinic?.clinic_id, user?.id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id || !user?.id || (activeClinicRole !== 'doctor' && activeClinicRole !== 'superadmin')) return null;
      if (activeClinicRole === 'superadmin' && !hasDoctorProfile) return null;
      
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
    enabled: !!activeClinic?.clinic_id && !!user?.id && 
             ((activeClinicRole === 'doctor') || 
              (activeClinicRole === 'superadmin' && hasDoctorProfile !== undefined)),
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

  if (isLoading || isDoctorLoading || isDoctorProfileLoading) {
    return (
      <div className="space-y-6 ">
        {user ? (
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-primary mb-2">{greeting}</h1>
            <div className="h-4 w-96 bg-muted/50 rounded animate-pulse" />
          </div>
        ) : (
          <div className="h-8 w-64 bg-muted rounded animate-pulse mb-6" />
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="medical-card animate-pulse">
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
  if (activeClinicRole === 'doctor') {
    return <DoctorDashboard />;
  }

  // Enhanced logic for superadmins: show both clinic-wide and personal stats if applicable
  const isEnhancedSuperadmin = activeClinicRole === 'superadmin' && hasDoctorProfile && doctorDashboardData;
  
  // Prepare appointments data with proper fallbacks
  const allAppointments: DatabaseAppointment[] = dashboardData?.all_relevant_appointments ?? [];
  const doctorAppointments: DatabaseAppointment[] = doctorDashboardData?.upcoming_appointments ?? [];
  
  // Use doctor appointments for chart if superadmin has doctor profile, otherwise use clinic-wide
  const chartAppointments = isEnhancedSuperadmin ? doctorAppointments : allAppointments;
  
  // Use the same logic for upcoming appointments list
  const appointmentsForList = isEnhancedSuperadmin ? doctorAppointments : allAppointments;
  
  console.log('Dashboard appointments for chart:', chartAppointments);

  const todaysAppointments: FormattedAppointment[] = appointmentsForList
    .filter(apt => apt.date === today)
    .sort((a, b) => a.time.localeCompare(b.time))
    .map(apt => ({
      id: apt.id,
      patient: apt.patient_name,
      doctor: apt.doctor_name,
      time: apt.time,
      date: apt.date,
      status: apt.status as Enums<'appointment_status'>,
      type: apt.type as Enums<'appointment_type'>,
    }));

  const upcomingAppointments: FormattedAppointment[] = appointmentsForList
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
  const handleDoctorsCardClick = () => navigate('/settings');
  const handleAppointmentsTodayCardClick = () => navigate('/appointments');
  const handlePendingConsultationsCardClick = () => navigate('/appointments?tab=upcoming');
  const handleCompletedConsultationsCardClick = () => navigate('/appointments?tab=past');

  // Appointment row click handler
  const handleAppointmentClick = (appointmentId: string) => {
    toast.info("Appointment details modal coming soon!");
  };

  // Weekly chart bar click handler
  const handleChartBarClick = (date: string) => {
    navigate(`/appointments?filter=date&date=${date}`);
  };

  // Handle new appointment
  const handleNewAppointment = () => {
    setIsAppointmentModalOpen(true);
  };

  return (
    <div className="space-y-6 ">
      <div className="flex justify-between mb-6">
        <div className="">
          <h1 className="text-3xl font-bold text-primary">{greeting}</h1>
          <p className="text-muted-foreground">
            {isEnhancedSuperadmin 
              ? "Complete overview of clinic operations and your personal practice."
              : "Here's a quick overview of your clinic's activity today."
            }
          </p>
          {isEnhancedSuperadmin && (
            <Badge className="bg-accent/10 text-accent border-accent/20 mt-3">
              <Stethoscope size={12} className="mr-1" />
              Enhanced View - Doctor Profile Active
            </Badge>
          )}
        </div>
        <div className="flex gap-4">
          {/* Show New Appointment button for Staff and Superadmins */}
          {(activeClinicRole === 'staff' || activeClinicRole === 'superadmin') && (
            <Button
              onClick={handleNewAppointment}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-medical"
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
              <h2 className="text-xl font-semibold text-foreground">Clinic Overview</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardStatsCard
                icon={<Users size={18} className="mr-2 text-medical-blue" />}
                label="Total Patients"
                value={dashboardData?.total_patients ?? 0}
                onClick={handlePatientsCardClick}
                ariaLabel="View All Patients"
              />
              <DashboardStatsCard
                icon={<Stethoscope size={18} className="mr-2 text-medical-teal" />}
                label="Total Doctors"
                value={dashboardData?.total_doctors ?? 0}
                onClick={handleDoctorsCardClick}
                ariaLabel="Manage Clinic Members"
              />
              <DashboardStatsCard
                icon={<CalendarCheck size={18} className="mr-2 text-success" />}
                label="Total Appointments"
                value={dashboardData?.total_appointments ?? 0}
                onClick={handleAppointmentsTodayCardClick}
                ariaLabel="View All Appointments"
              />
              <DashboardStatsCard
                icon={<Clock size={18} className="mr-2 text-warning" />}
                label="Today's Appointments"
                value={dashboardData?.appointments_today ?? 0}
                onClick={handleAppointmentsTodayCardClick}
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
              <h2 className="text-xl font-semibold text-foreground">My Practice</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardStatsCard
                icon={<Users size={18} className="mr-2 text-medical-blue" />}
                label="My Patients"
                value={doctorDashboardData?.total_patients ?? 0}
                onClick={handlePatientsCardClick}
                ariaLabel="View My Patients"
              />
              <DashboardStatsCard
                icon={<CalendarCheck size={18} className="mr-2 text-success" />}
                label="My Appointments"
                value={doctorDashboardData?.total_appointments ?? 0}
                onClick={handleAppointmentsTodayCardClick}
                ariaLabel="View My Appointments"
              />
              <DashboardStatsCard
                icon={<Clock size={18} className="mr-2 text-warning" />}
                label="Pending Consultations"
                value={doctorDashboardData?.pending_consultations ?? 0}
                onClick={handlePendingConsultationsCardClick}
                ariaLabel="View Pending Consultations"
              />
              <DashboardStatsCard
                icon={<Activity size={18} className="mr-2 text-accent" />}
                label="Completed Consultations"
                value={doctorDashboardData?.completed_consultations ?? 0}
                onClick={handleCompletedConsultationsCardClick}
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
            onClick={handlePatientsCardClick}
            ariaLabel="View Patients"
          />
          <DashboardStatsCard
            icon={<Stethoscope size={18} className="mr-2 text-success" />}
            label="Total Appointments"
            value={dashboardData?.total_appointments ?? 0}
            onClick={handleAppointmentsTodayCardClick}
            ariaLabel="View Appointments"
          />
          <DashboardStatsCard
            icon={<CalendarCheck size={18} className="mr-2 text-warning" />}
            label="Pending Consultations"
            value={dashboardData?.pending_consultations ?? 0}
            onClick={handlePendingConsultationsCardClick}
            ariaLabel="View Pending Consultations"
          />
          <DashboardStatsCard
            icon={<Activity size={18} className="mr-2 text-accent" />}
            label="Completed Consultations"
            value={dashboardData?.completed_consultations ?? 0}
            onClick={handleCompletedConsultationsCardClick}
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
          onViewAll={() => navigate('/appointments?filter=upcoming')}
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
    </div>
  );
}

export default Dashboard;