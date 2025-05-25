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
        
        // Fetch total patients using direct table query
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('*');
          
        if (patientsError) {
          console.error("Error fetching patients:", patientsError);
          toast.error("Failed to load patient data");
          return;
        }
        
        // Fetch total doctors using direct table query
        const { data: doctorsData, error: doctorsError } = await supabase
          .from('doctors')
          .select('*');
          
        if (doctorsError) {
          console.error("Error fetching doctors:", doctorsError);
          toast.error("Failed to load doctor data");
          return;
        }
        
        // Fetch all appointments with patient and doctor names
        const { data: appointmentsRaw, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*, patients(id, name), doctors(id, name)') as { data: FetchedAppointmentRaw[] | null, error: unknown };
          
        if (appointmentsError) {
          console.error("Error fetching appointments:", appointmentsError);
          toast.error("Failed to load appointment data");
          return;
        }
        
        // Map raw fetched data to a format suitable for calculations and display
        const formattedAppointments = (appointmentsRaw || []).map(apt => ({
          id: apt.id,
          patient_id: apt.patient_id,
          doctor_id: apt.doctor_id,
          date: apt.date, // YYYY-MM-DD format
          time: apt.time, // Assuming HH:MM:SS format
          type: apt.type,
          status: apt.status,
          department: apt.department,
          notes: apt.notes || undefined,
          created_at: apt.created_at || undefined,
          patient: apt.patients?.name || 'Unknown Patient', // Get patient name
          doctor: apt.doctors?.name || 'Unknown Doctor', // Get doctor name
        }));
        
        // Filter today's appointments using date-fns
        const todayAppointments = formattedAppointments.filter(app => isToday(parseISO(app.date)));
        
        // Set stats
        setStats({
          totalPatients: patientsData?.length || 0,
          totalDoctors: doctorsData?.length || 0,
          appointmentsToday: todayAppointments.length || 0
        });
        
        // Create weekly appointments data
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const weeklyData = days.map((day, index) => {
          const date = new Date();
          date.setDate(date.getDate() - date.getDay() + index);
          // Format date for comparison
          const dateStr = format(date, 'yyyy-MM-dd');
          
          const dayAppointments = formattedAppointments.filter((app) => 
            // Compare formatted date string
            app.date === dateStr
          );
          
          return {
            name: day,
            appointments: dayAppointments.length
          };
        });
        
        setAppointmentData(weeklyData);
        
        // Get upcoming appointments
        const upcoming = formattedAppointments
          // Filter appointments from today onwards using parseISO and >= comparison
          .filter((app) => parseISO(app.date) >= new Date())
          .sort((a, b) => {
            if (a.date === b.date) {
              // Sort by time string if dates are the same
              return a.time.localeCompare(b.time);
            }
            return a.date.localeCompare(b.date);
          })
          .slice(0, 5);
        
        // Transform data for display
        const upcomingFormattedAppointments: FormattedAppointment[] = upcoming.map((appointment) => ({
          id: appointment.id,
          patient: appointment.patient,
          doctor: appointment.doctor,
          time: appointment.time, // Use time string directly
          date: new Date(appointment.date).toLocaleDateString(), // Keep locale date string for display
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
            Add Patient
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          // Loading skeletons for stats
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6 h-[88px]"></CardContent>
            </Card>
          ))
        ) : (
          // Actual stats
          <>
            <Card>
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="p-2 rounded-full bg-blue-50 text-blue-500">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                  <h3 className="text-2xl font-bold">{stats.totalPatients}</h3>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="p-2 rounded-full bg-indigo-50 text-indigo-500">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Doctors</p>
                  <h3 className="text-2xl font-bold">{stats.totalDoctors}</h3>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="p-2 rounded-full bg-purple-50 text-purple-500">
                  <CalendarCheck size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Appointments Today</p>
                  <h3 className="text-2xl font-bold">{stats.appointmentsToday}</h3>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Appointments Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity size={18} className="mr-2 text-purple-500" />
              Weekly Appointments
            </CardTitle>
            <CardDescription>Number of appointments per day this week</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {loading ? (
              <div className="w-full h-full animate-pulse bg-muted/30 rounded-md"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appointmentData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="appointments" fill="#9b87f5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarCheck size={18} className="mr-2 text-purple-500" />
              Upcoming Appointments
            </CardTitle>
            <CardDescription>Next scheduled appointments</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="animate-pulse h-12 bg-muted/30 rounded-md"></div>
                ))}
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No upcoming appointments scheduled.
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="space-y-1">
                      <p className="font-medium">{appointment.patient}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User size={14} className="mr-1" />
                        <span>{appointment.doctor}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{appointment.time}</p>
                      <div className="flex items-center text-sm text-muted-foreground justify-end">
                        <CalendarCheck size={14} className="mr-1" />
                        <span>{appointment.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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
