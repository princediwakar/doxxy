// components/consultation/ConsultationViewModal.tsx
"use client";
import { pdf } from '@react-pdf/renderer';
import { ConsultationPDF } from './ConsultationPDF';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppState } from "@/contexts/AppStateContext";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { sendWhatsAppMessage, isMetaConfigError } from "@/lib/whatsapp";
import { isWhatsAppEnabled } from "@/lib/feature-flags";
import { Eye, Printer, Download, MessageCircle } from "lucide-react";
import { specialtyFieldSections } from "@/lib/consultationNotesSchemas";
import { ConsultationLayout } from "./ConsultationLayout";
import { AppointmentData, Patient } from "@/types/patients";
import {
  Consultation,
  TransformedDoctorData,
  ClinicInfo,
  DoctorInfo,
  ConsultationFormValues,
  FieldValue,
} from "@/types/consultation";
import { useQuery } from "@tanstack/react-query";
import { queryPatientDetail } from "@/lib/queries/patients";
import { queryConsultationData } from "@/lib/queries/consultation";
import { queryCurrentDoctorDetails } from "@/lib/queries/doctors";
import { queryKeys } from "@/lib/query-keys";
import { Spinner } from '@/components/ui/loading';

interface ConsultationViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: AppointmentData | null;
}

