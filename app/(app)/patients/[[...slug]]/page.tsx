//src/pages/Patients.tsx
"use client";
import { logger } from "@/lib/logger";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, FileText, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AppointmentData,
  ConsultationWithAppointment,
  Consultation,
  Patient,
  PatientWithConsultations,
  Prescription,
  SpecialtyData,
  AppointmentStatus,
  DoctorWithDepartmentInfo,
} from "@/types/patients";
import { Suspense, lazy } from 'react';
import { PrescriptionViewModal } from "@/components/prescriptions/PrescriptionViewModal";
import { ExportOptionsModal, ExportConfiguration } from "@/components/ExportOptionsModal";
import { AppointmentModal } from "@/components/appointments/AppointmentModal";
import { PatientModal } from "@/components/patients/PatientModal";

// Lazy load heavy components
const ConsultationViewModal = lazy(() => import('@/components/consultation/ConsultationViewModal').then(module => ({ default: module.ConsultationViewModal })));
const BillingModal = lazy(() => import('@/components/billing/BillingModal').then(module => ({ default: module.BillingModal })));
import { toast } from "sonner";
import { PatientsPageHeader } from "@/components/patients/PatientsPageHeader";
import { PatientSearch } from "@/components/patients/PatientSearch";
import { PatientList } from "@/components/patients/PatientList";
import { PatientDetailView } from "@/components/patients/PatientDetailView";
import { useFABAction } from "@/hooks/useFABAction";
import { formatTimeIST } from "@/lib/utils";

const supabase = getSupabase();

const fetchPatientsWithMedicalRecords = async (
  clinicId: string,
  searchTerm: string,
  currentPage: number,
  itemsPerPage: number
): Promise<{ patients: PatientWithConsultations[]; totalCount: number }> => {
  logger.log(
    "fetchPatientsWithMedicalRecords: Fetching for clinic",
    clinicId,
    "search",
    searchTerm,
    "page",
    currentPage
  );

  // First get all patients for filtering and count
  let allPatientsQuery = supabase
    .from("patients")
    .select("*")
    .eq("clinic_id", clinicId);

  if (searchTerm.trim()) {
    allPatientsQuery = allPatientsQuery.ilike("name", `%${searchTerm}%`);
  }

  const { data: allPatients, error: patientsError } = await allPatientsQuery;
  if (patientsError) throw patientsError;

  // Apply pagination
  const totalCount = allPatients?.length || 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const patients =
    allPatients?.slice(startIndex, startIndex + itemsPerPage) || [];

  // Fetch doctors once — avoids N+1 per-consultation RPC calls
  type RpcDoctor = { id: string; name: string; department_name: string };
  let doctors: RpcDoctor[] = [];

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "get_doctors_by_clinic",
    { clinic_id: clinicId }
  );

  if (!rpcError && rpcData) {
    doctors = rpcData as unknown as RpcDoctor[];
  } else {
    const { data: fallbackData } = await supabase
      .from("doctors")
      .select(
        `
        id,
        name,
        primary_specialization,
        clinic_members!clinic_members_user_id_fkey(
          department_id,
          clinic_departments!clinic_members_department_id_fkey(
            department_type_id,
            department_types!clinic_departments_department_type_id_fkey(name)
          )
        )
      `
      )
      .eq("clinic_id", clinicId)
      .eq("is_active", true);

    const typedFallbackData = (fallbackData || []) as unknown as DoctorWithDepartmentInfo[];

    doctors = typedFallbackData.map((doctor) => ({
      id: doctor.id,
      name: doctor.name,
      department_name:
        doctor.clinic_members?.[0]?.clinic_departments
          ?.department_types?.name ||
        doctor.primary_specialization ||
        "General Medicine",
    }));
  }

  // For each patient, fetch consultations and prescriptions, then enrich with pre-fetched doctor data
  const patientsWithRecords = await Promise.all(
    patients.map(async (patient) => {
      const { data: consultations } = await supabase
        .from("consultations")
        .select(
          `
          *,
          appointments(
            id,
            date,
            time,
            status,
            doctor_id
          )
        `
        )
        .eq("patient_id", patient.id)
        .order("created_at", { ascending: false });

      const { data: prescriptions } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("patient_id", patient.id)
        .order("created_at", { ascending: false });

      // Filter to completed first, then enrich with doctor data
      const completedConsultations = (consultations || [])
        .filter(
          (c) =>
            (c.appointments?.status || "").toLowerCase() === "completed"
        )
        .map((consultation) => {
          if (!consultation.appointments?.doctor_id) {
            return {
              ...consultation,
              appointment: {
                ...consultation.appointments,
                status: consultation.appointments?.status,
                doctor_name: "Unknown Doctor",
                department_name: "Unknown Department",
                date: new Date().toISOString().split("T")[0],
                time: "00:00:00",
              },
            } as ConsultationWithAppointment;
          }

          const doctor = doctors.find(
            (d) => d.id === consultation.appointments?.doctor_id
          );

          return {
            ...consultation,
            appointment: {
              ...consultation.appointments,
              status: (consultation.appointments?.status || undefined) as
                | AppointmentStatus
                | undefined,
              doctor_name: doctor?.name || "Unknown Doctor",
              department_name: doctor?.department_name || "Unknown Department",
              date: String(
                consultation.appointments?.date ||
                  new Date().toISOString().split("T")[0]
              ),
              time: String(consultation.appointments?.time || "00:00:00"),
            },
          } as ConsultationWithAppointment;
        });

      return {
        ...patient,
        consultations: completedConsultations,
        prescriptions: prescriptions || [],
      } as PatientWithConsultations;
    })
  );

  return {
    patients: patientsWithRecords,
    totalCount,
  };
};

