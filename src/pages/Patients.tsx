import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  User,
  Calendar,
  FileText,
  Pill,
  Stethoscope,
  History,
  ClipboardList,
  Filter,
  Download,
  Eye,
  Heart,
  Activity,
  Shield,
  Phone,
  Mail,
  MapPin,
  Plus,
  Edit,
  CreditCard,
  Printer
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Database } from '@/integrations/supabase/types';
import { ConsultationViewModal } from '@/components/consultation/ConsultationViewModal';
import { MedicalTimeline } from '@/components/medical-records/MedicalTimeline';
import { PrescriptionViewModal } from '@/components/prescriptions/PrescriptionViewModal';
import { ExportOptionsModal } from '@/components/ExportOptionsModal';
import { MedicalRecordPDFExporter } from '@/lib/pdfExport';
import { AppointmentModal } from '@/components/appointments/AppointmentModal';
import { PatientModal } from '@/components/patients/PatientModal';
import { EnhancedBillingModal } from '@/components/billing/BillingModal';
import { toast } from 'sonner';
import { getAge } from '@/lib/utils';

const supabase = getSupabase();

// Types
type Patient = Database['public']['Tables']['patients']['Row'];
type Consultation = Database['public']['Tables']['consultations']['Row'];
type Prescription = Database['public']['Tables']['prescriptions']['Row'];

interface ConsultationWithAppointment extends Consultation {
  appointment: {
    id?: string;
    clinic_id?: string;
    patient_id?: string;
    doctor_id?: string;
    date: string;
    time: string;
    type?: string;
    status?: string;
    notes?: string;
    created_at?: string;
    doctor_name: string;
    department_name: string;
  };
}

interface PatientWithConsultations extends Patient {
  consultations: ConsultationWithAppointment[];
  prescriptions: Prescription[];
}

interface AppointmentData {
  id: string;
  clinic_id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  time: string;
  type: 'Walk-in' | 'Digital';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  notes?: string;
  created_at: string;
  patient_name?: string;
  patient_gender?: string;
  patient_date_of_birth?: string;
  doctor_name?: string;
  department_name?: string;
}

interface ExportOptions {
  includeConsultations: boolean;
  includePrescriptions: boolean;
  dateRange: 'all' | '30days' | '90days' | '1year';
}

