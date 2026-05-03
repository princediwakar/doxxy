"use client";

import { useState, useCallback } from "react";
import { PatientHeader } from "./PatientHeader";
import { LastVisitSummary } from "./LastVisitSummary";
import { DictationZone } from "./DictationZone";
import { ReviewHandoff } from "./ReviewHandoff";
import { AdministrativeFooter } from "./AdministrativeFooter";
import type { AIStructuredOutput, EncounterReviewState } from "@/types/voice";
import type { PatientDetail } from "@/hooks/usePatientDetail";
import type { BillWithDetails } from "@/types/billing";

interface EncounterCanvasProps {
  patientId: string;
  patientDetail: PatientDetail | undefined;
  isLoadingDetail: boolean;
  appointmentStatus?: string;
  patientBills: BillWithDetails[];
  isLoadingBills: boolean;
  departmentName?: string;
  onSchedule: () => void;
  onBill: () => void;
  onEditPatient: () => void;
  onEditAppointment: () => void;
  onApproveEncounter: (structured: AIStructuredOutput) => void;
  onEditManually: (structured: AIStructuredOutput) => void;
  onStartConsultation?: () => void;
  isCompleting: boolean;
  onViewBill: (bill: BillWithDetails) => void;
  onViewConsultationFromHistory: (appointmentId: string, patientId: string, doctorId: string) => void;
}

const EMPTY_STRUCTURED: AIStructuredOutput = {
  symptoms: "NOT_SPECIFIED",
  diagnosis: "NOT_SPECIFIED",
  prescriptions: [],
  advice: "NOT_SPECIFIED",
  rawFields: {},
};

export function EncounterCanvas({
  patientId,
  patientDetail,
  isLoadingDetail,
  appointmentStatus,
  patientBills,
  isLoadingBills,
  departmentName,
  onSchedule,
  onBill,
  onEditPatient,
  onEditAppointment,
  onApproveEncounter,
  onEditManually,
  onStartConsultation,
  isCompleting,
  onViewBill,
  onViewConsultationFromHistory,
}: EncounterCanvasProps) {
  const [reviewState, setReviewState] = useState<EncounterReviewState>({ phase: "idle" });

  const variant = appointmentStatus === "Completed" ? "compact" : "active";

  const handleStructured = useCallback((structured: AIStructuredOutput | null, transcript: string) => {
    setReviewState({ phase: "review", structured, transcript });
  }, []);

  const handleRecordingStarted = useCallback(() => {
    if (appointmentStatus === "Scheduled") {
      onStartConsultation?.();
    }
  }, [appointmentStatus, onStartConsultation]);

  const handleApprove = useCallback(
    (structured: AIStructuredOutput) => {
      onApproveEncounter(structured);
    },
    [onApproveEncounter]
  );

  const handleOpenNotes = useCallback(() => {
    onEditManually(EMPTY_STRUCTURED);
  }, [onEditManually]);

  const patient = patientDetail?.patient ?? null;

  return (
    <div className="space-y-4">
      {patient && (
        <PatientHeader
          name={patient.name}
          age={patient.age}
          gender={patient.gender}
          status={appointmentStatus}
          onSchedule={onSchedule}
          onBill={onBill}
          onEditPatient={onEditPatient}
          onEditAppointment={onEditAppointment}
        />
      )}

      <LastVisitSummary patientId={patientId} />

      {reviewState.phase === "review" ? (
        <ReviewHandoff
          structured={reviewState.structured}
          transcript={reviewState.transcript}
          isCompleting={isCompleting}
          onApprove={handleApprove}
          onEditManually={onEditManually}
        />
      ) : (
        <DictationZone
          onStructured={handleStructured}
          onOpenNotes={handleOpenNotes}
          onRecordingStarted={handleRecordingStarted}
          variant={variant}
          secondaryLabel="Edit Consultation Notes"
          departmentName={departmentName}
        />
      )}

      <AdministrativeFooter
        patientDetail={patientDetail}
        isLoadingDetail={isLoadingDetail}
        patientBills={patientBills}
        isLoadingBills={isLoadingBills}
        selectedPatientId={patientId}
        onViewBill={onViewBill}
        onViewConsultationFromHistory={onViewConsultationFromHistory}
      />
    </div>
  );
}
