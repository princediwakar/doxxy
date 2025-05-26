import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, FileText, User, Users, Plus } from "lucide-react";
import { format, isToday, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MedicalRecordModal } from "./MedicalRecordModal";
import { AppointmentModal, AppointmentType } from "./AppointmentModal";
import { PatientModal } from "./PatientModal";
import { Patient } from "@/types/database";

// Define interface for the data fetched, aligning with AppointmentType
// The fetched data structure from Supabase will be mapped to AppointmentType
interface FetchedAppointmentRaw {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  time: string;
  type: string; // Raw type is string
  status: string; // Raw status is string
  department: string; // Raw department is string
  notes?: string | null;
  created_at?: string;
  patients?: { id: string; name: string }; // Joined patient data
  doctors?: { id: string; name: string; specialization: string }; // Joined doctor data with specialization
}

interface Stat {
  totalPatients: number;
  totalAppointments: number;
  pendingAppointments: number;
  completedConsultations: number;
}

export function DoctorDashboard({ doctorId }: { doctorId?: string }) {
  const { toast } = useToast();
  // State should hold AppointmentType[]
  const [todayAppointments, setTodayAppointments] = useState<AppointmentType[]>([]);
  const [stats, setStats] = useState<Stat>({
    totalPatients: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    completedConsultations: 0
  });
  const [loading, setLoading] = useState(true);
  // selectedAppointment should be AppointmentType | null
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentType | null>(null);
  const [openMedicalRecordModal, setOpenMedicalRecordModal] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [patientForAppointment, setPatientForAppointment] = useState<Patient | null>(null);

  // Current date in ISO format for filtering appointments
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!doctorId) return;

        // Fetch all appointments for this doctor, include doctor specialization
        const { data: appointmentsRaw, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`*, patients(id, name), doctors(id, name, specialization)`)
          .eq('doctor_id', doctorId) as { data: FetchedAppointmentRaw[] | null, error: unknown }; // Cast to raw type, changed any to unknown

        if (appointmentsError) throw appointmentsError;

        // Map raw fetched data to AppointmentType
        const formattedAppointments: AppointmentType[] = (appointmentsRaw || []).map(apt => ({
          id: apt.id,
          patient_id: apt.patient_id,
          doctor_id: apt.doctor_id,
          date: apt.date,
          time: apt.time,
          type: apt.type as 'Walk-in' | 'Digital', // Cast string to union type
          status: apt.status as 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled', // Cast string to union type
          department: apt.department as 'Neurology' | 'Ophthalmology', // Cast string to union type
          notes: apt.notes || undefined,
          created_at: apt.created_at || undefined,
          // Create nested arrays from joined data
          patients: apt.patients ? [apt.patients] : null, // Map to { id: string, name: string }[] or null
          doctors: apt.doctors ? [apt.doctors] : null, // Map to { id: string, name: string, specialization: string }[] or null
        }));

        // Filter today's appointments from formatted data
        const todayAppts = formattedAppointments.filter((app: AppointmentType) => {
          // Use isToday to check if the appointment date is today's date
          try {
            return isToday(parseISO(app.date));
          } catch (error) {
            console.error('Error parsing appointment date:', app.date, error);
            return false; // Exclude appointments with invalid dates
          }
        });
        setTodayAppointments(todayAppts);

        // Get unique patient IDs from all formatted appointments
        const patientIds = Array.from(new Set(formattedAppointments.map((app: AppointmentType) => app.patient_id)));
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

        // Calculate stats from formatted appointments
        const pendingAppointments = formattedAppointments.filter((app: AppointmentType) => app.status === 'Scheduled').length;
        const completedAppointments = formattedAppointments.filter((app: AppointmentType) => app.status === 'Completed').length;

        setStats({
          totalPatients: patientsList.length,
          totalAppointments: formattedAppointments.length,
          pendingAppointments: pendingAppointments,
          completedConsultations: completedAppointments
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
  }, [doctorId, toast, today]);

  const startConsultation = (appointment: AppointmentType) => {
    setSelectedAppointment(appointment);
    setOpenMedicalRecordModal(true);
  };

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
       // Optional: Refetch patient data if needed after modal closes
       // fetchPatients(); // You would need to add a fetchPatients function here
    }
  };

  // Handle closing appointment modal
  const handleAppointmentModalClose = (open: boolean) => {
    setIsAppointmentModalOpen(open);
    if (!open) {
      setPatientForAppointment(null);
      // Optional: Refetch appointment data if needed
      // fetchAppointments(); // You would need to add a fetchAppointments function here
    }
  };

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your appointments and schedule.</p>
        </div>
        <Button onClick={handleAddPatientClick}>
          <Plus className="h-4 w-4 mr-2" />
          New Patient
        </Button>
      </div>

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
                      <div className="font-medium">{appointment.patients?.[0]?.name || 'Unknown Patient'}</div>
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

      <MedicalRecordModal
        open={openMedicalRecordModal}
        onOpenChange={setOpenMedicalRecordModal}
        appointment={selectedAppointment}
      />

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
}
