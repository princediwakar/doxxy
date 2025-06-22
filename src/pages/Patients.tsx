import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Activity,
  FileText,
  User,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AppointmentData,
  ConsultationWithAppointment,
  Patient,
  PatientWithConsultations,
  Prescription,
  SpecialtyData,
} from '@/types/patients';
import { ConsultationViewModal } from '@/components/consultation/ConsultationViewModal';
import { PrescriptionViewModal } from '@/components/prescriptions/PrescriptionViewModal';
import { ExportOptionsModal } from '@/components/ExportOptionsModal';
import { MedicalRecordPDFExporter } from '@/lib/pdfExport';
import { AppointmentModal } from '@/components/appointments/AppointmentModal';
import { PatientModal } from '@/components/patients/PatientModal';
import { EnhancedBillingModal } from '@/components/billing/BillingModal';
import { toast } from 'sonner';
import { printConsultation } from '@/components/consultation/printUtils';
import { PatientsPageHeader } from "@/components/patients/PatientsPageHeader";
import { PatientSearch } from "@/components/patients/PatientSearch";
import { PatientList } from "@/components/patients/PatientList";
import { PatientDetailView } from "@/components/patients/PatientDetailView";

const supabase = getSupabase();

const fetchPatientsWithMedicalRecords = async (clinicId: string, searchTerm: string, currentPage: number, itemsPerPage: number): Promise<{ patients: PatientWithConsultations[], totalCount: number }> => {
  console.log("fetchPatientsWithMedicalRecords: Fetching for clinic", clinicId, "search", searchTerm, "page", currentPage);

  // First get all patients for filtering and count
  let allPatientsQuery = supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', clinicId);

  if (searchTerm.trim()) {
    allPatientsQuery = allPatientsQuery.ilike('name', `%${searchTerm}%`);
  }

  const { data: allPatients, error: patientsError } = await allPatientsQuery;
  if (patientsError) throw patientsError;

  // Apply pagination
  const totalCount = allPatients?.length || 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const patients = allPatients?.slice(startIndex, startIndex + itemsPerPage) || [];

  // For each patient, fetch their consultations and prescriptions with simpler queries
  const patientsWithRecords = await Promise.all(
    patients.map(async (patient) => {
      // Fetch consultations with basic appointment data
      const { data: consultations } = await supabase
        .from('consultations')
        .select(`
          *,
          appointments(
            id,
            date,
            time,
            doctor_id
          )
        `)
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false });

      // Fetch prescriptions
      const { data: prescriptions } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false });

      // Get doctor names for each consultation using existing RPC
      const consultationsWithDoctors = await Promise.all(
        (consultations || []).map(async (consultation) => {
          if (!consultation.appointments?.doctor_id) {
            return {
              ...consultation,
              appointment: {
                ...consultation.appointments,
                doctor_name: 'Unknown Doctor',
                department_name: 'Unknown Department',
              }
            };
          }

          // Use the get_doctors_by_clinic RPC to get doctor details
          const { data: doctors } = await supabase.rpc('get_doctors_by_clinic', {
            clinic_id: clinicId,
          });

          const doctor = doctors?.find(d => d.id === consultation.appointments.doctor_id);

          return {
            ...consultation,
            appointment: {
              ...consultation.appointments,
              doctor_name: doctor?.name || 'Unknown Doctor',
              department_name: doctor?.department_name || 'Unknown Department',
            }
          };
        })
      );

      return {
        ...patient,
        consultations: consultationsWithDoctors,
        prescriptions: prescriptions || [],
      };
    })
  );

  return {
    patients: patientsWithRecords,
    totalCount
  };
};