const fetchPatientsWithMedicalRecords = async (clinicId: string, searchTerm: string, currentPage: number, itemsPerPage: number) => {
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

          // Use the enhanced get_doctors_by_clinic RPC to get doctor details
          const { data: doctors } = await supabase.rpc('get_doctors_by_clinic_enhanced', {
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

const MedicalRecords = () => {
  const { activeClinic, activeClinicRole, loading: authLoading } = useAuth();
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
      clinic_id: consultation.appointment.clinic_id || activeClinic?.clinics?.id || '',
      patient_id: consultation.appointment.patient_id || selectedPatient?.id || '',
      doctor_id: consultation.appointment.doctor_id || '',
      date: consultation.appointment.date,
      time: consultation.appointment.time,
      type: consultation.appointment.type as 'Walk-in' | 'Digital',
      status: consultation.appointment.status as 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled',
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
    if (!selectedPatient || !activeClinic) return;

    // Prepare clinic info
    const clinicInfo = {
      name: activeClinic.clinics?.name,
      address: activeClinic.clinics?.address,
      phone: activeClinic.clinics?.phone,
      email: activeClinic.clinics?.email,
      website: activeClinic.clinics?.website
    };

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
      appointmentInfo,
      clinicInfo,
      doctorInfo,
      user,
      consultation.appointment.department_name || 'General'
    );
  };

  const handleExport = async (options: ExportOptions) => {
    if (!selectedPatient || !activeClinic) return;

    setIsExporting(true);
    const exportToast = toast.loading('Generating PDF...');

    try {
      const exporter = new MedicalRecordPDFExporter();

      // Transform consultation data for PDF export
      const consultationData = selectedPatient.consultations.map(consultation => ({
        id: consultation.id,
        created_at: consultation.created_at || consultation.appointment.date,
        specialty_data: consultation.specialty_data,
        appointment: {
          date: consultation.appointment.date,
          time: consultation.appointment.time,
          doctor_name: consultation.appointment.doctor_name,
          department_name: consultation.appointment.department_name,
        }
      }));

      // Transform prescription data for PDF export
      const prescriptionData = selectedPatient.prescriptions.map(prescription => ({
        id: prescription.id,
        created_at: prescription.created_at!,
        medications: prescription.medications,
        instructions: prescription.instructions,
        follow_up_date: prescription.follow_up_date,
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
        options,
        activeClinic?.clinics?.name as string
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
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">Patient Records</h1>
            <p className="text-muted-foreground">Comprehensive patient medical history and records</p>
          </div>
        </div>
        <div className="flex space-x-2">

          <Button
            onClick={() => selectedPatient && setIsExportModalOpen(true)}
            disabled={!selectedPatient}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button
            onClick={handleNewPatient}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-medical"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <Card className="medical-card">
        <CardContent className="p-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search patients by name or medical ID..."
              className="pl-10 bg-background border-border focus:ring-primary"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patients List */}
        <div className="lg:col-span-1">
          <Card className="medical-card shadow-medical">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-primary">
                <User className="h-5 w-5" />
                <span>Patients</span>
                <Badge variant="default" className="status-badge status-active">{totalCount}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                {isLoading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-16 bg-muted/50 rounded-md animate-pulse" />
                    ))}
                  </div>
                ) :
                  <div className="space-y-1">
                    {(patientsWithRecords || []).map((patient) => (
                      <div
                        key={patient.id}
                        className={`p-4 cursor-pointer transition-colors border-b hover:bg-primary/5 ${selectedPatient?.id === patient.id ? 'bg-primary/10 border-primary/20' : ''
                          }`}
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">{patient.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {patient.gender} • Age {getAge(patient.date_of_birth)}
                              </p>
                              {patient.medical_id && (
                                <p className="text-xs text-muted-foreground">ID: {patient.medical_id}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="default" className="text-xs status-badge status-active">
                              {patient.consultations.length} visits
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                }
              </ScrollArea>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                        const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                        if (pageNum <= totalPages && pageNum > 0) {
                          return (
                            <PaginationItem key={i}>
                              <PaginationLink
                                onClick={() => setCurrentPage(pageNum)}
                                isActive={currentPage === pageNum}
                                className="cursor-pointer"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Patient Details */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <div className="space-y-6">
              {/* Patient Information Card */}
              <Card className="medical-card shadow-medical border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-primary">{selectedPatient.name}</CardTitle>
                      <p className="text-muted-foreground">
                        {selectedPatient.gender} • Age {getAge(selectedPatient.date_of_birth)} •
                        Medical ID: {selectedPatient.medical_id || 'Not assigned'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={handleEditPatient}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleScheduleAppointment}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCreateBill}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Bill
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedPatient.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedPatient.phone}</span>
                      </div>
                    )}
                    {selectedPatient.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedPatient.email}</span>
                      </div>
                    )}
                    {selectedPatient.date_of_birth && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{format(parseISO(selectedPatient.date_of_birth), 'PPP')}</span>
                      </div>
                    )}
                    {selectedPatient.address && (
                      <div className="flex items-start space-x-2 md:col-span-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm">{selectedPatient.address}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Medical Records Tabs */}
              <Tabs defaultValue="consultations" className="space-y-4">
                <div className="flex items-center justify-between">
                  <TabsList className="bg-muted/30">
                    <TabsTrigger
                      value="consultations"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Consultations ({selectedPatient.consultations.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="prescriptions"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Pill className="h-4 w-4 mr-2" />
                      Prescriptions ({selectedPatient.prescriptions.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="timeline"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <History className="h-4 w-4 mr-2" />
                      Timeline
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="consultations" className="space-y-4">
                  <Card className="medical-card shadow-medical">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-primary">
                        <Stethoscope className="h-5 w-5" />
                        <span>Consultation History</span>
                        <Badge variant="default" className="status-badge status-active">{selectedPatient.consultations.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px]">
                        {selectedPatient.consultations.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No consultations found</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {selectedPatient.consultations.map((consultation) => (
                              <Card key={consultation.id} className="medical-card border-l-4 border-l-primary hover:shadow-medical transition-shadow">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        <span className="font-medium">
                                          {format(parseISO(consultation.appointment.date), 'PPP')}
                                        </span>
                                        <Badge variant="secondary" className="status-badge status-pending">
                                          {consultation.appointment.department_name || 'General'}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        {consultation.appointment.doctor_name}
                                      </p>
                                      {consultation.specialty_data && typeof consultation.specialty_data === 'object' &&
                                        'chief_complaint' in consultation.specialty_data && (
                                          <p className="text-sm">
                                            <strong>Chief Complaint:</strong> {
                                              (consultation.specialty_data as { chief_complaint?: string }).chief_complaint
                                            }
                                          </p>
                                        )}
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleViewConsultation(consultation)}
                                      >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="prescriptions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Pill className="h-5 w-5" />
                        <span>Prescription History</span>
                        <Badge variant="default" className="status-badge status-active">{selectedPatient.prescriptions.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[500px]">
                        {selectedPatient.prescriptions.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Pill className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No prescriptions found</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {selectedPatient.prescriptions.map((prescription) => (
                              <Card
                                key={prescription.id}
                                className="border-l-4 border-l-green-500 cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => handleViewPrescription(prescription)}
                              >
                                <CardContent className="p-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">
                                          {format(parseISO(prescription.created_at!), 'PPP')}
                                        </span>
                                      </div>
                                      {prescription.follow_up_date && (
                                        <Badge variant="secondary" className="status-badge status-pending">
                                          Follow-up: {format(parseISO(prescription.follow_up_date), 'PP')}
                                        </Badge>
                                      )}
                                    </div>

                                    <div className="text-sm">
                                      <strong>Medications:</strong>
                                      <div className="mt-1 text-muted-foreground">
                                        {Array.isArray(prescription.medications)
                                          ? `${prescription.medications.length} medication(s) prescribed`
                                          : typeof prescription.medications === 'string'
                                            ? prescription.medications.substring(0, 100) + (prescription.medications.length > 100 ? '...' : '')
                                            : 'Medication details available'
                                        }
                                      </div>
                                    </div>

                                    {prescription.instructions && (
                                      <div className="text-sm">
                                        <strong>Instructions:</strong>
                                        <p className="mt-1 text-muted-foreground">{prescription.instructions}</p>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <History className="h-5 w-5" />
                        <span>Medical Timeline</span>
                        <Badge variant="default" className="status-badge status-active">
                          {selectedPatient.consultations.length + selectedPatient.prescriptions.length} events
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MedicalTimeline
                        consultations={selectedPatient.consultations}
                        prescriptions={selectedPatient.prescriptions}
                        onViewConsultation={handleViewConsultation}
                        onViewPrescription={handleViewPrescription}
                        loading={isLoading}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
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
        appointment={selectedConsultation}
      />

      <PrescriptionViewModal
        open={isPrescriptionViewOpen}
        onOpenChange={setIsPrescriptionViewOpen}
        prescription={selectedPrescription}
      />

      <ExportOptionsModal
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        onExport={handleExport}
        patient={selectedPatient}
        loading={isExporting}
      />

      <PatientModal
        open={isPatientModalOpen}
        onOpenChange={setIsPatientModalOpen}
        patient={editingPatient}
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
      />
    </div>
  );
};

export default MedicalRecords; 