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
import { UseFormReturn } from "react-hook-form";
import type { ConsultationFormValues, FieldValue } from "@/types/consultation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConsultationLayout } from "./ConsultationLayout";
import { useAppState } from "@/contexts/AppStateContext";
import { pdf } from '@react-pdf/renderer';
import { ConsultationPDF } from './ConsultationPDF';
import { printConsultation } from "./consultationPrintUtils";
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
  const { activeClinicId, activeClinicName, user } = useAppState();

  // Get consultation data from form
  const consultationData = form.watch("specialty_data") as Record<string, FieldValue>;

  // Get the full clinic object for printing
  const clinicDetails = (activeClinicId && activeClinicName) ? { id: activeClinicId, name: activeClinicName } as any : null;

  // Prepare clinic info for layout display
  const clinicInfo = clinicDetails
    ? {
        name: clinicDetails.name,
        address: clinicDetails.address || undefined,
        phone: clinicDetails.phone || undefined,
        email: clinicDetails.email || undefined,
        website: clinicDetails.website || undefined,
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
  const doctorInfo = {
    name: doctorDetails?.name || user?.user_metadata?.full_name || "",
    specialization: doctorDetails?.department_name || departmentType,
    qualification: "", // Default qualification
    registration_number: "", // Not available in current database schema
    phone: doctorDetails?.phone || user?.phone || "",
    email: doctorDetails?.email || user?.email || "",
    bio: doctorDetails?.bio || "",
    signature: doctorDetails?.signature || "",
  };

  const handlePrint = async () => {
    try {
      await printConsultation(
        consultationData,
        patient,
        appointment,
        clinicDetails,
        doctorInfo,
        user,
        departmentType
      );
      toast.success("Print dialog opened successfully");
    } catch (error) {
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

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/whatsapp-messaging`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "document",
              to: patient.phone,
              base64Pdf,
              filename,
              caption: `Consultation from ${doctorInfo.name || activeClinicName}`,
              clinicId: activeClinicId,
            }),
          },
        );

        const result = await res.json();

        if (result.success) {
          toast.success("Sent via WhatsApp", { id: toastId });
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
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Consultation Preview
            </DialogTitle>
            <DialogDescription>
              Review your consultation notes
            </DialogDescription>
            <div className="flex items-center gap-2">
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
                        <MessageCircle className="h-4 w-4 mr-2" />
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
              <Button size="sm" variant="outline" onClick={handleDownloadPdf}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
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
