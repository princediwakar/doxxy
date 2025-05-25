import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, FileText, User, Users } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ConsultationModal } from "./ConsultationModal";

interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  department: string;
  notes?: string;
  created_at?: string;
  patients?: { id: string; name: string };
  doctors?: { id: string; name: string };
}

interface Patient {
  id: string;
  name: string;
}

interface Stat {
  totalPatients: number;
  totalAppointments: number;
  pendingAppointments: number;
  completedConsultations: number;
}

export function DoctorDashboard({ doctorId }: { doctorId?: string }) {
  const { toast } = useToast();
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<Stat>({
    totalPatients: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    completedConsultations: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [openConsultationModal, setOpenConsultationModal] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);

  // Current date in ISO format for filtering appointments
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!doctorId) return;

        // Fetch all appointments for this doctor
        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`*, patients(id, name), doctors(id, name)`)
          .eq('doctor_id', doctorId)
          .order('date', { ascending: false });

        if (appointmentsError) throw appointmentsError;

        // Filter today's appointments
        const todayAppts = (appointments || []).filter((app: Appointment) => 
          app.date === today
        );
        setTodayAppointments(todayAppts);

        // Get unique patient IDs from all appointments
        const patientIds = Array.from(new Set((appointments || []).map((app: Appointment) => app.patient_id)));
        let patientsList: Patient[] = [];
        if (patientIds.length > 0) {
          const { data: patientsData, error: patientsError } = await supabase
            .from('patients')
            .select('id, name')
            .in('id', patientIds);
          if (patientsError) throw patientsError;
          patientsList = patientsData || [];
        }
        setPatients(patientsList);

        // Calculate stats
        const pendingAppointments = (appointments || []).filter((app: Appointment) => app.status === 'Scheduled').length;
        const completedAppointments = (appointments || []).filter((app: Appointment) => app.status === 'Completed').length;

        setStats({
          totalPatients: patientsList.length,
          totalAppointments: (appointments || []).length,
          pendingAppointments: pendingAppointments,
          completedConsultations: completedAppointments
        });
        
        // Log fetched data for debugging
        console.log('Fetched appointments for doctor:', appointments);
        console.log("Today's appointments for doctor:", todayAppts);
        console.log('Doctor ID:', doctorId);

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
  }, [doctorId, toast, today]);

  const startConsultation = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setOpenConsultationModal(true);
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
                      <div className="font-medium">{appointment.patients?.name || 'Unknown Patient'}</div>
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
                      <Button size="sm" onClick={() => startConsultation(appointment)}>
                        {appointment.status === "Scheduled" ? "Start" : "Continue"} Consultation
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            My Patients
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-muted/50 rounded-md animate-pulse"></div>
              ))}
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No patients found for this doctor.
            </div>
          ) : (
            <div className="space-y-2">
              {patients.map((patient) => (
                <div key={patient.id} className="p-3 border rounded-md flex items-center">
                  <User size={16} className="text-primary mr-2" />
                  <span className="font-medium">{patient.name}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConsultationModal
        open={openConsultationModal}
        onOpenChange={setOpenConsultationModal}
        appointment={selectedAppointment}
      />
    </div>
  );
}
