// components/today/InlineConsultationForm.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Eye, CheckCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useConsultationData, useConsultationForm } from "@/hooks/consultation";
import { ConsultationSectionCard } from "@/components/consultation/ConsultationSectionCard";
import { mapDepartmentName } from "@/components/consultation/constants";
import { specialtyFieldSections } from "@/lib/consultationNotesSchemas";
import type { PatientDetail } from "@/hooks/usePatientDetail";
import type { AIStructuredOutput } from "@/types/voice";
import type { Consultation, DepartmentInfo, PatientWithClinic, ConsultationFormValues } from "@/types/consultation";
import type { AppointmentWithDetails } from "@/types/appointments";
import type { DbAppointment, DbPatientByClinic } from "@/types/core";

const ConsultationPreviewModal = dynamic(
  () => import("@/components/consultation/ConsultationPreviewModal").then((m) => m.ConsultationPreviewModal),
);

interface InlineConsultationFormProps {
  appointmentId: string;
  appointment: DbAppointment | null;
  patient: DbPatientByClinic | null;
  patientDetail: PatientDetail | undefined;
  canEditConsultation: boolean;
  aiStructuredData: AIStructuredOutput | null;
  onAiDataConsumed: () => void;
  onComplete: () => void;
  formRef: React.RefObject<HTMLDivElement>;
}

export function InlineConsultationForm({
  appointmentId,
  appointment,
  patient,
  patientDetail,
  canEditConsultation: canEditConsultationOverride,
  aiStructuredData,
  onAiDataConsumed,
  onComplete,
  formRef,
}: InlineConsultationFormProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const {
    previousConsultations,
    recentPrescriptions,
    existingConsultation,
    departmentInfo,
    isInitialLoading,
    isRefetching,
  } = useConsultationData({
    appointmentId,
    appointment: appointment as unknown as AppointmentWithDetails | null,
    patientDetail: patientDetail ?? null,
  });

  const departmentType = useMemo(() => {
    const name = departmentInfo?.clinic_departments?.department_types?.name || "";
    return mapDepartmentName(name);
  }, [departmentInfo]);

  const specialtySections = useMemo(
    () => specialtyFieldSections[departmentType] || specialtyFieldSections["General"],
    [departmentType],
  );

  const {
    form,
    isConsultationCompleted,
    canEditConsultation,
    autoSaveMutation,
    handleSave,
    handleCompleteConsultation,
    mandatoryFieldsStatus,
    justCompleted,
  } = useConsultationForm({
    appointmentId,
    appointment,
    existingConsultation,
    departmentType,
    canEditConsultation: canEditConsultationOverride,
  });

  // AI injection
  useEffect(() => {
    if (!aiStructuredData) return;

    const currentSpecialtyData = (form.getValues().specialty_data || {}) as Record<string, unknown>;
    const merged: Record<string, unknown> = {
      ...currentSpecialtyData,
      chief_complaint:
        aiStructuredData.symptoms !== "NOT_SPECIFIED"
          ? aiStructuredData.symptoms
          : currentSpecialtyData.chief_complaint || "",
      diagnosis:
        aiStructuredData.diagnosis !== "NOT_SPECIFIED"
          ? aiStructuredData.diagnosis
          : currentSpecialtyData.diagnosis || "",
      treatment:
        aiStructuredData.advice !== "NOT_SPECIFIED"
          ? aiStructuredData.advice
          : currentSpecialtyData.treatment || "",
      prescriptions: aiStructuredData.prescriptions
        .filter((p) => p.drug_name !== "NOT_SPECIFIED")
        .map((p) => ({
          name: p.drug_name,
          dosage: p.dosage !== "NOT_SPECIFIED" ? p.dosage : "",
          frequency: p.frequency !== "NOT_SPECIFIED" ? p.frequency : "",
          duration: p.duration !== "NOT_SPECIFIED" ? p.duration : "",
          route: p.route !== "NOT_SPECIFIED" ? p.route : "",
          instructions: p.instructions !== "NOT_SPECIFIED" ? p.instructions : "",
        })),
    };

    form.setValue("specialty_data", merged as ConsultationFormValues["specialty_data"]);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    onAiDataConsumed();
  }, [aiStructuredData]);

  useEffect(() => {
    if (!justCompleted) return;
    toast.success("Consultation completed");
    onComplete();
  }, [justCompleted, onComplete]);

  const canComplete =
    mandatoryFieldsStatus.allCompleted && !autoSaveMutation.isPending && !isConsultationCompleted;
  const canEditCompleted = isConsultationCompleted && canEditConsultation;

  return (
    <div ref={formRef} className={`space-y-4${isInitialLoading ? " opacity-60 pointer-events-none" : ""}`}>
      {(isInitialLoading || isRefetching) && (
        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-pulse" />
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {!isConsultationCompleted && canEditConsultation && (
          <Badge variant={autoSaveMutation.isPending ? "secondary" : "outline"} className="text-xs">
            {autoSaveMutation.isPending ? "Saving..." : "Saved"}
          </Badge>
        )}
        {isConsultationCompleted && (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )}
        {isConsultationCompleted && !canEditConsultation && (
          <Badge variant="outline" className="text-xs border-green-200 text-green-700">
            <Lock className="h-3 w-3 mr-1" />
            Read Only
          </Badge>
        )}

        <div className="flex-1" />

        <Button onClick={() => setShowPreview(true)} variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-1" />Preview
        </Button>
        <Button
          onClick={handleCompleteConsultation}
          disabled={!canComplete && !canEditCompleted}
          size="sm"
          className={canComplete || canEditCompleted ? "bg-blue-600 hover:bg-blue-700 text-white" : "opacity-60"}
        >
          Complete Encounter
        </Button>
      </div>

      {specialtySections.map((section, index) => (
        <ConsultationSectionCard
          key={index}
          section={section}
          sectionIndex={index}
          form={form}
          canEditConsultation={!!canEditConsultation}
          isExpanded={expandedSections[section.title] ?? index === 0}
          onToggle={() =>
            setExpandedSections((prev) => ({
              ...prev,
              [section.title]: !expandedSections[section.title],
            }))
          }
        />
      ))}


      <ConsultationPreviewModal
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        form={form}
        patient={patient as unknown as PatientWithClinic}
        appointment={appointment as unknown as DbAppointment}
        specialtySections={specialtySections}
        departmentType={departmentType}
      />
    </div>
  );
}
