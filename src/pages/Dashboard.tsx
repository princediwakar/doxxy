import { useState, useCallback } from "react";
import { CalendarCheck, Users, User, Clock, Activity, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PatientModal } from "@/components/PatientModal";
import { AppointmentModal } from "@/components/AppointmentModal";
import { Tables, Database } from "@/integrations/supabase/types";
import { format, parseISO } from "date-fns";
import { AdminStatsGrid } from "@/components/AdminStatsGrid";
import { WeeklyAppointmentsChart } from "@/components/WeeklyAppointmentsChart";
import { UpcomingAppointmentsList } from "@/components/UpcomingAppointmentsList";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type Patient = Tables<'patients'>;

// Define the return type of the get_dashboard_data RPC
type DashboardRpcResult = Database['public']['Functions']['get_dashboard_data']['Returns'][0];

// Define the structure of the processed appointment data for frontend components
interface ProcessedAppointment {
  id: string;
    date: string; // yyyy-MM-dd
    time: string; // HH:mm
    type: string; // Should match appointment_type enum
    status: string; // Should match appointment_status enum
  patient_id: string;
    patient_name: string; // Ensure this is expected from RPC JSONB
  doctor_id: string;
    doctor_name: string; // Ensure this is expected from RPC JSONB
}

const fetchDashboardData = async (clinicId: string) => {
  console.log("fetchDashboardData: Fetching for clinic", clinicId);

  // Call the new RPC to get all dashboard data
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_dashboard_data', { _clinic_id: clinicId }).single();
  if (rpcError) throw rpcError;

  // Extract data from the RPC result (it returns an array with one object)
  const { total_patients, total_doctors, appointments_today, all_relevant_appointments }: DashboardRpcResult = rpcData;

  // Process the JSONB array of appointments with a more careful type assertion
  const processedAppointments: ProcessedAppointment[] = (all_relevant_appointments as unknown as ProcessedAppointment[] || []).map(apt => ({
    id: apt.id,
    date: apt.date,
    time: apt.time,
    type: apt.type,
    status: apt.status,
      patient_id: apt.patient_id,
      patient_name: apt.patient_name || 'Unknown Patient', // Handle potential null names from JSONB
      doctor_id: apt.doctor_id,
      doctor_name: apt.doctor_name || 'Unknown Doctor', // Handle potential null names from JSONB
  }));

  // Re-calculate weekly data and upcoming appointments from the processed data
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0); // Reset time to start of the day

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyData = days.map((day, index) => {
    const date = new Date(sevenDaysAgo);
    date.setDate(sevenDaysAgo.getDate() + index);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayAppointments = processedAppointments.filter(app => app.date === dateStr);
    return { name: day, appointments: dayAppointments.length };
  });

  // Upcoming appointments (today onwards, limit 5)
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const upcomingFormattedAppointments = processedAppointments
    .filter(app => parseISO(app.date) >= todayDate)
    .sort((a, b) => {
        // Sort by date, then time
        const dateTimeA = new Date(`${a.date}T${a.time}`);
        const dateTimeB = new Date(`${b.date}T${b.time}`);
        return dateTimeA.getTime() - dateTimeB.getTime();
    })
    .slice(0, 5)
    .map(appointment => ({
    id: appointment.id,
      patient: appointment.patient_name,
      doctor: appointment.doctor_name,
    time: appointment.time,
      date: format(parseISO(appointment.date), 'PPP'), // Format date for display
    type: appointment.type,
  }));

  return {
    stats: { totalPatients: total_patients || 0, totalDoctors: total_doctors || 0, appointmentsToday: appointments_today || 0 },
    appointmentData: weeklyData,
    upcomingAppointments: upcomingFormattedAppointments,
  };
};

const Dashboard = () => {
  console.log("Dashboard component rendered.");
  const { user, activeClinic, activeClinicRole, loading: authLoading } = useAuth();
  const queryClient = useQueryClient(); // Get query client
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [patientForAppointment, setPatientForAppointment] = useState<Patient | null>(null);

  console.log("Dashboard: authLoading=", authLoading, "activeClinic=", !!activeClinic, "activeClinicRole=", activeClinicRole);

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardData', activeClinic?.clinic_id],
    queryFn: () => fetchDashboardData(activeClinic!.clinic_id),
    enabled: !!activeClinic && !authLoading && activeClinicRole !== 'doctor',
    retry: 1,
  });

  const handleAddPatientClick = () => {
    setIsPatientModalOpen(true);
  };

  const handlePatientCreated = (patient: Patient) => {
    setPatientForAppointment(patient);
    setIsPatientModalOpen(false);
    setIsAppointmentModalOpen(true);
  };

  const handlePatientModalClose = (open: boolean) => {
    setIsPatientModalOpen(open);
    if (!open && activeClinic && activeClinicRole !== 'doctor') {
      queryClient.invalidateQueries({ queryKey: ['dashboardData', activeClinic.clinic_id] });
    }
  };

  const handleAppointmentModalClose = (open: boolean) => {
    setIsAppointmentModalOpen(open);
    if (!open && activeClinic && activeClinicRole !== 'doctor') {
      setPatientForAppointment(null);
      queryClient.invalidateQueries({ queryKey: ['dashboardData', activeClinic.clinic_id] });
    }
  };

  if (authLoading) {
    console.log("Dashboard: Rendering null due to authLoading");
    return null;
  }

  if (!activeClinic) {
    console.log("Dashboard: Rendering no clinic message");
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] text-muted-foreground">
        Please select a clinic to view the dashboard.
      </div>
    );
  }

  if (activeClinicRole === 'doctor') {
    console.log("Dashboard: Rendering doctor access message");
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] text-muted-foreground">
        Doctors do not have access to the admin dashboard.
      </div>
    );
  }

  if (isLoading) {
    console.log("Dashboard: Rendering loading spinner");
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    console.error("Dashboard: Error fetching data", error);
    toast.error("Failed to load dashboard data");
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] text-red-500">
        Error loading dashboard data. Please try again.
      </div>
    );
  }

  console.log("Dashboard: Rendering main UI with data", data);

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of your clinic's performance and schedule.</p>
        </div>
        {(activeClinicRole === 'admin' || activeClinicRole === 'superadmin') && (
          <Button onClick={handleAddPatientClick}>
            <Plus size={18} className="mr-2" />
            New Patient
          </Button>
        )}
      </div>

      <AdminStatsGrid stats={data?.stats || { totalPatients: 0, totalDoctors: 0, appointmentsToday: 0 }} loading={isLoading} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyAppointmentsChart appointmentData={data?.appointmentData || []} loading={isLoading} />
        <UpcomingAppointmentsList upcomingAppointments={data?.upcomingAppointments || []} loading={isLoading} />
      </div>

      <PatientModal
        open={isPatientModalOpen}
        onOpenChange={handlePatientModalClose}
        patient={null}
        onPatientCreated={handlePatientCreated}
      />
      <AppointmentModal
        open={isAppointmentModalOpen}
        onOpenChange={handleAppointmentModalClose}
        appointment={null}
        patient={patientForAppointment}
      />
    </div>
  );

};

export default Dashboard;