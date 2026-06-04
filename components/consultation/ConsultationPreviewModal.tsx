// File: components/consultation/ConsultationPreviewModal.tsx
"use client";
import { logger } from "@/lib/logger";
import { Eye, Printer, Download, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { DbPatient, DbAppointment } from "@/types/core";
import { sendWhatsAppMessage, isMetaConfigError } from "@/lib/whatsapp";
import { isWhatsAppEnabled } from "@/lib/feature-flags";
import { UseFormReturn } from "react-hook-form";
import type { ConsultationFormValues, FieldValue } from "@/types/consultation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConsultationLayout } from "./ConsultationLayout";
import { useAppState } from "@/contexts/AppStateContext";
import { pdf } from '@react-pdf/renderer';
import { ConsultationPDF } from './ConsultationPDF';
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { queryCurrentDoctorByUserId } from "@/lib/queries/doctors";
import { queryKeys } from "@/lib/query-keys";

interface Section {
  title: string;
  fields: Array<{
    name: string;
    label: string;
    type?: string;
  }>;
}

interface ConsultationPreviewModalProps {
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  form: UseFormReturn<ConsultationFormValues>;
  patient: DbPatient;
  appointment: DbAppointment | null;
  specialtySections: Section[];
  departmentType?: string;
}

export const ConsultationPreviewModal = ({
  showPreview,
  setShowPreview,
  form,
  patient,
  appointment,
  specialtySections,
  departmentType = "General",
}: ConsultationPreviewModalProps) => {
  const { activeClinicId, activeClinicName, user, userClinics } = useAppState();

  // Get consultation data from form
  const consultationData = form.watch("specialty_data") as Record<string, FieldValue>;

  // Derive full clinic details from AppState (userClinics already contains the full DbClinic row)
  const activeClinic = activeClinicId
    ? userClinics.find((c) => c.clinic_id === activeClinicId)?.clinics ?? null
    : null;

  const clinicInfo = activeClinic
    ? {
        name: activeClinic.name,
        address: activeClinic.address ?? null,
        phone: activeClinic.phone ?? null,
        email: activeClinic.email ?? null,
        website: activeClinic.website ?? null,
      }
    : null;

  const { data: doctorDetails } = useQuery({
    queryKey: queryKeys.doctors.currentForClinic(
      activeClinicId ?? "",
      user?.id ?? "",
    ),
    queryFn: () =>
      queryCurrentDoctorByUserId(user!.id!, activeClinicId!),
    enabled: !!activeClinicId && !!user?.id,
  });

  // Prepare doctor info
  const doctorName = doctorDetails?.name || user?.user_metadata?.full_name || "";
  const doctorSpecialization = doctorDetails?.department_name || departmentType;
  const doctorInfo = {
    name: doctorName,
    specialization: doctorSpecialization,
    qualification: "",
    registration_number: "",
    phone: doctorDetails?.phone || user?.phone || "",
    email: doctorDetails?.email || user?.email || "",
    bio: doctorDetails?.bio || "",
    signature: doctorDetails?.signature || `Dr. ${doctorName}\n${doctorSpecialization}`,
  };

  const handlePrint = async () => {
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
          appointment={appointment}
          clinicInfo={clinicInfo as any}
          doctorInfo={doctorInfo as any}
          consultationData={consultationData}
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
    const toastId = toast.loading("Generating vector PDF...");

    try {
      const doc = (
        <ConsultationPDF
          patient={patient}
          appointment={appointment}
          clinicInfo={clinicInfo as any}
          doctorInfo={doctorInfo as any}
          consultationData={consultationData}
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
    if (!patient?.phone) return;

    const toastId = toast.loading("Generating vector PDF...");

    try {
      const doc = (
        <ConsultationPDF
          patient={patient}
          appointment={appointment}
          clinicInfo={clinicInfo as any}
          doctorInfo={doctorInfo as any}
          consultationData={consultationData}
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
          patientId: patient.id,
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

  return (
    <Dialog open={showPreview} onOpenChange={setShowPreview}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Consultation Preview
              </DialogTitle>
            </div>
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
          </div>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-8rem)]">
          <ConsultationLayout
            patient={patient}
            appointment={appointment}
            clinicInfo={clinicInfo}
            doctorInfo={doctorInfo}
            consultationData={consultationData}
            specialtySections={specialtySections}
            departmentType={departmentType}
            className="p-4"
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
