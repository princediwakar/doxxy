//src/pages/Patients.tsx
"use client";
import { logger } from "@/lib/logger";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, FileText, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePatientsWithRecords } from "@/hooks/usePatientsWithRecords";
import {
  AppointmentData,
  ConsultationWithAppointment,
  Consultation,
  Patient,
  PatientWithConsultations,
  Prescription,
  SpecialtyData,
} from "@/types/patients";
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { PrescriptionViewModal } from "@/components/prescriptions/PrescriptionViewModal";
import { ExportOptionsModal, ExportConfiguration } from "@/components/ExportOptionsModal";
import { AppointmentModal } from "@/components/appointments/AppointmentModal";
import { PatientModal } from "@/components/patients/PatientModal";
import { Spinner } from '@/components/ui/loading';

// Lazy load heavy components
const ConsultationViewModal = dynamic(() => import('@/components/consultation/ConsultationViewModal').then(mod => mod.ConsultationViewModal));
const BillingModal = dynamic(() => import('@/components/billing/BillingModal').then(mod => mod.BillingModal));
import { toast } from "sonner";
import { PatientsPageHeader } from "@/components/patients/PatientsPageHeader";
import { PatientSearch } from "@/components/patients/PatientSearch";
import { PatientList } from "@/components/patients/PatientList";
import { PatientDetailView } from "@/components/patients/PatientDetailView";
import { useFABAction } from "@/hooks/useFABAction";
import { formatTimeIST } from "@/lib/utils";

const PatientRecords = () => {
  const { activeClinic, loading: authLoading } = useAuth();
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

  const { data, isLoading, error } = usePatientsWithRecords(
    activeClinic?.clinics?.id ?? "",
    searchTerm,
    currentPage,
    itemsPerPage,
    !!activeClinic && !authLoading
  );

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
      <Suspense fallback={<div className="flex items-center justify-center p-4"><Spinner size="md" /></div>}>
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
        }}
      />

      <AppointmentModal
        open={isAppointmentModalOpen}
        onOpenChange={setIsAppointmentModalOpen}
        appointment={null}
        patient={selectedPatient}
      />

      <Suspense fallback={<div className="flex items-center justify-center p-4"><Spinner size="md" /></div>}>
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