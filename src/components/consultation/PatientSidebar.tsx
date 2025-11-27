import { useState } from "react";
import {
  User,
  Calendar,
  Phone,
  Mail,
  History,
  Heart,
  AlertCircle,
  Eye,
  Pill,
  Clock,
  FileText,
  ChevronRight,
} from "lucide-react";
import { formatTimeIST } from "@/lib/utils";
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
  Patient,
  Prescription,
  Consultation,
  PrescriptionMedication,
} from "./types";
import { Tables } from "@/integrations/supabase/types";

type DepartmentInfo =
  | {
      department_id: string | null;
      clinic_departments: {
        department_types: {
          name: string;
        } | null;
      } | null;
    }
  | null
  | undefined;

interface PatientSidebarProps {
  patient: Patient;
  appointment: Tables<"appointments"> | null;
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

  const getConsultationData = () => {
    try {
      return typeof consultation.specialty_data === "string"
        ? JSON.parse(consultation.specialty_data)
        : consultation.specialty_data || {};
    } catch {
      return {};
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
  patient,
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
      {/* Patient Information */}
      <Card className="bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-base">
            <User className="h-5 w-5 text-primary" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
              {patient?.name?.charAt(0)?.toUpperCase() || "P"}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {patient?.name || "Unknown Patient"}
              </p>
              <p className="text-sm text-gray-600">
                {patient?.age && `${patient.age} yrs`}
                {patient?.gender && ` • ${patient.gender}`}
              </p>
            </div>
          </div>

          {patient?.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              {patient.phone}
            </div>
          )}

          {patient?.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              {patient.email}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointment Details */}
      <Card className="bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-base">
            <Calendar className="h-5 w-5 text-success" />
            Today's Appointment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Time</span>
            <span className="text-sm font-medium">
              {appointment?.time ? formatTimeIST(appointment.time) : "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Type</span>
            <Badge variant="outline" className="text-xs">
              {appointment?.type}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Medical History - Enhanced with Preview */}
      {previousConsultations && previousConsultations.length > 0 && (
        <Card className="bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-base">
              <History className="h-5 w-5 text-orange-600" />
              Medical History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
              Recent Consultations
            </div>
            {previousConsultations.slice(0, 3).map((consultation) => {
              const getConsultationData = () => {
                try {
                  return typeof consultation.specialty_data === "string"
                    ? JSON.parse(consultation.specialty_data)
                    : consultation.specialty_data || {};
                } catch {
                  return {};
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
              const chiefComplaint =
                consultationData.chief_complaint || getClinicalNotes();

              return (
                <div
                  key={consultation.id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-background transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs text-gray-500">
                          {consultation.created_at
                            ? format(
                                new Date(consultation.created_at),
                                "MMM d, yyyy"
                              )
                            : "Unknown date"}
                        </p>
                        <Clock className="h-3 w-3 text-gray-400" />
                      </div>

                      {/* Chief Complaint or Clinical Notes Preview */}
                      {chiefComplaint && (
                        <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                          <span className="font-medium text-gray-800">
                            Chief Complaint:{" "}
                          </span>
                          {typeof chiefComplaint === "string" &&
                          chiefComplaint.length > 50
                            ? `${chiefComplaint.substring(0, 50)}...`
                            : String(chiefComplaint)}
                        </p>
                      )}

                      {/* Assessment Preview */}
                      {consultationData.assessment && (
                        <p className="text-xs text-indigo-600 mt-1 line-clamp-1">
                          <span className="font-medium">Assessment: </span>
                          {consultationData.assessment.length > 40
                            ? `${consultationData.assessment.substring(
                                0,
                                40
                              )}...`
                            : consultationData.assessment}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewConsultation(consultation)}
                      className="h-8 w-8 p-0 ml-2"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {previousConsultations.length > 3 && (
              <div className="text-center pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  View {previousConsultations.length - 3} more consultations
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Medications - Enhanced Display */}
      {recentPrescriptions && recentPrescriptions.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-base">
              <Heart className="h-5 w-5 text-destructive" />
              Recent Medications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPrescriptions.slice(0, 4).map((prescription) => {
              // Extract all medications from the prescription
              const medications = Array.isArray(prescription.medications)
                ? (prescription.medications as PrescriptionMedication[])
                : [];

              return (
                <div
                  key={prescription.id}
                  className="p-3 bg-red-50 rounded-lg border-l-4 border-red-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-destructive font-medium uppercase tracking-wide">
                      {prescription.created_at
                        ? format(
                            new Date(prescription.created_at),
                            "MMM d, yyyy"
                          )
                        : "Unknown date"}
                    </p>
                    <Pill className="h-3 w-3 text-destructive" />
                  </div>

                  <div className="space-y-2">
                    {medications.slice(0, 2).map((med, index: number) => (
                      <div key={index} className="space-y-1">
                        <p className="text-sm font-medium text-red-900">
                          {med.name || "Medication"}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs text-red-700">
                          {med.dosage && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-red-100 text-red-800"
                            >
                              {med.dosage}
                            </Badge>
                          )}
                          {med.frequency && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-red-100 text-red-800"
                            >
                              {med.frequency}
                            </Badge>
                          )}
                          {med.duration && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-red-100 text-red-800"
                            >
                              {med.duration}
                            </Badge>
                          )}
                        </div>
                        {med.instructions && (
                          <p className="text-xs text-destructive italic">
                            {med.instructions}
                          </p>
                        )}
                      </div>
                    ))}

                    {medications.length > 2 && (
                      <p className="text-xs text-destructive italic">
                        +{medications.length - 2} more medications
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Important Notes - Enhanced */}
      <Card className="bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-base">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Appointment Notes */}
          {appointment?.notes && (
            <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-yellow-600" />
                <div className="text-xs text-yellow-600 uppercase tracking-wide font-medium">
                  Appointment Notes
                </div>
              </div>
              <p className="text-sm text-yellow-800">{appointment.notes}</p>
            </div>
          )}

          {/* Empty state */}
          {!appointment?.notes && (
            <div className="text-center py-4 text-gray-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No important notes available</p>
              <p className="text-xs text-gray-400 mt-1">
                Notes added during appointment creation will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consultation Preview Modal */}
      <ConsultationPreviewModal
        consultation={selectedConsultation}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
      />
    </div>
  );
};