export function ConsultationViewModal({
  open,
  onOpenChange,
  appointment,
}: ConsultationViewModalProps) {
  const { activeClinicId, activeClinicName, user, userClinics } = useAppState();

  const patientQuery = useQuery({
    queryKey: queryKeys.patients.byId(appointment?.patient_id ?? ""),
    queryFn: () => queryPatientDetail(activeClinicId!, appointment!.patient_id!),
    enabled:
      open &&
      !!appointment?.patient_id &&
      !!activeClinicId &&
      (!appointment.patient_gender || !appointment.patient_age),
    staleTime: 5 * 60 * 1000,
  });

  const consultationQuery = useQuery({
    queryKey: queryKeys.consultations.byAppointment(appointment?.id ?? ""),
    queryFn: () => queryConsultationData(appointment!.id!),
    enabled: open && !!appointment?.id,
    staleTime: 5 * 60 * 1000,
  });

  const doctorQuery = useQuery({
    queryKey: queryKeys.doctors.details(
      appointment?.doctor_id ?? "",
      activeClinicId ?? "",
    ),
    queryFn: () =>
      queryCurrentDoctorDetails(activeClinicId!, appointment!.doctor_id!),
    enabled: open && !!appointment?.doctor_id && !!activeClinicId,
    staleTime: 5 * 60 * 1000,
  });

  const patientData = patientQuery.data?.patient ?? null;
  const consultationData = consultationQuery.data?.consultation ?? null;
  const isLoadingConsultation = consultationQuery.isLoading;
  const doctorDetails = doctorQuery.data;

  // Determine department and get field configs
  const firstDoctor =
    doctorDetails && Array.isArray(doctorDetails) && doctorDetails.length > 0
      ? doctorDetails[0]
      : null;
  const departmentType = firstDoctor?.department_name || "General";

  // Get consultation specialty data
  const specialtyData =
    consultationData?.specialty_data &&
    typeof consultationData.specialty_data === "object" &&
    !Array.isArray(consultationData.specialty_data)
      ? (consultationData.specialty_data as Record<string, unknown>)
      : {};

  // Helper function to clean empty objects from specialty data
  const cleanSpecialtyData = (
    data: Record<string, unknown>
  ): Record<string, FieldValue> => {
    const cleaned: Record<string, FieldValue> = {};

    Object.entries(data).forEach(([key, value]) => {
      if (!value) return;

      if (typeof value === "string" && value.trim().length > 0) {
        cleaned[key] = value;
      } else if (Array.isArray(value) && value.length > 0) {
        cleaned[key] = value as FieldValue;
      } else if (typeof value === "object" && value !== null) {
        const obj = value as Record<string, unknown>;
        const hasContent = Object.values(obj).some((val) => {
          if (typeof val === "string") return val.trim().length > 0;
          if (Array.isArray(val)) return val.length > 0;
          if (typeof val === "object" && val !== null) {
            return Object.values(val as Record<string, unknown>).some(
              (nestedVal) =>
                typeof nestedVal === "string" && nestedVal.trim().length > 0
            );
          }
          return false;
        });

        if (hasContent) {
          cleaned[key] = value as FieldValue;
        }
      }
    });

    return cleaned;
  };

  // Clean the specialty data to remove empty objects
  const cleanedSpecialtyData = cleanSpecialtyData(specialtyData);

  // Get patient info with fallback to fetched patient data
  const patient = (patientData || {
    name: appointment?.patient_name || "Unknown",
    gender: appointment?.patient_gender || "Unknown",
    age: appointment?.patient_age || null,
    phone: "",
    email: "",
    whatsapp_consent: false,
    whatsapp_opt_out: false,
    address: "",
    clinic_id: activeClinicId || "",
    created_at: "",
    id: "",
    uhid: "",
    legacy_medical_id: null,
  }) as Patient;

  // Derive full clinic details from AppState (userClinics already contains the full DbClinic row)
  const activeClinic = activeClinicId
    ? userClinics.find((c) => c.clinic_id === activeClinicId)?.clinics ?? null
    : null;

  // Prepare clinic info for layout display
  const clinicInfo: ClinicInfo | null = activeClinic
    ? {
        name: activeClinic.name,
        address: activeClinic.address || "",
        phone: activeClinic.phone || "",
        email: activeClinic.email || "",
        website: activeClinic.website || null,
      }
    : null;

  // Prepare doctor info
  const doctorName =
    firstDoctor?.name ||
    appointment?.doctor_name ||
    user?.user_metadata?.full_name ||
    "Doctor Name";
  const doctorSpecialization = firstDoctor?.department_name || departmentType;
  const doctorInfo: DoctorInfo = {
    name: doctorName,
    qualification: "",
    specialization: doctorSpecialization,
    registration_number: "",
    phone: firstDoctor?.phone || user?.phone || "",
    email: firstDoctor?.email || user?.email || "",
    bio: firstDoctor?.bio || "",
    signature: firstDoctor?.signature || `Dr. ${doctorName}\n${doctorSpecialization}`,
  };

  // Get field sections for the department
  const sections =
    specialtyFieldSections[departmentType] || specialtyFieldSections.General;

  const handlePrint = async () => {
    if (!consultationData) {
      toast.error("No consultation data to print");
      return;
    }

    // Open window synchronously to avoid popup blocker, then redirect after blob is ready
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Pop-up blocked. Please allow pop-ups for this site to print.");
      return;
    }

    try {
      const doc = (
        <ConsultationPDF
          patient={patient}
          appointment={{
            ...appointment,
            clinic_id: appointment?.clinic_id || activeClinicId || "",
            notes: appointment?.notes || "",
          } as any}
          clinicInfo={clinicInfo}
          doctorInfo={doctorInfo}
          consultationData={cleanedSpecialtyData}
          departmentType={departmentType}
          showClinicHeader={false}
        />
      );

      const asPdf = pdf();
      asPdf.updateContainer(doc);
      const blob = await asPdf.toBlob();
      const url = URL.createObjectURL(blob);
      printWindow.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 60_000);

      toast.success("Print dialog opened. Use your browser's print function.");
    } catch (error) {
      printWindow.close();
      logger.error("Error printing consultation:", error);
      toast.error("Failed to open print dialog");
    }
  };

  const handleDownloadPdf = async () => {
    if (!consultationData) return;

    const toastId = toast.loading("Generating vector PDF...");

    try {
      const doc = (
        <ConsultationPDF
          patient={patient}
          appointment={{
            ...appointment,
            clinic_id: appointment?.clinic_id || activeClinicId || "",
            notes: appointment?.notes || "",
          } as any}
          clinicInfo={clinicInfo}
          doctorInfo={doctorInfo}
          consultationData={cleanedSpecialtyData}
          departmentType={departmentType}
        />
      );

      const asPdf = pdf();
      asPdf.updateContainer(doc);
      const blob = await asPdf.toBlob();

      const dateStr = appointment?.date
        ? new Date(appointment.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];
      const docName = doctorInfo.name?.replace(/\s+/g, "_") || "Doctor";
      const filename = `Consultation_${docName}_${dateStr}.pdf`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("PDF Downloaded", { id: toastId });
    } catch (error) {
      logger.error("Error generating vector PDF:", error);
      toast.error("Failed to generate PDF", { id: toastId });
    }
  };

  const handleSendWhatsapp = async () => {
    if (!consultationData || !patient?.phone) return;

    const toastId = toast.loading("Generating vector PDF...");

    try {
      const doc = (
        <ConsultationPDF
          patient={patient}
          appointment={{
            ...appointment,
            clinic_id: appointment?.clinic_id || activeClinicId || "",
            notes: appointment?.notes || "",
          } as any}
          clinicInfo={clinicInfo}
          doctorInfo={doctorInfo}
          consultationData={cleanedSpecialtyData}
          departmentType={departmentType}
        />
      );

      const asPdf = pdf();
      asPdf.updateContainer(doc);
      const blob = await asPdf.toBlob();

      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const base64Pdf = base64data.split(",")[1];

        const dateStr = appointment?.date
          ? new Date(appointment.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];
        const docName = doctorInfo.name?.replace(/\s+/g, "_") || "Doctor";
        const filename = `Consultation_${docName}_${dateStr}.pdf`;

        toast.loading("Sending via WhatsApp...", { id: toastId });

        const result = await sendWhatsAppMessage({
          type: "document",
          to: patient.phone,
          base64Pdf,
          filename,
          caption: `Consultation from ${doctorInfo.name || activeClinicName}`,
          clinicId: activeClinicId,
          patientId: appointment?.patient_id,
        });

        if (result.success) {
          toast.success("Sent via WhatsApp", { id: toastId });
        } else if (isMetaConfigError(result)) {
          toast.error("WhatsApp setup incomplete. Add a payment method and verify your number in the Meta Business dashboard to send messages.", { duration: Infinity, closeButton: true, id: toastId });
        } else {
          toast.error(result.error || "Failed to send", { id: toastId });
        }
      };
    } catch (error) {
      logger.error("Error sending WhatsApp PDF:", error);
      toast.error("Failed to generate and send document", { id: toastId });
    }
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Consultation Notes - {patient.name}</span>
            </DialogTitle>
            {consultationData && (
              <div className="flex items-center gap-1.5">
                {isWhatsAppEnabled && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSendWhatsapp}
                          disabled={!patient?.phone}
                          className="border-green-500 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950 hover:text-green-700 dark:hover:text-green-300"
                        >
                          <MessageCircle className="h-4 w-4 mr-1.5" />
                          WhatsApp
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {!patient?.phone && (
                      <TooltipContent>
                        <p>No phone number</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
                )}
                <Button size="sm" variant="outline" onClick={handleDownloadPdf}>
                  <Download className="h-4 w-4 mr-1.5" />
                  Download
                </Button>
                <Button size="sm" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-1.5" />
                  Print
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-8rem)]">
          {/* Loading State */}
          {isLoadingConsultation && (
            <div className="flex items-center justify-center p-8">
              <Spinner size="lg" />
              <span className="ml-2">Loading consultation details...</span>
            </div>
          )}

          {/* No Data State */}
          {!isLoadingConsultation && !consultationData && (
            <div className="text-center text-muted-foreground p-8">
              <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No consultation notes found for this appointment.</p>
            </div>
          )}

          {/* Consultation Layout */}
          {!isLoadingConsultation && consultationData && (
            <ConsultationLayout
              patient={patient}
              appointment={{
                ...appointment,
                clinic_id:
                  appointment?.clinic_id || activeClinicId || "",
                notes: appointment.notes || "",
              }}
              clinicInfo={clinicInfo}
              doctorInfo={doctorInfo}
              consultationData={cleanedSpecialtyData}
              specialtySections={sections}
              departmentType={departmentType}
              className="p-4"
            />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
