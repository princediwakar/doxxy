
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, FileText, User, Users } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function DoctorDashboard({ doctorId }: { doctorId?: string }) {
  const { toast } = useToast();
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    completedConsultations: 0
  });
  const [loading, setLoading] = useState(true);

  // Current date in ISO format for filtering appointments
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!doctorId) return;

        // Fetch today's appointments
        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`
            id, date, time, type, status,
            patients (id, name),
            doctors (id, name, specialization)
          `)
          .eq('doctor_id', doctorId)
          .eq('date', today)
          .order('time');

        if (appointmentsError) throw appointmentsError;

        // Transform appointments data
        const formattedAppointments = (appointments || []).map(appointment => ({
          id: appointment.id,
          patientName: appointment.patients?.name || 'Unknown Patient',
          time: appointment.time,
          type: appointment.type,
          status: appointment.status
        }));

        setTodayAppointments(formattedAppointments);

        // Fetch statistics
        const { count: totalPatients } = await supabase
          .from('appointments')
          .select('patient_id', { count: 'exact', head: true })
          .eq('doctor_id', doctorId)
          .is('patient_id', 'not.null');

        const { count: totalAppointments } = await supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('doctor_id', doctorId);

        const { count: pendingAppointments } = await supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('doctor_id', doctorId)
          .eq('status', 'Scheduled');

        const { count: completedConsultations } = await supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('doctor_id', doctorId)
          .eq('status', 'Completed');

        setStats({
          totalPatients: totalPatients || 0,
          totalAppointments: totalAppointments || 0,
          pendingAppointments: pendingAppointments || 0,
          completedConsultations: completedConsultations || 0
        });

      } catch (error) {
        console.error('Error fetching doctor dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [doctorId, toast]);

  // In case no doctorId is provided, show mock data
  useEffect(() => {
    if (!doctorId && loading) {
      // Mock data
      setTodayAppointments([
        { id: "1", patientName: "Sarah Johnson", time: "10:00 AM", type: "Check-up", status: "Scheduled" },
        { id: "2", patientName: "Robert Williams", time: "11:30 AM", type: "Follow-up", status: "In Progress" },
        { id: "3", patientName: "Emma Davis", time: "2:00 PM", type: "Consultation", status: "Scheduled" },
      ]);
      
      setStats({
        totalPatients: 28,
        totalAppointments: 45,
        pendingAppointments: 5,
        completedConsultations: 40
      });
      
      setLoading(false);
    }
  }, [doctorId, loading]);

  const startConsultation = (appointmentId: string) => {
    toast({
      title: "Consultation started",
      description: "The patient consultation has been started."
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{stats.totalPatients}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{stats.pendingAppointments}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Consultations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{stats.completedConsultations}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Today's Appointments ({format(new Date(), "MMMM d, yyyy")})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted/50 rounded-md animate-pulse"></div>
              ))}
            </div>
          ) : todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No appointments scheduled for today.
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <User size={16} className="text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{appointment.patientName}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Clock size={14} className="mr-1" /> {appointment.time} • {appointment.type}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      appointment.status === "Scheduled" ? "outline" :
                      appointment.status === "In Progress" ? "default" : "secondary"
                    }>
                      {appointment.status}
                    </Badge>
                    {(appointment.status === "Scheduled" || appointment.status === "In Progress") && (
                      <Button size="sm" onClick={() => startConsultation(appointment.id)}>
                        Start Consultation
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
