import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Users, User, Clock, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { DoctorDashboard } from "@/components/DoctorDashboard";

const Dashboard = () => {
  const { user, userRole, userDepartment } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    appointmentsToday: 0,
    avgWaitTime: "0 min"
  });
  const [appointmentData, setAppointmentData] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If the user is a doctor, don't fetch admin dashboard data
    if (userRole === "doctor") return;
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get today's date
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch total patients
        const { count: totalPatients, error: patientsError } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true });
          
        if (patientsError) throw patientsError;
        
        // Fetch total doctors
        const { count: totalDoctors, error: doctorsError } = await supabase
          .from('doctors')
          .select('*', { count: 'exact', head: true });
          
        if (doctorsError) throw doctorsError;
        
        // Fetch today's appointments
        const { count: todayAppointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('date', today);
          
        if (appointmentsError) throw appointmentsError;
        
        // Set stats
        setStats({
          totalPatients: totalPatients || 0,
          totalDoctors: totalDoctors || 0,
          appointmentsToday: todayAppointments || 0,
          avgWaitTime: "18 min" // This would be calculated from actual data in a real app
        });
        
        // Fetch weekly appointments data
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const weeklyData = await Promise.all(
          days.map(async (day, index) => {
            const date = new Date();
            date.setDate(date.getDate() - date.getDay() + index);
            const dateStr = date.toISOString().split('T')[0];
            
            const { count, error } = await supabase
              .from('appointments')
              .select('*', { count: 'exact', head: true })
              .eq('date', dateStr);
              
            if (error) throw error;
            
            return {
              name: day,
              appointments: count || 0
            };
          })
        );
        
        setAppointmentData(weeklyData);
        
        // Fetch upcoming appointments
        const { data: upcoming, error: upcomingError } = await supabase
          .from('appointments')
          .select(`
            id, date, time, type,
            patients (name),
            doctors (name)
          `)
          .gte('date', today)
          .order('date')
          .order('time')
          .limit(5);
          
        if (upcomingError) throw upcomingError;
        
        // Transform data for display
        const formattedAppointments = (upcoming || []).map(appointment => ({
          id: appointment.id,
          patient: appointment.patients?.name || 'Unknown Patient',
          doctor: appointment.doctors?.name || 'Unknown Doctor',
          time: appointment.time,
          date: new Date(appointment.date).toLocaleDateString(),
          type: appointment.type
        }));
        
        setUpcomingAppointments(formattedAppointments);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [userRole]);

  // If user is a doctor, render the doctor dashboard
  if (userRole === "doctor" && user) {
    return <DoctorDashboard doctorId={user.id} />;
  }

  // Otherwise, render the admin dashboard
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your clinic's performance and schedule.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          // Loading skeletons for stats
          Array.from({ length: 4 }).map((_, index) => (
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
            
            <Card>
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="p-2 rounded-full bg-pink-50 text-pink-500">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Wait Time</p>
                  <h3 className="text-2xl font-bold">{stats.avgWaitTime}</h3>
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
    </div>
  );
};

export default Dashboard;
