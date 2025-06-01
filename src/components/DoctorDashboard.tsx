import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Restore removed imports used in the component
import { Calendar as CalendarIcon, Clock, FileText, User, Users, Plus } from "lucide-react";
import { format } from "date-fns"; // Used for date display
import { Badge } from "@/components/ui/badge"; // Used for appointment status badge
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppointmentModal } from "./AppointmentModal";
import { AppointmentTypeWithClinic } from "./ConsultationModal"; // Import the consistent type
import { PatientModal } from "./PatientModal";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from "@/components/ui/pagination";
import { TodaysAppointmentsList } from "./TodaysAppointmentsList";
import { DoctorPatientsList } from "./DoctorPatientsList";
import { Tables } from "@/integrations/supabase/types";

// Define Patient type based on types.ts
export interface Patient extends Tables<'patients'> {
  // Add any joined properties if they are fetched with the patient data
  lastVisit?: string;
}

interface Stat {
  totalPatients: number;
  totalAppointments: number;
  pendingAppointments: number;
  completedConsultations: number;
}

export function DoctorDashboard({ doctorId }: { doctorId?: string }) {
  const { toast } = useToast();
  const [todayAppointments, setTodayAppointments] = useState<AppointmentTypeWithClinic[]>([]);
  const [stats, setStats] = useState<Stat>({
    totalPatients: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    completedConsultations: 0
  });
  const [loading, setLoading] = useState(true);
  // selectedAppointment and openMedicalRecordModal state removed as MedicalRecordModal is commented out
  // const [selectedAppointment, setSelectedAppointment] = useState<AppointmentTypeWithClinic | null>(null);
  // const [openMedicalRecordModal, setOpenMedicalRecordModal] = useState(false);
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

  // New function to fetch paginated patients and their last visit date
  // Wrap fetchDoctorPatients in useCallback and add dependencies
  const fetchDoctorPatients = useCallback(async (doctorId: string, page: number, limit: number) => {
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
          .select('id, name, clinic_id') // Fetch clinic_id as well
          .in('id', paginatedPatientIds);

        if (patientsError) console.error("Error fetching patient details for pagination:", patientsError); // Log error
        // Ensure patientsData is mapped to the Patient type
        patientsList = (patientsData || []).map(p => ({ ...p, clinic_id: p.clinic_id })) as Patient[];

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

      setPatients(patientsList);

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
  }, [toast]); // Add doctorId and toast as dependencies for useCallback

  // Effect for fetching initial data (appointments and stats)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Main loading indicator
        if (!doctorId) return;

        // Fetch only today's appointments directly
        const { data: todayAppointmentsData, error: todayAppointmentsError } = await supabase
          .from('appointments')
          .select(`id, date, time, type, status, department, notes, created_at, clinic_id, patients!inner(id, name)`) // Select clinic_id and joined patients
          .eq('doctor_id', doctorId)
          .eq('date', today) // Filter by today's date directly in the query
          .order('time', { ascending: true }); // Order by time for display

        if (todayAppointmentsError) {
            console.error("Error fetching today's appointments:", todayAppointmentsError);
            setTodayAppointments([]);
        } else {
             // Ensure todayAppointmentsData is not null before mapping
            if (todayAppointmentsData) {
                // Explicitly define the expected shape of each appointment object after the select with join
                 interface FetchedAppointmentData {
                  id: string;
                  date: string;
                  time: string;
                  type: string;
                  status: string;
                  department: string; // Expect department based on select query
                  notes: string | null; // Expect notes
                  created_at: string | null; // Expect created_at
                  clinic_id: string; // Expect clinic_id
                  patients: { id: string; name: string }[]; // Expect joined patients as array
                }
                // Explicitly assert the type of the data array to unknown first, then to the expected shape
                const formattedTodayAppointments: AppointmentTypeWithClinic[] = (todayAppointmentsData as unknown as FetchedAppointmentData[]).map(apt => ({
                  id: apt.id,
                  // Access patient ID from the joined patients array. Use optional chaining.
                  patient_id: apt.patients?.[0]?.id || '', // Provide fallback for patient_id if patients array is empty or null
                  doctor_id: doctorId, // Doctor ID is from the prop
                  date: apt.date,
                  time: apt.time,
                  type: apt.type,
                  status: apt.status,
                  department: apt.department, // Access department directly
                  notes: apt.notes,
                  created_at: apt.created_at,
                   // Map patients array to match the required structure, handle null/undefined
                  patients: apt.patients ? apt.patients.map(p => ({ id: p.id, name: p.name })) : null,
                  doctors: null,
                  clinic_id: apt.clinic_id,
                }));
                setTodayAppointments(formattedTodayAppointments);
            } else {
                 // If no data and no explicit error (shouldn't happen with select), treat as empty
                setTodayAppointments([]);
            }
        }

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
          pendingAppointments: pendingAppointmentsCount || 0
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
  // Add fetchDoctorPatients as a dependency
  useEffect(() => {
    if (doctorId) {
      fetchDoctorPatients(doctorId, currentPatientPage, patientsPerPage);
    }
  }, [doctorId, currentPatientPage, fetchDoctorPatients]); // Add fetchDoctorPatients as dependency


  // Start consultation function should take AppointmentTypeWithClinic
  const startConsultation = async (appointment: AppointmentTypeWithClinic) => {
    // Removed usage of selectedAppointment and openMedicalRecordModal as MedicalRecordModal is commented out
    // setSelectedAppointment(appointment);
    // setOpenMedicalRecordModal(true);
    if (!appointment || !appointment.id || !appointment.clinic_id) return;

    setLoading(true);
    try {
      // Update appointment status to 'In Progress'
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'In Progress' })
        .eq('id', appointment.id)
        .eq('clinic_id', appointment.clinic_id); // Ensure multi-tenancy

      if (error) {
        throw error;
      }

      console.log('Appointment status updated to In Progress:', appointment.id);
      // Consider invalidating queries here if the UI needs to reflect the status change immediately
      // queryClient.invalidateQueries(['appointments', activeClinic?.clinic_id]); // You might need queryClient here

      // Now, open the Consultation Modal
      // Assuming you have state and logic in DoctorDashboard to open the modal
      // This part needs to be integrated with your existing modal handling
      // Example: setOpenConsultationModal(true); setSelectedAppointmentForModal(appointment);

    toast({
      title: 'Consultation Started',
        description: `Appointment ${appointment.id} is now In Progress.`,
    });
    } catch (error: unknown) {
      console.error('Error updating appointment status to In Progress:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start consultation.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
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
        onPatientClick={(patient) => console.log('Patient clicked:', patient)} // Add placeholder prop
      />

      {/* Remove MedicalRecordModal component usage as it was deleted */}
      {/*
      <MedicalRecordModal
        open={openMedicalRecordModal}
        onOpenChange={setOpenMedicalRecordModal}
        appointment={selectedAppointment} // Pass selectedAppointment
      />
      */}

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
        // Remove initialPatient prop as it doesn't exist on AppointmentModalProps
        // initialPatient={patientForAppointment} // Keep or remove based on AppointmentModalProps
      />

    </div>
  );
}