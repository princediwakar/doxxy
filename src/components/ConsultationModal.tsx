
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import { MedicalRecordForm } from "./medical-records/MedicalRecordForm";

interface ConsultationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any | null;
}

export function ConsultationModal({ open, onOpenChange, appointment }: ConsultationModalProps) {
  const handleComplete = () => {
    onOpenChange(false);
    // Refresh the page to show updated appointment status
    window.location.reload();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Consultation - {appointment.patients?.name}</DialogTitle>
          <DialogDescription>
            Complete the medical consultation and create patient records.
          </DialogDescription>
        </DialogHeader>

        <MedicalRecordForm
          appointment={appointment}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
