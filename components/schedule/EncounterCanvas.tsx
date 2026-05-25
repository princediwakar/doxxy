// components/schedule/EncounterCanvas.tsx
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { PatientHeader } from "./PatientHeader";
import { DictationZone } from "./DictationZone";
import { InlineConsultationForm } from "./InlineConsultationForm";
import { AdministrativeFooter } from "./AdministrativeFooter";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Star, CheckCircle } from "lucide-react";
import { useAppState } from "@/contexts/AppStateContext";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { isWhatsAppEnabled } from "@/lib/feature-flags";
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
  const { activeClinicId } = useAppState();
  const [reviewState, setReviewState] = useState<"idle" | "sending" | "sent">(() =>
    appointment?.review_request_sent ? "sent" : "idle",
  );
  const lastCompletedAppointmentRef = useRef<string | null>(null);

  const onAiDataConsumed = useCallback(() => setAiStructuredData(null), []);

  const patient = patientDetail?.patient ?? null;

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

  const handleSendReviewRequest = useCallback(async () => {
    const patientPhone = patient?.phone;
    const patientName = appointment?.patient_name;
    const doctorName = appointment?.doctor_name;
    const doctorId = appointment?.doctor_id;
    const patientId = appointment?.patient_id;

    if (!patientPhone || !patientName || !doctorName || !doctorId || !patientId) {
      toast.error("Missing patient or doctor information");
      return;
    }

    setReviewState("sending");
    try {
      const result = await sendWhatsAppMessage({
        type: "template",
        to: patientPhone,
        templateName: "review_request",
        doctorId,
        appointmentId: appointment?.id,
        patientId,
        clinicId: activeClinicId,
        bodyParams: [
          { type: "text", text: patientName },
          { type: "text", text: doctorName },
        ],
      });

      if (result.success) {
        setReviewState("sent");
        onComplete();
        toast.success("Review request sent");
      } else {
        if (result.code === "DUPLICATE_REVIEW_REQUEST") {
          setReviewState("sent");
        } else {
          setReviewState("idle");
        }
        toast.error(result.error || "Failed to send");
      }
    } catch {
      setReviewState("idle");
      toast.error("Failed to send review request");
    }
  }, [patient?.phone, appointment?.patient_name, appointment?.doctor_name, appointment?.doctor_id, appointment?.id, appointment?.patient_id, onComplete]);

  useEffect(() => {
    if (appointment?.id !== lastCompletedAppointmentRef.current) {
      lastCompletedAppointmentRef.current = appointment?.id ?? null;
      setReviewState(appointment?.review_request_sent ? "sent" : "idle");
    }
  }, [appointment?.id, appointment?.review_request_sent]);

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

      {isWhatsAppEnabled && appointment && appointmentStatus === "Completed" && (
        <div className="flex items-center justify-between rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/40 px-4 py-3">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Ask the patient to leave a Google review.
          </p>
          {reviewState === "sent" ? (
            <Button size="sm" variant="ghost" disabled className="text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Review Request Sent
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSendReviewRequest}
              disabled={reviewState === "sending"}
              className="border-amber-500 dark:border-amber-600 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950 hover:text-amber-700 dark:hover:text-amber-300"
            >
              <Star className="h-4 w-4 mr-1.5" />
              {reviewState === "sending" ? "Sending..." : "Send Review Request"}
            </Button>
          )}
        </div>
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