const PatientRecords = () => {
  const { activeClinic, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedPatient, setSelectedPatient] =
    useState<PatientWithConsultations | null>(null);
  const [selectedConsultation, setSelectedConsultation] =
    useState<AppointmentData | null>(null);
  const [isConsultationViewOpen, setIsConsultationViewOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
  const [isPrescriptionViewOpen, setIsPrescriptionViewOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // New states for enhanced functionality
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Handle FAB quick-action via ?action=new
  useFABAction("new", () => {
    setEditingPatient(null);
    setIsPatientModalOpen(true);
  });

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "patientsWithMedicalRecords",
      activeClinic?.clinics?.id,
      searchTerm,
      currentPage,
    ],
    queryFn: () =>
      fetchPatientsWithMedicalRecords(
        activeClinic?.clinics?.id || "",
        searchTerm,
        currentPage,
        itemsPerPage
      ),
    enabled: !!activeClinic && !authLoading,
    retry: 1,
  });

  const patientsWithRecords = data?.patients || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleViewConsultation = (
    consultation: ConsultationWithAppointment | Consultation
  ) => {
    // Cast to ConsultationWithAppointment as we know we're in the patient detail context
    // where we always have the full appointment details
    const fullConsultation = consultation as ConsultationWithAppointment;

    // Guard clause if appointment is missing
    if (!fullConsultation.appointment) return;

    const appointmentData: AppointmentData = {
      id: fullConsultation.appointment.id || "",
      clinic_id: fullConsultation.appointment.clinic_id || "",
      patient_id: fullConsultation.appointment.patient_id || "",
      doctor_id: fullConsultation.appointment.doctor_id || "",
      date: fullConsultation.appointment.date,
      time: formatTimeIST(fullConsultation.appointment.time),
      type:
        (fullConsultation.appointment.type as "Walk-in" | "Digital") ||
        "Walk-in",
      status:
        (fullConsultation.appointment.status as
          | "Scheduled"
          | "In Progress"
          | "Completed"
          | "Cancelled") || "Completed",
      notes: fullConsultation.appointment.notes || "",
      created_at:
        fullConsultation.appointment.created_at ||
        fullConsultation.created_at ||
        new Date().toISOString(),
      patient_name: selectedPatient?.name,
      patient_gender: selectedPatient?.gender || undefined,
      patient_age: selectedPatient?.age || undefined,
      doctor_name: fullConsultation.appointment.doctor_name,
      department_name: fullConsultation.appointment.department_name,
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

  const handleExport = async (options: ExportConfiguration) => {
    if (!selectedPatient || !activeClinic) return;

    setIsExporting(true);
    const exportToast = toast.loading("Generating PDF...");

    try {
      // Dynamically import PDF exporter to reduce bundle size
      const { MedicalRecordPDFExporter } = await import('@/lib/pdfExport');
      const exporter = new MedicalRecordPDFExporter();

      // Transform consultation data for PDF export
      const consultationData = selectedPatient.consultations.map(
        (consultation) => ({
          id: consultation.id,
          created_at: consultation.created_at || consultation.appointment.date,
          specialty_data: consultation.specialty_data as SpecialtyData | null,
          appointment: {
            date: consultation.appointment.date,
            time: formatTimeIST(consultation.appointment.time),
            doctor_name: consultation.appointment.doctor_name,
            department_name: consultation.appointment.department_name,
          },
        })
      );

      // Transform prescription data for PDF export
      const prescriptionData = selectedPatient.prescriptions.map(
        (prescription) => ({
          ...prescription,
          created_at: prescription.created_at || new Date().toISOString(),
          // Ensure medications is cast as object[] if that's what the exporter library strictly demands,
          // otherwise rely on the types.
          medications: (prescription.medications || []) as unknown as object[],
          doctor_name: "Unknown Doctor", // Simplified since we don't fetch doctor details
        })
      );

      // Patient info for PDF
      const patientInfo = {
        name: selectedPatient?.name || "",
        medical_id: selectedPatient?.medical_id || "",
        gender: selectedPatient?.gender || "",
        age: selectedPatient?.age || null,
        phone: selectedPatient?.phone || undefined,
        email: selectedPatient?.email || undefined,
      };

      await exporter.exportMedicalRecord(
        patientInfo,
        consultationData,
        prescriptionData,
        activeClinic?.clinics?.name as string,
        options
      );

      toast.dismiss(exportToast);
      toast.success("PDF exported successfully!");
    } catch (error) {
      logger.error("Export error:", error);
      toast.dismiss(exportToast);
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  if (!activeClinic) {
    return (
      <Card className="m-6">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">
              Please select a clinic to view medical records.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="m-6">
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
            <div className="p-8 text-center text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Select a patient to view their medical records</p>
              <p className="text-sm mt-2">
                Click on a patient from the list to see their complete medical
                history, consultations, and prescriptions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <Suspense fallback={<div className="flex items-center justify-center p-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>}>
        <ConsultationViewModal
          open={isConsultationViewOpen}
          onOpenChange={setIsConsultationViewOpen}
          appointment={selectedConsultation || null}
        />
      </Suspense>

      <PrescriptionViewModal
        open={isPrescriptionViewOpen}
        onOpenChange={setIsPrescriptionViewOpen}
        prescription={selectedPrescription}
      />

      <ExportOptionsModal
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
        onExport={handleExport}
        patient={selectedPatient || null}
        loading={isExporting}
      />

      <PatientModal
        open={isPatientModalOpen}
        onOpenChange={setIsPatientModalOpen}
        patient={editingPatient}
        onPatientCreated={() => {
          setIsPatientModalOpen(false);
          queryClient.invalidateQueries({
            queryKey: ["patients", activeClinic?.clinic_id],
          });
        }}
      />

      <AppointmentModal
        open={isAppointmentModalOpen}
        onOpenChange={setIsAppointmentModalOpen}
        appointment={null}
        patient={selectedPatient}
      />

      <Suspense fallback={<div className="flex items-center justify-center p-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>}>
        <BillingModal
          open={isBillingModalOpen}
          onOpenChange={setIsBillingModalOpen}
          bill={null}
          patient={selectedPatient}
          appointment={selectedConsultation || null}
        />
      </Suspense>
    </div>
  );
};

export default PatientRecords;