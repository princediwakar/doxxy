import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, User, Users, Stethoscope } from "lucide-react";
import { UpcomingAppointmentsList } from "@/components/UpcomingAppointmentsList";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FormattedAppointment, DatabaseAppointment } from "@/types/dashboard";
import { DoctorPatientsList } from "@/components/DoctorPatientsList";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/integrations/supabase/types";
import DoctorDashboard from "@/components/role/DoctorDashboard";
import { WeeklyAppointmentsChart } from "@/components/WeeklyAppointmentsChart";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
    typeof o.doctor_name === 'string'
  );
}

// Add type for doctor dashboard RPC return
type DoctorDashboardData = Database["public"]["Functions"]["get_doctor_dashboard_data"]["Returns"][0];

// Add type for staff/superadmin dashboard RPC return
type StaffDashboardData = {
  total_patients: number;
  total_doctors: number;
  appointments_today: number;
  pending_consultations: number;
  all_relevant_appointments: unknown;
};

// Add EnhancedPatientForDoctorList type
interface EnhancedPatientForDoctorList {
  id: string;
  name: string;
  lastVisit?: string;
}

export default function Dashboard() {
  const { activeClinic, user, activeClinicRole, loading: authLoading, profileName } = useAuth();
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [appointmentsToday, setAppointmentsToday] = useState(0);
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [currentPatientPage, setCurrentPatientPage] = useState(1);
  const patientsPerPage = 5;
  const [totalPatientPages, setTotalPatientPages] = useState(1);
  // Pagination state for upcoming appointments (declare at top)
  const [currentUpcomingPage, setCurrentUpcomingPage] = useState(1);
  const appointmentsPerPage = 5;
  const navigate = useNavigate();

  // Format appointments for the components
  const today = new Date().toISOString().split('T')[0];

  // Doctor-specific dashboard query
  const { data: doctorDashboardData, isLoading: isDoctorLoading, error: doctorError } = useQuery({
    queryKey: ['doctorDashboardData', activeClinic?.clinic_id, user?.id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id || !user?.id || activeClinicRole !== 'doctor') return null;
      // Call the new RPC with user_id and clinic_id
      const { data, error } = await supabase.rpc('get_doctor_dashboard_data', {
        _clinic_id: activeClinic.clinic_id,
        _user_id: user.id,
      });
      if (error) throw error;
      // Parse JSON fields if needed
      const result = (data?.[0] ?? null) as DoctorDashboardData | null;
      if (result) {
        // Parse JSON fields if they are strings
        if (typeof result.upcoming_appointments === 'string') {
          try { result.upcoming_appointments = JSON.parse(result.upcoming_appointments); } catch { result.upcoming_appointments = []; }
        }
        if (!Array.isArray(result.upcoming_appointments)) result.upcoming_appointments = [];
        if (typeof result.my_patients === 'string') {
          try { result.my_patients = JSON.parse(result.my_patients); } catch { result.my_patients = []; }
        }
        if (!Array.isArray(result.my_patients)) result.my_patients = [];
      }
      return result || null;
    },
    enabled: !!activeClinic?.clinic_id && !!user?.id && activeClinicRole === 'doctor',
    staleTime: 5 * 60 * 1000,
  });

  // Existing clinic-wide dashboard query
  const { data: dashboardData, isLoading, error } = useQuery<StaffDashboardData | null>({
    queryKey: ['dashboardData', activeClinic?.clinic_id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id || activeClinicRole === 'doctor') return null;
      const { data, error } = await supabase.rpc('get_dashboard_data', { _clinic_id: activeClinic.clinic_id });
      if (error) throw error;
      const d: Partial<StaffDashboardData> = data?.[0] || {};
      console.log('Raw dashboardData from RPC:', d);
      return {
        total_patients: d.total_patients ?? 0,
        total_doctors: d.total_doctors ?? 0,
        appointments_today: d.appointments_today ?? 0,
        pending_consultations: d.pending_consultations ?? 0,
        all_relevant_appointments: d.all_relevant_appointments ?? [],
      };
    },
    enabled: !!activeClinic?.clinic_id && activeClinicRole !== 'doctor' && !authLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (activeClinicRole === 'doctor' && doctorDashboardData) {
      setTotalPatients(doctorDashboardData.total_patients || 0);
      setTotalDoctors(1); // Only the current doctor
      setAppointmentsToday(0); // Not used for doctor
      setPatients((Array.isArray(doctorDashboardData.my_patients) ? doctorDashboardData.my_patients : []).map((p: { id: string; name: string; last_visit: string }) => ({
        id: p.id,
        name: p.name,
        last_visit: p.last_visit,
      })));
      // Optionally set totalPatientPages if you want pagination
    } else if (dashboardData) {
      setTotalPatients(dashboardData.total_patients || 0);
      setTotalDoctors(dashboardData.total_doctors || 0);
      setAppointmentsToday(dashboardData.appointments_today || 0);
      // Optionally set patients for staff/superadmin
    }
  }, [doctorDashboardData, dashboardData, activeClinicRole]);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!activeClinic) return;
      setPatientsLoading(true);
      try {
        const { data: patientsData, error: patientsError, count } = await supabase
          .from('patients')
          .select('*', { count: 'exact' })
          .eq('clinic_id', activeClinic.clinic_id)
          .range((currentPatientPage - 1) * patientsPerPage, currentPatientPage * patientsPerPage - 1);
        if (patientsError) {
          console.error("Error fetching patients:", patientsError);
          return;
        }
        setPatients(patientsData || []);
        setTotalPatientPages(Math.ceil((count || 0) / patientsPerPage));
      } finally {
        setPatientsLoading(false);
      }
    };
    fetchPatients();
  }, [activeClinic, currentPatientPage]);

  // Greeting logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  const userName = profileName || user?.email || "there";
  const greeting = `${getGreeting()}, ${userName}`;

  if (authLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!activeClinic) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">No Clinic Selected</h2>
            <p className="text-muted-foreground">Please select a clinic to view the dashboard.</p>
          </div>
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
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Greeting skeleton or actual greeting */}
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

  // Safely parse appointments data from Json to DatabaseAppointment[]
  const parseAppointmentsData = (jsonData: unknown): DatabaseAppointment[] => {
    if (!jsonData) return [];
    try {
      if (Array.isArray(jsonData)) {
        return jsonData.filter(isValidDatabaseAppointment);
      }
      if (typeof jsonData === 'string') {
        const parsed = JSON.parse(jsonData);
        if (Array.isArray(parsed)) {
          return parsed.filter(isValidDatabaseAppointment);
        }
      }
      return [];
    } catch (error) {
      console.error('Error parsing appointments data:', error);
      return [];
    }
  };

  let allAppointments: DatabaseAppointment[] = [];
  if (dashboardData && dashboardData.all_relevant_appointments) {
    allAppointments = parseAppointmentsData(dashboardData.all_relevant_appointments);
  }
  console.log('All appointments for chart:', allAppointments);

  // For doctor role, map my_patients to EnhancedPatientForDoctorList[]
  const doctorPatients: EnhancedPatientForDoctorList[] =
    activeClinicRole === 'doctor' && doctorDashboardData && Array.isArray(doctorDashboardData.my_patients)
      ? doctorDashboardData.my_patients.map((p: { id: string; name: string; last_visit?: string }) => ({
          id: p.id,
          name: p.name,
          lastVisit: p.last_visit,
        }))
      : [];
  
  const todaysAppointments: FormattedAppointment[] = allAppointments
    .filter((apt: DatabaseAppointment) => apt.date === today)
    .sort((a: DatabaseAppointment, b: DatabaseAppointment) => {
      if (a.time && b.time) {
        return b.time.localeCompare(a.time);
      }
      return 0;
    })
    .map((apt: DatabaseAppointment) => ({
      id: apt.id,
      patient: apt.patient_name,
      doctor: apt.doctor_name,
      time: apt.time,
      date: apt.date,
      status: apt.status,
      type: apt.type,
    }));

  console.log("All upcoming appointments raw:", allAppointments, "Today:", today);
  const upcomingAppointments: FormattedAppointment[] = allAppointments
    .filter((apt: DatabaseAppointment) => apt.date >= today)
    .sort((a: DatabaseAppointment, b: DatabaseAppointment) => {
      if (a.date && b.date) {
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        if (a.time && b.time) {
          return a.time.localeCompare(b.time);
        }
      }
      return 0;
    })
    .map((apt: DatabaseAppointment) => ({
      id: apt.id,
      patient: apt.patient_name,
      doctor: apt.doctor_name,
      time: apt.time,
      date: apt.date,
      status: apt.status,
      type: apt.type,
    }));

  // Compute total pages after upcomingAppointments is defined
  const totalUpcomingPages = Math.max(1, Math.ceil(upcomingAppointments.length / appointmentsPerPage));

  const handlePatientClick = (patient: { id: string; name: string; last_visit?: string }) => {
    console.log('Patient clicked:', patient);
    // TODO: Navigate to patient details page or open modal
  };

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
      {/* Personalized Greeting */}
      <h2 className="text-2xl font-semibold mb-6">{greeting}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Doctor-specific cards */}
        {activeClinicRole === 'doctor' ? (
          <>
            <Card
              role="button"
              tabIndex={0}
              aria-label="View Patients"
              onClick={handlePatientsCardClick}
              className="col-span-1 h-full hover:ring-2 ring-primary focus:ring-2 cursor-pointer"
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users size={18} className="mr-2 text-blue-500" />
                  Total Patients
                </CardTitle>
              </CardHeader>
              <CardContent className="min-h-[80px] flex items-center justify-center">
                <div className="text-2xl font-bold">{doctorDashboardData?.total_patients ?? 0}</div>
              </CardContent>
            </Card>
            <Card
              role="button"
              tabIndex={0}
              aria-label="View Appointments"
              onClick={handleAppointmentsTodayCardClick}
              className="col-span-1 h-full hover:ring-2 ring-primary focus:ring-2 cursor-pointer"
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Stethoscope size={18} className="mr-2 text-green-500" />
                  Total Appointments
                </CardTitle>
              </CardHeader>
              <CardContent className="min-h-[80px] flex items-center justify-center">
                <div className="text-2xl font-bold">{doctorDashboardData?.total_appointments ?? 0}</div>
              </CardContent>
            </Card>
            <Card
              role="button"
              tabIndex={0}
              aria-label="View Pending Consultations"
              onClick={handlePendingConsultationsCardClick}
              className="col-span-1 h-full hover:ring-2 ring-primary focus:ring-2 cursor-pointer"
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarCheck size={18} className="mr-2 text-orange-500" />
                  Pending Consultations
                </CardTitle>
              </CardHeader>
              <CardContent className="min-h-[80px] flex items-center justify-center">
                <div className="text-2xl font-bold">{doctorDashboardData?.pending_consultations ?? 0}</div>
              </CardContent>
            </Card>
            <Card
              role="button"
              tabIndex={0}
              aria-label="View Completed Consultations"
              onClick={handleCompletedConsultationsCardClick}
              className="col-span-1 h-full hover:ring-2 ring-primary focus:ring-2 cursor-pointer"
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarCheck size={18} className="mr-2 text-green-500" />
                  Completed Consultations
                </CardTitle>
              </CardHeader>
              <CardContent className="min-h-[80px] flex items-center justify-center">
                <div className="text-2xl font-bold">{doctorDashboardData?.completed_consultations ?? 0}</div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Staff/Superadmin cards */}
            <Card
              role="button"
              tabIndex={0}
              aria-label="View Patients"
              onClick={handlePatientsCardClick}
              className="col-span-1 h-full hover:ring-2 ring-primary focus:ring-2 cursor-pointer"
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users size={18} className="mr-2 text-blue-500" />
                  Total Patients
                </CardTitle>
              </CardHeader>
              <CardContent className="min-h-[80px] flex items-center justify-center">
                <div className="text-2xl font-bold">{totalPatients}</div>
              </CardContent>
            </Card>
            <Card
              role="button"
              tabIndex={0}
              aria-label="View Doctors"
              onClick={handleDoctorsCardClick}
              className="col-span-1 h-full hover:ring-2 ring-primary focus:ring-2 cursor-pointer"
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Stethoscope size={18} className="mr-2 text-green-500" />
                  Total Doctors
                </CardTitle>
              </CardHeader>
              <CardContent className="min-h-[80px] flex items-center justify-center">
                <div className="text-2xl font-bold">{totalDoctors}</div>
              </CardContent>
            </Card>
            <Card
              role="button"
              tabIndex={0}
              aria-label="View Today's Appointments"
              onClick={handleAppointmentsTodayCardClick}
              className="col-span-1 h-full hover:ring-2 ring-primary focus:ring-2 cursor-pointer"
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarCheck size={18} className="mr-2 text-orange-500" />
                  Appointments Today
                </CardTitle>
              </CardHeader>
              <CardContent className="min-h-[80px] flex items-center justify-center">
                <div className="text-2xl font-bold">{appointmentsToday}</div>
              </CardContent>
            </Card>
            <Card
              role="button"
              tabIndex={0}
              aria-label="View Pending Consultations"
              onClick={handlePendingConsultationsCardClick}
              className="col-span-1 h-full hover:ring-2 ring-primary focus:ring-2 cursor-pointer"
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarCheck size={18} className="mr-2 text-orange-500" />
                  Pending Consultations
                </CardTitle>
              </CardHeader>
              <CardContent className="min-h-[80px] flex items-center justify-center">
                <div className="text-2xl font-bold">{dashboardData?.pending_consultations ?? 0}</div>
              </CardContent>
            </Card>
          </>
        )}
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
