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
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from "@/components/ui/pagination";
import { TodaysAppointmentsList } from "./TodaysAppointmentsList";
import { DoctorPatientsList } from "./DoctorPatientsList";


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

  // Pagination state for My Patients list
  const [currentPatientPage, setCurrentPatientPage] = useState(1);
  const patientsPerPage = 5; // Adjust as needed
  const [totalPatientPages, setTotalPatientPages] = useState(1);
  const [patientsLoading, setPatientsLoading] = useState(false);

  // Current date in ISO format for filtering appointments
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Main loading indicator
        if (!doctorId) return;

        // Fetch only today's appointments directly
        const { data: todayAppointmentsData, error: todayAppointmentsError } = await supabase
          .from('appointments')
          .select(`id, date, time, type, status, department, notes, created_at, patients!inner(id, name)`)
          .eq('doctor_id', doctorId)
          .eq('date', today) // Filter by today's date directly in the query
          .order('time', { ascending: true }); // Order by time for display

        if (todayAppointmentsError) console.error("Error fetching today's appointments:", todayAppointmentsError); // Log error but don't block

        // Map fetched data to AppointmentType
        const formattedTodayAppointments: AppointmentType[] = (todayAppointmentsData || []).map(apt => ({
          id: apt.id,
          patient_id: apt.patients.id,
          doctor_id: doctorId,
          date: apt.date,
          time: apt.time,
          type: apt.type as 'Walk-in' | 'Digital', // Cast string to union type
          status: apt.status as 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled', // Cast string to union type
          department: apt.department as 'Neurology' | 'Ophthalmology', // Cast string to union type
          notes: apt.notes || undefined,
          created_at: apt.created_at || undefined,
          patients: apt.patients ? [apt.patients] : null, // Format as expected by AppointmentType
          doctors: null, // We are not fetching doctor details here
        }));

        setTodayAppointments(formattedTodayAppointments);

        // Fetch aggregate counts for stats (more targeted counts)
        const { count: totalAppointmentsCount, error: totalAppointmentsError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('doctor_id', doctorId);

        if (totalAppointmentsError) console.error("Error fetching total appointments count:", totalAppointmentsError);

        const { count: pendingAppointmentsCount, error: pendingAppointmentsError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('doctor_id', doctorId)
          .eq('status', 'Scheduled');
          
        if (pendingAppointmentsError) console.error("Error fetching pending appointments count:", pendingAppointmentsError);

        const { count: completedConsultationsCount, error: completedConsultationsError } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('doctor_id', doctorId)
          .eq('status', 'Completed');

        if (completedConsultationsError) console.error("Error fetching completed consultations count:", completedConsultationsError);

         // Fetch total unique patient count for stats display (fetch all patient_ids and count client-side)
         const { data: allPatientIdsData, error: allPatientIdsError } = await supabase
          .from('appointments')
          .select('patient_id')
          .eq('doctor_id', doctorId);

        if (allPatientIdsError) console.error("Error fetching all patient IDs for count:", allPatientIdsError); // Log but don't block

        const totalUniquePatientsCount = new Set((allPatientIdsData || []).map(item => item.patient_id)).size;

        setStats(prevStats => ({
          ...prevStats,
          totalPatients: totalUniquePatientsCount || 0,
          totalAppointments: totalAppointmentsCount || 0,
          pendingAppointments: pendingAppointmentsCount || 0,
          completedConsultations: completedConsultationsCount || 0
        }));
        
      } catch (error) {
        console.error('Error fetching doctor dashboard initial data:', error); // Updated log message
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false); // Main loading indicator off
      }
    };
    
    fetchData();
    
  }, [doctorId, toast, today]); // Dependencies for initial fetch

  // Effect for fetching paginated patient list
  useEffect(() => {
    if (doctorId) {
      fetchDoctorPatients(doctorId, currentPatientPage, patientsPerPage);
    }
  }, [doctorId, currentPatientPage]); // Dependencies for patient list fetch

  // New function to fetch paginated patients and their last visit date
  const fetchDoctorPatients = async (doctorId: string, page: number, limit: number) => {
    setPatientsLoading(true); // Patient list loading indicator
    try {
      // Fetch ALL unique patient IDs to get the total count and the full list for slicing
      // This is a necessary step to implement client-side pagination on the unique list
      const { data: allUniquePatientIdsData, error: allUniquePatientIdsError } = await supabase
        .from('appointments')
        .select('patient_id')
        .eq('doctor_id', doctorId);

      if (allUniquePatientIdsError) throw allUniquePatientIdsError; // Throw error as this is crucial for pagination
      
      const uniquePatientIds = Array.from(new Set((allUniquePatientIdsData || []).map(item => item.patient_id)));

      // Calculate total pages based on the full unique list
      const calculatedTotalPatientPages = Math.ceil(uniquePatientIds.length / limit);
      setTotalPatientPages(calculatedTotalPatientPages > 0 ? calculatedTotalPatientPages : 1);

      // Slice the unique patient IDs for the current page
      const fromIndex = (page - 1) * limit;
      const toIndex = fromIndex + limit;
      const paginatedPatientIds = uniquePatientIds.slice(fromIndex, toIndex);

      let patientsList: (Patient & { lastVisit?: string })[] = [];
      const lastVisitsMap = new Map<string, string>();

      if (paginatedPatientIds.length > 0) {
        // Fetch patient details for the paginated IDs
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('id, name') // Fetch only necessary patient details
          .in('id', paginatedPatientIds);

        if (patientsError) console.error("Error fetching patient details for pagination:", patientsError); // Log error
        patientsList = patientsData || [];

        // Fetch the latest appointment date for each of these patients (N+1 per page)
        const lastVisitPromises = patientsList.map(async (patient) => {
           const { data: lastApp, error: lastAppError } = await supabase
             .from('appointments')
             .select('date')
             .eq('doctor_id', doctorId) // Ensure we only get appointments for this doctor
             .eq('patient_id', patient.id)
             .order('date', { ascending: false })
             .limit(1);

           if (lastAppError) console.error(`Error fetching last appointment for patient ${patient.id}:`, lastAppError); // Log error
           return { patientId: patient.id, date: (lastApp && lastApp.length > 0) ? lastApp[0].date : null };
        });

        const lastVisitsResults = await Promise.all(lastVisitPromises);

        lastVisitsResults.forEach(result => { if (result.date) lastVisitsMap.set(result.patientId, result.date); });

        // Add last visit date to patientsList
        patientsList = patientsList.map(patient => ({
           ...patient,
           lastVisit: lastVisitsMap.get(patient.id) || 'N/A'
        }));
      }
      
      setPatients(patientsList as Patient[]); // Cast back to Patient[] for state

    } catch (error) {
      console.error('Error fetching paginated doctor patients:', error); // Updated log message
      toast({
        title: 'Error',
        description: 'Failed to load patient list.',
        variant: 'destructive'
      });
      setPatients([]); // Clear list on error
      setTotalPatientPages(1); // Reset total pages on error
    } finally {
      setPatientsLoading(false); // Patient list loading indicator off
    }
  };

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

      {/* Today's Appointments */}
      <TodaysAppointmentsList
        todayAppointments={todayAppointments}
        loading={loading}
        startConsultation={startConsultation}
      />

      {/* My Patients */}
      <DoctorPatientsList
        patients={patients}
        patientsLoading={patientsLoading}
        currentPatientPage={currentPatientPage}
        patientsPerPage={patientsPerPage}
        totalPatientPages={totalPatientPages}
        setCurrentPatientPage={setCurrentPatientPage}
      />

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
