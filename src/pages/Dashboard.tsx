
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

// Type guard to check if an object is a valid DatabaseAppointment
function isValidDatabaseAppointment(obj: any): obj is DatabaseAppointment {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.date === 'string' &&
    typeof obj.time === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.status === 'string' &&
    typeof obj.patient_id === 'string' &&
    typeof obj.patient_name === 'string' &&
    typeof obj.doctor_id === 'string' &&
    typeof obj.doctor_name === 'string'
  );
}

export default function Dashboard() {
  const { activeClinic, user, activeClinicRole, loading: authLoading } = useAuth();
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [appointmentsToday, setAppointmentsToday] = useState(0);
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
      <div className="container mx-auto py-10">
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

  // Safely parse appointments data from Json to DatabaseAppointment[]
  const parseAppointmentsData = (jsonData: any): DatabaseAppointment[] => {
    if (!jsonData) return [];
    
    try {
      // If it's already an array, validate each item
      if (Array.isArray(jsonData)) {
        return jsonData.filter(isValidDatabaseAppointment);
      }
      
      // If it's a string, try to parse it
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

  // Format appointments for the components
  const allAppointments: DatabaseAppointment[] = parseAppointmentsData(dashboardData?.all_relevant_appointments);
  const today = new Date().toISOString().split('T')[0];
  
  const todaysAppointments: FormattedAppointment[] = allAppointments
    .filter((apt: DatabaseAppointment) => apt.date === today)
    .map((apt: DatabaseAppointment) => ({
      id: apt.id,
      patient: apt.patient_name,
      doctor: apt.doctor_name,
      time: apt.time,
      date: apt.date,
      status: apt.status,
      type: apt.type,
    }));

  const upcomingAppointments: FormattedAppointment[] = allAppointments
    .filter((apt: DatabaseAppointment) => apt.date > today)
    .slice(0, 5)
    .map((apt: DatabaseAppointment) => ({
      id: apt.id,
      patient: apt.patient_name,
      doctor: apt.doctor_name,
      time: apt.time,
      date: apt.date,
      status: apt.status,
      type: apt.type,
    }));

  const handlePatientClick = (patient: any) => {
    console.log('Patient clicked:', patient);
    // TODO: Navigate to patient details page or open modal
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
             <Badge variant="secondary" className="capitalize">
               {activeClinicRole}
             </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingAppointmentsList 
          upcomingAppointments={upcomingAppointments} 
          loading={isLoading} 
        />
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
