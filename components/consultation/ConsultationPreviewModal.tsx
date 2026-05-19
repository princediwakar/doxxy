// File: components/consultation/ConsultationPreviewModal.tsx
"use client";
import { logger } from "@/lib/logger";
import { Eye, Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { DbPatient, DbAppointment } from "@/types/core";
import { UseFormReturn } from "react-hook-form";
import type { ConsultationFormValues, FieldValue } from "@/types/consultation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConsultationLayout } from "./ConsultationLayout";
import { useAppState } from "@/contexts/AppStateContext";
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
            <Button size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
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
