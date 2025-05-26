import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Users, User, Clock, Activity, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DoctorDashboard } from "@/components/DoctorDashboard";
import { Button } from "@/components/ui/button";
import { PatientModal } from "@/components/PatientModal";
import { AppointmentModal, AppointmentType } from "@/components/AppointmentModal";
import { Patient } from "@/types/database";
import { format, parseISO, isToday } from "date-fns";
import { AdminStatsGrid } from "@/components/AdminStatsGrid";
import { WeeklyAppointmentsChart } from "@/components/WeeklyAppointmentsChart";
import { UpcomingAppointmentsList } from "@/components/UpcomingAppointmentsList";

// Define the type for appointments fetched directly from the table with joins
interface FetchedAppointmentRaw {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  time: string; // Assuming time is stored as a string like 'HH:MM:SS'
  type: string;
  status: string;
  department: string;
  notes?: string | null;
  created_at?: string;
  patients?: { id: string; name: string } | null; // Joined patient data
  doctors?: { id: string; name: string; specialization: string } | null; // Joined doctor data
}

interface FormattedAppointment {
  id: string;
  patient: string;
  doctor: string;
  time: string; // Keep as string for display
  date: string;
  type: string;
}

const Dashboard = () => {
  const { user, userRole, userDepartment } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    appointmentsToday: 0
  });
  const [appointmentData, setAppointmentData] = useState<{ name: string; appointments: number }[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<FormattedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [patientForAppointment, setPatientForAppointment] = useState<Patient | null>(null);

  useEffect(() => {
    // If the user is a doctor, don't fetch admin dashboard data
    if (userRole === "doctor") return;
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch total patients count
        const { count: totalPatientsCount, error: patientsError } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true });
          
        if (patientsError) console.error("Error fetching patients count:", patientsError); // Log error, don't block

        // Fetch total doctors count
        const { count: totalDoctorsCount, error: doctorsError } = await supabase
          .from('doctors')
          .select('*', { count: 'exact', head: true });
          
        if (doctorsError) console.error("Error fetching doctors count:", doctorsError); // Log error, don't block

        // Fetch count of today's appointments
        const today = new Date();
        const todayIso = today.toISOString().split('T')[0];
        const { count: appointmentsTodayCount, error: appointmentsTodayError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('date', todayIso);

        if (appointmentsTodayError) console.error("Error fetching appointments today count:", appointmentsTodayError); // Log error, don't block
        
        // Set stats
        setStats({
          totalPatients: totalPatientsCount || 0,
          totalDoctors: totalDoctorsCount || 0,
          appointmentsToday: appointmentsTodayCount || 0
        });
        
        // Fetch appointments for the weekly chart and upcoming appointments
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoIso = sevenDaysAgo.toISOString().split('T')[0];

        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('id, date, time, type, status, patients(id, name), doctors(id, name)')
          .gte('date', sevenDaysAgoIso) // Get appointments from the last 7 days onwards
          .order('date', { ascending: true })
          .order('time', { ascending: true });

        if (appointmentsError) throw appointmentsError; // Throw error if fetching appointments fails

        // Process fetched appointments for weekly chart and upcoming list
        const allRelevantAppointments = (appointmentsData || []).map(apt => ({
          id: apt.id,
          patient_id: apt.patients.id,
          doctor_id: apt.doctors.id,
          date: apt.date, // YYYY-MM-DD format
          time: apt.time, // Assuming HH:MM:SS format
          type: apt.type,
          status: apt.status,
          department: '', // Department is not fetched in this query, might need to add if needed for display/filtering
          notes: undefined,
          created_at: undefined,
          patient: apt.patients?.name || 'Unknown Patient', // Get patient name
          doctor: apt.doctors?.name || 'Unknown Doctor', // Get doctor name
        }));
        
        // Create weekly appointments data (last 7 days)
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const weeklyData = days.map((day, index) => {
          const date = new Date(sevenDaysAgo);
          date.setDate(sevenDaysAgo.getDate() + index);
          const dateStr = format(date, 'yyyy-MM-dd');
          
          const dayAppointments = allRelevantAppointments.filter((app) => 
            app.date === dateStr
          );
          
          return {
            name: day,
            appointments: dayAppointments.length
          };
        });
        
        setAppointmentData(weeklyData);
        
        // Get upcoming appointments (today onwards, limit 5)
        const upcoming = allRelevantAppointments
          .filter((app) => parseISO(app.date) >= today) // Filter appointments from today onwards
          .slice(0, 5); // Limit to the next 5
        
        // Transform data for display (already done in allRelevantAppointments, just re-mapping for clarity if needed)
        const upcomingFormattedAppointments: FormattedAppointment[] = upcoming.map((appointment) => ({ // Use allRelevantAppointments structure
           id: appointment.id,
           patient: appointment.patient,
           doctor: appointment.doctor,
           time: appointment.time, // Use time string directly
           date: new Date(parseISO(appointment.date)).toLocaleDateString(), // Use parseISO before creating Date
           type: appointment.type
         }));

        setUpcomingAppointments(upcomingFormattedAppointments);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [userRole]);

  // Handle opening patient modal
  const handleAddPatientClick = () => {
    setIsPatientModalOpen(true);
  };

  // Handle patient created callback
  const handlePatientCreated = (patient: Patient) => {
    setPatientForAppointment(patient);
    setIsPatientModalOpen(false);
    setIsAppointmentModalOpen(true);
  };

  // Handle closing patient modal
  const handlePatientModalClose = (open: boolean) => {
    setIsPatientModalOpen(open);
    if (!open) {
       // Optional: Refetch patient data if needed after modal closes without creating a new patient
       // fetchPatients(); // You might have a fetchPatients function in admin dashboard if displaying a list
    }
  };

  // Handle closing appointment modal
  const handleAppointmentModalClose = (open: boolean) => {
    setIsAppointmentModalOpen(open);
    if (!open) {
      setPatientForAppointment(null);
      // Optional: Refetch appointment data if needed
      // fetchAppointments(); // You might have a fetchAppointments function in admin dashboard
    }
  };

  // If user is a doctor, render the doctor dashboard
  if (userRole === "doctor" && user) {
    return <DoctorDashboard doctorId={user.id} />;
  }

  // Otherwise, render the admin dashboard
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of your clinic's performance and schedule.</p>
        </div>
        {/* Add Patient button visible only for admin */}
        {userRole === 'admin' && (
          <Button onClick={handleAddPatientClick}>
            <Plus className="h-4 w-4 mr-2" />
            New Patient
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <AdminStatsGrid stats={stats} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Appointments Chart */}
        <WeeklyAppointmentsChart appointmentData={appointmentData} loading={loading} />

        {/* Today's Appointments */}
        <UpcomingAppointmentsList upcomingAppointments={upcomingAppointments} loading={loading} />
      </div>

      {/* Patient Modal */}
      <PatientModal
        open={isPatientModalOpen}
        onOpenChange={handlePatientModalClose}
        patient={null}
        onPatientCreated={handlePatientCreated}
      />

      {/* Appointment Modal */}
      <AppointmentModal
        open={isAppointmentModalOpen}
        onOpenChange={handleAppointmentModalClose}
        appointment={null}
        initialPatient={patientForAppointment}
      />

    </div>
  );
};

export default Dashboard;
