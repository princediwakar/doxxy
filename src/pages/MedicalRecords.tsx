import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Database } from '@/integrations/supabase/types';
import { ConsultationViewModal } from '@/components/consultations/ConsultationViewModal';
import { MedicalTimeline } from '@/components/medical-records/MedicalTimeline';
import { PrescriptionViewModal } from '@/components/prescriptions/PrescriptionViewModal';
import { ExportOptionsModal } from '@/components/ExportOptionsModal';
import { MedicalRecordPDFExporter } from '@/lib/pdfExport';
import { toast } from 'sonner';

const supabase = getSupabase();

// Types
type Patient = Database['public']['Tables']['patients']['Row'];
type Consultation = Database['public']['Tables']['consultations']['Row'];
type Prescription = Database['public']['Tables']['prescriptions']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];

interface ConsultationWithAppointment extends Consultation {
  appointment: {
    id?: string;
    clinic_id?: string;
    patient_id?: string;
    date: string;
    time: string;
    doctor_id: string;
    type?: 'Walk-in' | 'Digital';
    status?: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
    notes?: string;
    created_at?: string;
    doctor_name?: string;
    department_name?: string;
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
  notes: string;
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
  dateRange?: {
    from: Date;
    to: Date;
  };
}

const fetchPatientsWithMedicalRecords = async (clinicId: string, searchTerm: string) => {
  console.log("fetchPatientsWithMedicalRecords: Fetching for clinic", clinicId, "search", searchTerm);

  // First get all patients
  let patientsQuery = supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', clinicId);

  if (searchTerm.trim()) {
    patientsQuery = patientsQuery.ilike('name', `%${searchTerm}%`);
  }

  const { data: patients, error: patientsError } = await patientsQuery;
  if (patientsError) throw patientsError;

  // For each patient, fetch their consultations and prescriptions with simpler queries
  const patientsWithRecords = await Promise.all(
    (patients || []).map(async (patient) => {
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

          // Use the existing get_doctors_by_clinic RPC to get doctor details
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

  return patientsWithRecords;
};

const MedicalRecords = () => {
  const { activeClinic, activeClinicRole, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientWithConsultations | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<AppointmentData | null>(null);
  const [isConsultationViewOpen, setIsConsultationViewOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isPrescriptionViewOpen, setIsPrescriptionViewOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { data: patientsWithRecords, isLoading, error } = useQuery({
    queryKey: ['patientsWithMedicalRecords', activeClinic?.clinic_id, searchTerm],
    queryFn: () => fetchPatientsWithMedicalRecords(activeClinic!.clinic_id, searchTerm),
    enabled: !!activeClinic && !authLoading,
    retry: 1,
  });

  const handleViewConsultation = (consultation: ConsultationWithAppointment) => {
    const appointmentData = {
      id: consultation.appointment.id || '',
      clinic_id: consultation.appointment.clinic_id || activeClinic?.clinic_id || '',
      patient_id: consultation.appointment.patient_id || selectedPatient?.id || '',
      doctor_id: consultation.appointment.doctor_id || '',
      date: consultation.appointment.date,
      time: consultation.appointment.time,
      type: consultation.appointment.type || 'Walk-in' as const,
      status: consultation.appointment.status || 'Completed' as const,
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
        options.includeConsultations ? consultationData : [],
        options.includePrescriptions ? prescriptionData : [],
        activeClinic?.clinics?.name || 'Medical Clinic',
        {
          includeConsultations: options.includeConsultations,
          includePrescriptions: options.includePrescriptions,
          dateRange: options.dateRange,
        }
      );

      toast.success('PDF exported successfully!', { id: exportToast });
      setIsExportModalOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export PDF. Please try again.', { id: exportToast });
    } finally {
      setIsExporting(false);
    }
  };

  const getAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return 'Unknown';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (authLoading) {
    return null;
  }

  if (!activeClinic) {
    return <div className="text-center py-4">Please select a clinic to view medical records.</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error loading medical records.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Medical Records</h1>
          <p className="text-muted-foreground">Comprehensive patient medical history and records</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button 
            variant="outline"
            onClick={() => selectedPatient && setIsExportModalOpen(true)}
            disabled={!selectedPatient}
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search patients..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patients List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Patients</span>
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
                ) : (
                  <div className="space-y-1">
                    {(patientsWithRecords || []).map((patient) => (
                      <div
                        key={patient.id}
                        className={`p-4 cursor-pointer transition-colors border-b hover:bg-muted/50 ${
                          selectedPatient?.id === patient.id ? 'bg-muted' : ''
                        }`}
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{patient.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {patient.gender} • Age {getAge(patient.date_of_birth)}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="text-xs">
                              {patient.consultations.length} visits
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Patient Details */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <Tabs defaultValue="consultations" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedPatient.name}</h2>
                  <p className="text-muted-foreground">
                    {selectedPatient.gender} • Age {getAge(selectedPatient.date_of_birth)} • 
                    Medical ID: {selectedPatient.medical_id}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExportModalOpen(true)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Records
                  </Button>
                  <TabsList>
                    <TabsTrigger value="consultations">Consultations</TabsTrigger>
                    <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  </TabsList>
                </div>
              </div>

              <TabsContent value="consultations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Stethoscope className="h-5 w-5" />
                      <span>Consultation History</span>
                      <Badge variant="secondary">{selectedPatient.consultations.length}</Badge>
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
                            <Card key={consultation.id} className="border-l-4 border-l-primary">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium">
                                        {format(parseISO(consultation.appointment.date), 'PPP')}
                                      </span>
                                      <Badge variant="outline">
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
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewConsultation(consultation)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
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
                      <Badge variant="secondary">{selectedPatient.prescriptions.length}</Badge>
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
                            <Card key={prescription.id} className="border-l-4 border-l-green-500">
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
                                      <Badge variant="outline">
                                        Follow-up: {format(parseISO(prescription.follow_up_date), 'PP')}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-sm">
                                    <strong>Medications:</strong>
                                    <div className="mt-1 p-2 bg-muted/30 rounded">
                                      {typeof prescription.medications === 'object' ? 
                                        JSON.stringify(prescription.medications, null, 2) :
                                        prescription.medications
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
                      <Badge variant="secondary">
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
          ) : (
            <Card>
              <CardContent className="p-8">
                <div className="text-center text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select a patient to view their medical records</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Consultation View Modal */}
      <ConsultationViewModal
        open={isConsultationViewOpen}
        onOpenChange={setIsConsultationViewOpen}
        appointment={selectedConsultation}
      />

      {/* Prescription View Modal */}
      <PrescriptionViewModal
        open={isPrescriptionViewOpen}
        onOpenChange={setIsPrescriptionViewOpen}
        prescription={selectedPrescription}
      />

      {/* Export Options Modal */}
      <ExportOptionsModal
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        onExport={handleExport}
        patient={selectedPatient}
        loading={isExporting}
      />
    </div>
  );
};

export default MedicalRecords; 