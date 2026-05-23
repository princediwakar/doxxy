// components/schedule/EncounterCanvas.tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { PatientHeader } from "./PatientHeader";
import { DictationZone } from "./DictationZone";
import { InlineConsultationForm } from "./InlineConsultationForm";
import { AdministrativeFooter } from "./AdministrativeFooter";
import type { AIStructuredOutput, FieldConfidence } from "@/types/voice";
import type { PatientDetail } from "@/types/core";
import type { BillWithDetails } from "@/types/billing";
import type { AppointmentWithDetails } from "@/types/appointments";
import type { DbAppointment } from "@/types/core";

interface EncounterCanvasProps {
  patientId: string;
  patientDetail: PatientDetail | undefined;
  isLoadingDetail: boolean;
  appointmentStatus?: string;
  departmentName?: string;
  patientBills: BillWithDetails[];
  isLoadingBills: boolean;
  onSchedule: () => void;
  onBill: () => void;
  onEditPatient: () => void;
  onEditAppointment: () => void;
  canEditConsultation: boolean;
  onViewBill: (bill: BillWithDetails) => void;
  onViewConsultationFromHistory: (appointmentId: string, patientId: string, doctorId: string) => void;
  onCreateBill?: () => void;
  appointment: AppointmentWithDetails | null;
  onComplete: () => void;
}

export function EncounterCanvas({
  patientId,
  patientDetail,
  isLoadingDetail,
  appointmentStatus,
  departmentName,
  patientBills,
  isLoadingBills,
  onSchedule,
  onBill,
  onEditPatient,
  onEditAppointment,
  canEditConsultation,
  onViewBill,
  onViewConsultationFromHistory,
  onCreateBill,
  appointment,
  onComplete,
}: EncounterCanvasProps) {
  const [aiStructuredData, setAiStructuredData] = useState<AIStructuredOutput | null>(null);
  const formRef = useRef<HTMLDivElement>(null!);
  const getLiveFormDataRef = useRef<(() => Record<string, unknown>) | undefined>(undefined);
  const hasEverStructuredRef = useRef(false);

  const onAiDataConsumed = useCallback(() => setAiStructuredData(null), []);

  const handleStructured = useCallback(
    (structured: AIStructuredOutput | null, _transcript: string, _fieldConfidence?: FieldConfidence[]) => {
      if (structured) {
        hasEverStructuredRef.current = true;
        setAiStructuredData(structured);
      }
    },
    [],
  );

  const handleScrollToForm = useCallback(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const patient = patientDetail?.patient ?? null;
  const hasExistingData = hasEverStructuredRef.current || !!aiStructuredData;

  if (isLoadingDetail) {
    return (
      <div className="space-y-4">
        <div className="h-24 w-full bg-muted/20 animate-pulse rounded-xl border border-muted/30" />
        <div className="h-48 w-full bg-muted/10 animate-pulse rounded-xl border border-muted/20" />
        <div className="h-32 w-full bg-muted/10 animate-pulse rounded-xl border border-muted/20" />
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  return (
    <div className="space-y-4">
      <PatientHeader
        name={patient.name}
        age={patient.age}
        gender={patient.gender}
        medicalId={patient.medical_id}
        status={appointmentStatus}
        appointmentType={appointment?.type}
        appointmentTime={appointment?.time}
        departmentName={appointment?.department_name}
        notes={appointment?.notes}
        onSchedule={onSchedule}
        onBill={onBill}
        onEditPatient={onEditPatient}
        onEditAppointment={onEditAppointment}
      />

      {appointment && appointmentStatus !== "Completed" && canEditConsultation && (
        <DictationZone
          onStructured={handleStructured}
          onOpenNotes={handleScrollToForm}
          variant={hasExistingData ? "compact" : "active"}
          secondaryLabel="Edit Consultation Notes"
          departmentName={departmentName}
          getLiveFormData={() => getLiveFormDataRef.current ? getLiveFormDataRef.current() : {}}
          scrollToReview={handleScrollToForm}
        />
      )}

      {appointment && (
        <InlineConsultationForm
          key={appointment.id}
          formRef={formRef}
          appointmentId={appointment.id}
          appointment={appointment as unknown as DbAppointment}
          patient={patient}
          patientDetail={patientDetail}
          canEditConsultation={canEditConsultation}
          aiStructuredData={aiStructuredData}
          onAiDataConsumed={onAiDataConsumed}
          onComplete={onComplete}
          registerGetFormData={(getter) => {
            getLiveFormDataRef.current = getter;
          }}
        />
      )}

      <AdministrativeFooter
        patientDetail={patientDetail}
        isLoadingDetail={false}
        selectedPatientId={patientId}
        currentAppointmentId={appointment?.id ?? null}
        patientBills={patientBills}
        isLoadingBills={isLoadingBills}
        onViewBill={onViewBill}
        onViewConsultationFromHistory={onViewConsultationFromHistory}
        onCreateBill={onCreateBill}
      />
    </div>
  );
}
