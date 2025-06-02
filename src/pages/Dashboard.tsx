import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, User, Users, Stethoscope } from "lucide-react";
import { UpcomingAppointmentsList } from "@/components/UpcomingAppointmentsList";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FormattedAppointment } from "@/types/dashboard";
import { DoctorPatientsList } from "@/components/DoctorPatientsList";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { activeClinic, user, activeClinicRole, loading: authLoading } = useAuth();
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [appointmentsToday, setAppointmentsToday] = useState(0);
  const [upcomingAppointmentsData, setUpcomingAppointmentsData] = useState<FormattedAppointment[]>([]);
  const [todaysAppointmentsData, setTodaysAppointmentsData] = useState<FormattedAppointment[]>([]);
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [currentPatientPage, setCurrentPatientPage] = useState(1);
  const patientsPerPage = 5;
  const [totalPatientPages, setTotalPatientPages] = useState(1);

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboardData', activeClinic?.clinic_id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return null;
      
      const { data, error } = await supabase.rpc('get_dashboard_data', { 
        _clinic_id: activeClinic.clinic_id 
      });
      
      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!activeClinic?.clinic_id && !authLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (dashboardData) {
      setTotalPatients(dashboardData.total_patients || 0);
      setTotalDoctors(dashboardData.total_doctors || 0);
      setAppointmentsToday(dashboardData.appointments_today || 0);
    }
  }, [dashboardData]);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!activeClinic) return;

      setPatientsLoading(true);
      try {
        const { data: patientsData, error: patientsError, count } = await supabase.from('patients')
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

  if (authLoading) {
    return <p>Loading...</p>;
  }

  if (!activeClinic) {
    return <p>Please select a clinic.</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (isLoading) {
    return <p>Loading dashboard data...</p>;
  }

  // Format appointments for the components
  const allAppointments = dashboardData?.all_relevant_appointments || [];
  const today = new Date().toISOString().split('T')[0];
  
  const todaysAppointments = allAppointments
    .filter((apt: any) => apt.date === today)
    .map((apt: any) => ({
      id: apt.id,
      patient: apt.patient_name,
      doctor: apt.doctor_name,
      time: apt.time,
      date: apt.date,
      status: apt.status,
      type: apt.type,
    }));

  const upcomingAppointments = allAppointments
    .filter((apt: any) => apt.date > today)
    .slice(0, 5)
    .map((apt: any) => ({
      id: apt.id,
      patient: apt.patient_name,
      doctor: apt.doctor_name,
      time: apt.time,
      date: apt.date,
      status: apt.status,
      type: apt.type,
    }));

  const handlePatientClick = (patient: any) => {
    alert(`Clicked patient: ${patient.name}`);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users size={18} className="mr-2 text-blue-500" />
              Total Patients
            </CardTitle>
            <CardDescription>Number of patients in the clinic</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Stethoscope size={18} className="mr-2 text-green-500" />
              Total Doctors
            </CardTitle>
            <CardDescription>Number of doctors in the clinic</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDoctors}</div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarCheck size={18} className="mr-2 text-orange-500" />
              Appointments Today
            </CardTitle>
            <CardDescription>Number of appointments scheduled today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentsToday}</div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User size={18} className="mr-2 text-purple-500" />
              Your Role
            </CardTitle>
            <CardDescription>Your role in the active clinic</CardDescription>
          </CardHeader>
          <CardContent>
             <Badge variant="secondary">{activeClinicRole}</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingAppointmentsList upcomingAppointments={upcomingAppointments} loading={isLoading} />
        <DoctorPatientsList
          patients={patients}
          patientsLoading={patientsLoading}
          currentPatientPage={currentPatientPage}
          patientsPerPage={patientsPerPage}
          totalPatientPages={totalPatientPages}
          setCurrentPatientPage={setCurrentPatientPage}
          onPatientClick={handlePatientClick}
        />
      </div>
    </div>
  );
}
