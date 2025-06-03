import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Users, Stethoscope } from "lucide-react";
import { UpcomingAppointmentsList } from "@/components/UpcomingAppointmentsList";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FormattedAppointment, DatabaseAppointment } from "@/types/dashboard";
import { DoctorPatientsList, EnhancedPatientForDoctorList } from "@/components/DoctorPatientsList";
import { useQuery } from "@tanstack/react-query";
import { Database } from "@/integrations/supabase/types";
import { WeeklyAppointmentsChart } from "@/components/WeeklyAppointmentsChart";

// Add type for doctor dashboard RPC return
type DoctorDashboardData = Database["public"]["Functions"]["get_doctor_dashboard_data"]["Returns"][0];

export default function DoctorDashboard() {
  const { activeClinic, user, activeClinicRole, profileName } = useAuth();
  const [patients, setPatients] = useState<EnhancedPatientForDoctorList[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [currentPatientPage, setCurrentPatientPage] = useState(1);
  const patientsPerPage = 5;
  const [totalPatientPages, setTotalPatientPages] = useState(1);
  const today = new Date().toISOString().split('T')[0];

  // Doctor-specific dashboard query
  const { data: doctorDashboardData, isLoading, error } = useQuery({
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

  // For doctor role, use correct types for appointments and patients
  let allAppointments: DatabaseAppointment[] = [];
  if (doctorDashboardData && Array.isArray(doctorDashboardData.upcoming_appointments)) {
    allAppointments = (doctorDashboardData.upcoming_appointments as unknown as DatabaseAppointment[]);
  }

  const doctorPatients: EnhancedPatientForDoctorList[] =
    doctorDashboardData && Array.isArray(doctorDashboardData.my_patients)
      ? doctorDashboardData.my_patients.map((p: any) => ({
          id: p.id,
          name: p.name,
          lastVisit: p.last_visit,
          address: p.address || '',
          clinic_id: p.clinic_id || activeClinic?.clinic_id || '',
          created_at: p.created_at || null,
          date_of_birth: p.date_of_birth || null,
          email: p.email || '',
          gender: p.gender || '',
          medical_id: p.medical_id || '',
          phone: p.phone || '',
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

  console.log("DoctorDashboard: All upcoming appointments raw:", allAppointments, "Today:", today);
  // Pagination state for upcoming appointments
  const [currentUpcomingPage, setCurrentUpcomingPage] = useState(1);
  const appointmentsPerPage = 5;
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
  const totalUpcomingPages = Math.max(1, Math.ceil(upcomingAppointments.length / appointmentsPerPage));

  const handlePatientClick = (patient: EnhancedPatientForDoctorList) => {
    console.log('Patient clicked:', patient);
    // TODO: Navigate to patient details page or open modal
  };

  // Greeting logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  const userName = profileName || user?.email || "there";
  const greeting = `${getGreeting()}, ${userName}`;

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

  return (
    <div className="space-y-6">
      {/* Personalized Greeting */}
      <h2 className="text-2xl font-semibold mb-6">{greeting}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users size={18} className="mr-2 text-blue-500" />
              Total Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doctorDashboardData?.total_patients ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Stethoscope size={18} className="mr-2 text-green-500" />
              Total Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doctorDashboardData?.total_appointments ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarCheck size={18} className="mr-2 text-orange-500" />
              Pending Consultations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doctorDashboardData?.pending_consultations ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarCheck size={18} className="mr-2 text-green-500" />
              Completed Consultations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doctorDashboardData?.completed_consultations ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingAppointmentsList 
          upcomingAppointments={upcomingAppointments} 
          loading={isLoading} 
          appointmentsPerPage={appointmentsPerPage}
          currentPage={currentUpcomingPage}
          setCurrentPage={setCurrentUpcomingPage}
          totalPages={totalUpcomingPages}
        />
        <WeeklyAppointmentsChart appointments={allAppointments} />
      </div>
    </div>
  );
} 