const PatientRecords = () => {
  const { activeClinic, activeClinicRole, loading: authLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedPatient, setSelectedPatient] = useState<PatientWithConsultations | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<AppointmentData | null>(null);
  const [isConsultationViewOpen, setIsConsultationViewOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isPrescriptionViewOpen, setIsPrescriptionViewOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // New states for enhanced functionality
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['patientsWithMedicalRecords', activeClinic?.clinics?.id, searchTerm, currentPage],
    queryFn: () => fetchPatientsWithMedicalRecords(activeClinic!.clinics?.id, searchTerm, currentPage, itemsPerPage),
    enabled: !!activeClinic && !authLoading,
    retry: 1,
  });

  const patientsWithRecords = data?.patients || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleViewConsultation = (consultation: ConsultationWithAppointment) => {
    const appointmentData = {
      id: consultation.appointment.id || '',
      clinic_id: consultation.appointment.clinic_id || '',
      patient_id: consultation.appointment.patient_id || '',
      doctor_id: consultation.appointment.doctor_id || '',
      date: consultation.appointment.date,
      time: consultation.appointment.time,
      type: (consultation.appointment.type as 'Walk-in' | 'Digital') || 'Walk-in',
      status: (consultation.appointment.status as 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled') || 'Completed',
      notes: consultation.appointment.notes || '',
      created_at: consultation.appointment.created_at || consultation.created_at || new Date().toISOString(),
      patient_name: selectedPatient?.name,
      patient_gender: selectedPatient?.gender,
      patient_date_of_birth: selectedPatient?.date_of_birth,
      doctor_name: consultation.appointment.doctor_name,
      department_name: consultation.appointment.department_name,
    };
    setSelectedConsultation(appointmentData);
    setIsConsultationViewOpen(true);
  };

  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setIsPrescriptionViewOpen(true);
  };

  const handleNewPatient = () => {
    setEditingPatient(null);
    setIsPatientModalOpen(true);
  };

  const handleEditPatient = () => {
    if (selectedPatient) {
      setEditingPatient(selectedPatient);
      setIsPatientModalOpen(true);
    }
  };

  const handleScheduleAppointment = () => {
    if (selectedPatient) {
      setIsAppointmentModalOpen(true);
    }
  };

  const handleCreateBill = () => {
    if (selectedPatient) {
      setIsBillingModalOpen(true);
    }
  };

  const handlePrintConsultation = async (consultation: ConsultationWithAppointment) => {
    if (!selectedPatient || !activeClinic?.clinics) return;

    // Prepare clinic info
    const clinicInfo = activeClinic.clinics;

    // Prepare doctor info
    const doctorInfo = {
      name: consultation.appointment.doctor_name,
      specialization: consultation.appointment.department_name || 'General',
      qualification: '',
      registration_number: ''
    };

    // Prepare appointment info
    const appointmentInfo = {
      id: consultation.appointment.id || '',
      clinic_id: consultation.appointment.clinic_id || '',
      patient_id: consultation.appointment.patient_id || '',
      doctor_id: consultation.appointment.doctor_id || '',
      date: consultation.appointment.date,
      time: consultation.appointment.time,
      type: consultation.appointment.type || 'Consultation',
      status: consultation.appointment.status || 'Completed',
      notes: consultation.appointment.notes || '',
      created_at: consultation.appointment.created_at || ''
    };

    // Use the unified print function
    await printConsultation(
      consultation.specialty_data as Record<string, unknown>,
      selectedPatient,
      {
        ...appointmentInfo,
        type: (appointmentInfo.type as 'Walk-in' | 'Digital') || 'Walk-in',
        status: (appointmentInfo.status as 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled') || 'Completed',
      },
      clinicInfo,
      doctorInfo,
      user,
      consultation.appointment.department_name || 'General'
    );
  };

  const handleExport = async (options: { dateRange?: { from: Date; to: Date; }; includeConsultations?: boolean; includePrescriptions?: boolean; }) => {
    if (!selectedPatient || !activeClinic) return;

    setIsExporting(true);
    const exportToast = toast.loading('Generating PDF...');

    try {
      const exporter = new MedicalRecordPDFExporter();

      // Transform consultation data for PDF export
      const consultationData = selectedPatient.consultations.map(consultation => ({
        id: consultation.id,
        created_at: consultation.created_at || consultation.appointment.date,
        specialty_data: consultation.specialty_data as SpecialtyData | null,
        appointment: {
          date: consultation.appointment.date,
          time: consultation.appointment.time,
          doctor_name: consultation.appointment.doctor_name,
          department_name: consultation.appointment.department_name,
        }
      }));

      // Transform prescription data for PDF export
      const prescriptionData = selectedPatient.prescriptions.map(prescription => ({
        ...prescription,
        medications: (prescription.medications as unknown as any[]),
        doctor_name: 'Unknown Doctor', // Simplified since we don't fetch doctor details
      }));

      // Patient info for PDF
      const patientInfo = {
        name: selectedPatient.name,
        medical_id: selectedPatient.medical_id,
        gender: selectedPatient.gender,
        date_of_birth: selectedPatient.date_of_birth,
        phone: selectedPatient.phone,
        email: selectedPatient.email,
      };

      await exporter.exportMedicalRecord(
        patientInfo,
        consultationData,
        prescriptionData,
        activeClinic?.clinics?.name as string,
        options,
      );

      toast.dismiss(exportToast);
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.dismiss(exportToast);
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  if (!activeClinic) {
    return (
      <Card className="medical-card m-6">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Please select a clinic to view medical records.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="medical-card m-6">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <Activity className="w-12 h-12 text-destructive mx-auto" />
            <p className="text-destructive">Error loading medical records.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 ">
      <PatientsPageHeader
        isPatientSelected={!!selectedPatient}
        onExport={() => selectedPatient && setIsExportModalOpen(true)}
        onNewPatient={handleNewPatient}
      />

      <PatientSearch
        searchTerm={searchTerm}
        onSearchTermChange={(term) => {
          setSearchTerm(term);
          setCurrentPage(1);
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PatientList
            isLoading={isLoading}
            patients={patientsWithRecords}
            totalCount={totalCount}
            totalPages={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            selectedPatient={selectedPatient}
            setSelectedPatient={setSelectedPatient}
          />
        </div>

        <div className="lg:col-span-2">
          {selectedPatient ? (
            <PatientDetailView
              patient={selectedPatient}
              onEditPatient={handleEditPatient}
              onScheduleAppointment={handleScheduleAppointment}
              onCreateBill={handleCreateBill}
              onViewConsultation={handleViewConsultation}
              onViewPrescription={handleViewPrescription}
              isLoading={isLoading}
            />
          ) : (
            <Card>
              <CardContent className="p-8">
                <div className="text-center text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select a patient to view their medical records</p>
                  <p className="text-sm mt-2">Click on a patient from the list to see their complete medical history, consultations, and prescriptions.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      <ConsultationViewModal
        open={isConsultationViewOpen}
        onOpenChange={setIsConsultationViewOpen}
        appointment={selectedConsultation as any}
      />

      <PrescriptionViewModal
        open={isPrescriptionViewOpen}
        onOpenChange={setIsPrescriptionViewOpen}
        prescription={selectedPrescription}
      />

      <ExportOptionsModal
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        onExport={handleExport as any}
        patient={selectedPatient as any}
        loading={isExporting}
      />

      <PatientModal
        open={isPatientModalOpen}
        onOpenChange={setIsPatientModalOpen}
        patient={editingPatient}
        onPatientCreated={(newPatient) => {
          setIsPatientModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ['patients', activeClinic?.clinic_id] });
        }}
      />

      <AppointmentModal
        open={isAppointmentModalOpen}
        onOpenChange={setIsAppointmentModalOpen}
        appointment={null}
        patient={selectedPatient}
      />

      <EnhancedBillingModal
        open={isBillingModalOpen}
        onOpenChange={setIsBillingModalOpen}
        bill={null}
        patient={selectedPatient}
        appointment={selectedConsultation as any}
      />
    </div>
  );
};

export default PatientRecords; 