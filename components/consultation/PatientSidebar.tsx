// src/components/consultation/PatientSidebar.tsx
"use client";
import { useState } from "react";
import {
  Calendar,
  History,
  Heart,
  AlertCircle,
  Eye,
  Pill,
  Clock,
  FileText,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import {
  PatientWithClinic,
  Consultation,
  DepartmentInfo,
  ConsultationNotes
} from "@/types/consultation";
import { DbAppointment } from "@/types/core";
// Fixed: Import Prescription type
import { Prescription, PrescriptionMedication } from "@/types/prescriptions";

interface PatientSidebarProps {
  patient: PatientWithClinic;
  appointment: DbAppointment | null;
  departmentInfo: DepartmentInfo | null | undefined;
  previousConsultations: Consultation[];
  recentPrescriptions: Prescription[]; 
}

// Consultation Preview Modal Component
const ConsultationPreviewModal = ({
  consultation,
  open,
  onOpenChange,
}: {
  consultation: Consultation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  if (!consultation) return null;

  const getConsultationData = (): ConsultationNotes => {
    try {
      if (typeof consultation.specialty_data === "string") {
        return JSON.parse(consultation.specialty_data) as ConsultationNotes;
      }
      return (consultation.specialty_data || {}) as ConsultationNotes;
    } catch {
      return {} as ConsultationNotes;
    }
  };

  const getClinicalNotes = () => {
    if (!consultation.clinical_notes) return "";
    if (typeof consultation.clinical_notes === "string") {
      return consultation.clinical_notes;
    }
    return JSON.stringify(consultation.clinical_notes);
  };

  const consultationData = getConsultationData();
  const clinicalNotes = getClinicalNotes();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Consultation Details -{" "}
            {consultation.created_at
              ? format(new Date(consultation.created_at), "MMM d, yyyy")
              : "Unknown date"}
          </DialogTitle>
          <DialogDescription>
            View detailed consultation notes and treatment information
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4">
            {/* Chief Complaint */}
            {consultationData.chief_complaint && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Chief Complaint
                </h4>
                <p className="text-sm text-blue-800">
                  {consultationData.chief_complaint}
                </p>
              </div>
            )}

            {/* Assessment */}
            {consultationData.assessment && (
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Assessment</h4>
                <p className="text-sm text-purple-800">
                  {consultationData.assessment}
                </p>
              </div>
            )}

            {/* Treatment Plan */}
            {consultationData.treatment && (
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">
                  Treatment Plan
                </h4>
                <p className="text-sm text-green-800">
                  {consultationData.treatment}
                </p>
              </div>
            )}

            {/* Clinical Notes */}
            {clinicalNotes && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Clinical Notes
                </h4>
                <p className="text-sm text-gray-700">{clinicalNotes}</p>
              </div>
            )}

            {/* Additional sections if available */}
            {consultationData.physical_exam && (
              <div className="p-3 bg-success/10 rounded-lg">
                <h4 className="font-medium text-success mb-2">
                  Physical Examination
                </h4>
                <p className="text-sm text-success/80">
                  {consultationData.physical_exam}
                </p>
              </div>
            )}

            {consultationData.follow_up && (
              <div className="p-3 bg-secondary/10 rounded-lg">
                <h4 className="font-medium text-secondary mb-2">Follow-up</h4>
                <p className="text-sm text-secondary/80">
                  {consultationData.follow_up}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export const PatientSidebar = ({
  appointment,
  previousConsultations,
  recentPrescriptions,
}: PatientSidebarProps) => {
  const [selectedConsultation, setSelectedConsultation] =
    useState<Consultation | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleViewConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-4">

      {/* Consultation Preview Modal */}
      <ConsultationPreviewModal
        consultation={selectedConsultation}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
      />
    </div>
  );
};