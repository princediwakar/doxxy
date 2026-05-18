// components/schedule/InlineConsultationForm.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { Eye, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useConsultationData, useConsultationForm } from "@/hooks/consultation";
import { ConsultationSectionCard, isFieldFilled } from "@/components/consultation/ConsultationSectionCard";
import { mapDepartmentName } from "@/components/consultation/constants";
import { specialtyFieldSections } from "@/lib/consultationNotesSchemas";
import type { PatientDetail } from "@/types/core";
import type { AIStructuredOutput } from "@/types/voice";
import type { PatientWithClinic, ConsultationFormValues } from "@/types/consultation";
import type { AppointmentWithDetails } from "@/types/appointments";
import type { DbAppointment, DbPatientByClinic } from "@/types/core";
import { isBlank } from "@/lib/schemaUtils";

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
  const [savedVisible, setSavedVisible] = useState(false);

  // TODO: Fix underlying interface divergence. 
  // Centralizing type assertions here so the UI tree doesn't rely on scattered blind casting.
  const mappedAppointmentDetails = appointment as unknown as AppointmentWithDetails | null;
  const mappedPatientWithClinic = patient as unknown as PatientWithClinic;
  const mappedDbAppointment = appointment as unknown as DbAppointment;

  const {
    previousConsultations,
    recentPrescriptions,
    existingConsultation,
    departmentInfo,
  } = useConsultationData({
    appointmentId,
    appointment: mappedAppointmentDetails,
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

  const specialtyData = form.watch("specialty_data");

  // Section Expansion Optimization: Bails out if no state change occurs, preventing keystroke re-renders.
  useEffect(() => {
    if (!specialtyData || typeof specialtyData !== "object") return;
    const data = specialtyData as Record<string, unknown>;

    setExpandedSections((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const section of specialtySections) {
        if (prev[section.title] === undefined && section.fields.some((f) => isFieldFilled(data[f.name]))) {
          next[section.title] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [specialtyData, specialtySections]);

  // AI Injection Protocol
  useEffect(() => {
    if (!aiStructuredData) return;

    const currentSpecialtyData = (form.getValues().specialty_data || {}) as Record<string, unknown>;

    const cleanedRawFields: Record<string, unknown> = {};
    if (aiStructuredData.rawFields) {
      for (const [key, value] of Object.entries(aiStructuredData.rawFields)) {
        if (isBlank(value)) continue;
        cleanedRawFields[key] = value;
      }
    }

    const merged: Record<string, unknown> = {
      ...currentSpecialtyData,
      ...cleanedRawFields,
      chief_complaint: !isBlank(aiStructuredData.symptoms)
        ? aiStructuredData.symptoms
        : currentSpecialtyData.chief_complaint || "",
      diagnosis: !isBlank(aiStructuredData.diagnosis)
        ? aiStructuredData.diagnosis
        : currentSpecialtyData.diagnosis || "",
      treatment: !isBlank(aiStructuredData.advice)
        ? aiStructuredData.advice
        : (cleanedRawFields.treatment as string) || currentSpecialtyData.treatment || "",
      prescriptions: aiStructuredData.prescriptions
        .filter((p) => !isBlank(p.drug_name))
        .map((p) => ({
          name: p.drug_name,
          dosage: !isBlank(p.dosage) ? p.dosage : "",
          frequency: !isBlank(p.frequency) ? p.frequency : undefined,
          duration: !isBlank(p.duration) ? p.duration : "",
          route: !isBlank(p.route) ? p.route : undefined,
          instructions: !isBlank(p.instructions) ? p.instructions : "",
        })),
      additional_clinical_findings: aiStructuredData.additional_clinical_findings?.length
        ? aiStructuredData.additional_clinical_findings
        : undefined,
      ruled_out_findings: aiStructuredData.ruled_out_findings?.length
        ? aiStructuredData.ruled_out_findings
        : undefined,
    };

    form.setValue("specialty_data", merged as ConsultationFormValues["specialty_data"]);
    
    // Defer scroll to next frame so React can paint the injected data first.
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    
    onAiDataConsumed();
  }, [aiStructuredData, form, formRef, onAiDataConsumed]); 
  // Deps explicitly declared. Ensure onAiDataConsumed is stable in the parent hook.

  const hasCompletedAlerted = useRef(false);
  useEffect(() => {
    if (justCompleted && !hasCompletedAlerted.current) {
      hasCompletedAlerted.current = true;
      toast.success("Consultation completed");
      onComplete();
    } else if (!justCompleted) {
      hasCompletedAlerted.current = false;
    }
    // onComplete intentionally included. hasCompletedAlerted guards duplicate fires on identity change.
  }, [justCompleted, onComplete]);

  useEffect(() => {
    if (!autoSaveMutation.isSuccess) return;
    setSavedVisible(true);
    const timer = setTimeout(() => setSavedVisible(false), 2000);
    return () => clearTimeout(timer);
  }, [autoSaveMutation.isSuccess]);

  const canComplete =
    mandatoryFieldsStatus.allCompleted && !autoSaveMutation.isPending && !isConsultationCompleted;
  const canEditCompleted = isConsultationCompleted && canEditConsultation;

  return (
    <div ref={formRef} className="flex flex-col">
      <div className="space-y-4">
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
      </div>

      <div className="sticky bottom-0 bg-background border-t z-10 py-3 flex items-center justify-end gap-2 mt-4">
        {isConsultationCompleted && (
          <Badge variant="secondary" className="text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )}
        {(autoSaveMutation.isPending || savedVisible) && (
          <span className="text-xs text-muted-foreground">
            {autoSaveMutation.isPending ? "Saving..." : "Saved"}
          </span>
        )}

        <Button onClick={() => setShowPreview(true)} variant="ghost" size="sm">
          <Eye className="h-4 w-4 mr-1" />Preview
        </Button>
        <Button
          onClick={handleCompleteConsultation}
          disabled={!canComplete && !canEditCompleted}
          size="sm"
        >
          {isConsultationCompleted ? "Update Notes" : "Finish Visit"}
        </Button>
      </div>

      <ConsultationPreviewModal
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        form={form}
        patient={mappedPatientWithClinic}
        appointment={mappedDbAppointment}
        specialtySections={specialtySections}
        departmentType={departmentType}
      />
    </div>
  );
}