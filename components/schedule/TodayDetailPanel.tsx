// components/schedule/TodayDetailPanel.tsx
"use client";

import { useCallback } from "react";
import { format, parseISO } from "date-fns";
import { CalendarPlus, User } from "lucide-react";
import { Spinner } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { useConsultationPermissions } from "@/hooks/consultation/useConsultationPermissions";
import { extractFollowUp } from "@/lib/utils";
import { EncounterCanvas } from "./EncounterCanvas";
import { PatientHeader } from "./PatientHeader";
import { ConsultationHistory } from "./ConsultationHistory";
import { BillingSection } from "./BillingSection";
import { APPOINTMENT_STATUS, type AppointmentWithDetails } from "@/types/appointments";
import type { PatientDetail, DbPatientByClinic } from "@/types/core";
import type { BillWithDetails } from "@/types/billing";

interface TodayDetailPanelProps {
  patientAppointments: AppointmentWithDetails[];
  patientDetail: PatientDetail | undefined;
  isLoadingDetail: boolean;
  selectedPatientId: string | null;
  selectedAppointmentId: string | null;
  patientBills: BillWithDetails[];
  isLoadingBills: boolean;
  onRefreshNeeded: () => void;
  onCreateBill: (app: AppointmentWithDetails) => void;
  onCreateBillForPatient: (patient: DbPatientByClinic) => void;
  onViewBill: (bill: BillWithDetails, patient?: DbPatientByClinic | null) => void;
  onViewConsultationFromHistory: (appointmentId: string, patientId: string, doctorId: string, date?: string, time?: string, doctorName?: string) => void;
  onScheduleAppointment: (patient: DbPatientByClinic, suggestedDate?: string | null) => void;
  onEditAppointment: (app: AppointmentWithDetails) => void;
  onEditPatient: () => void;
  onCancelAppointment: (id: string) => void;
}

export function TodayDetailPanel({
  patientAppointments,
  patientDetail,
  isLoadingDetail,
  selectedPatientId,
  selectedAppointmentId,
  patientBills,
  isLoadingBills,
  onRefreshNeeded,
  onCreateBill,
  onCreateBillForPatient,
  onViewBill,
  onViewConsultationFromHistory,
  onScheduleAppointment,
  onEditAppointment,
  onEditPatient,
  onCancelAppointment,
}: TodayDetailPanelProps) {
  const handleViewBill = useCallback(
    (bill: BillWithDetails) => onViewBill(bill, patientDetail?.patient ?? null),
    [onViewBill, patientDetail?.patient],
  );

  const selectedAppointment = selectedAppointmentId
    ? patientAppointments.find((a) => a.id === selectedAppointmentId) ?? null
    : null;

  const { canEditConsultation } = useConsultationPermissions({
    appointment: selectedAppointment ?? undefined,
  });

  if (!selectedPatientId) {
    return (
      <div className="hidden lg:flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">Select a patient</p>
          <p className="text-sm">Choose from the queue to view details.</p>
        </div>
      </div>
    );
  }

  const followUpData = extractFollowUp(patientDetail?.consultations);
  const showFollowUpBanner = followUpData && patientDetail?.hasFutureAppointment === false;

  const appointmentStatus = selectedAppointment?.status;

  const isBillingBlocked =
    appointmentStatus === "Scheduled" ||
    appointmentStatus === "In Progress";
  const canCreateBill =
    !appointmentStatus || appointmentStatus === "Completed";
  const currentAppointmentHasBill =
    selectedAppointment?.id != null &&
    patientBills.some((b) => b.appointment_id === selectedAppointment?.id);
  const showCreateBill = canCreateBill && !currentAppointmentHasBill;
  const handleCreateBill =
    selectedAppointment
      ? () => onCreateBill(selectedAppointment)
      : () => patientDetail?.patient && onCreateBillForPatient(patientDetail.patient);

  return (
    <div className="relative">
      {canEditConsultation ? (
        <EncounterCanvas
          key={selectedPatientId}
          patientId={selectedPatientId}
          patientDetail={patientDetail}
          isLoadingDetail={isLoadingDetail}
          appointmentStatus={selectedAppointment?.status}
          departmentName={selectedAppointment?.department_name}
          patientBills={patientBills}
          isLoadingBills={isLoadingBills}
          onSchedule={() =>
            patientDetail?.patient &&
            onScheduleAppointment(patientDetail.patient)
          }
          onEditPatient={onEditPatient}
          onEditAppointment={() =>
            selectedAppointment && onEditAppointment(selectedAppointment)
          }
          onCancelAppointment={
            selectedAppointment &&
            (selectedAppointment.status === "Scheduled" || selectedAppointment.status === "In Progress")
              ? () => onCancelAppointment(selectedAppointment.id)
              : undefined
          }
          canEditConsultation={canEditConsultation}
          onViewBill={handleViewBill}
          onViewConsultationFromHistory={onViewConsultationFromHistory}
          onCreateBill={
            selectedAppointment
              ? () => onCreateBill(selectedAppointment)
              : () => patientDetail?.patient && onCreateBillForPatient(patientDetail.patient)
          }
          appointment={selectedAppointment}
          onComplete={onRefreshNeeded}
        />
      ) : (
        <div className="space-y-4">
          {patientDetail?.patient && (
            <PatientHeader
              name={patientDetail.patient.name}
              age={patientDetail.patient.age}
              gender={patientDetail.patient.gender}
              uhid={patientDetail.patient.uhid}
              phone={patientDetail.patient.phone}
              status={selectedAppointment?.status}
              variant="staff"
              appointmentType={selectedAppointment?.type}
              appointmentTime={selectedAppointment?.time}
              departmentName={selectedAppointment?.department_name}
              notes={selectedAppointment?.notes}
              onSchedule={() =>
                onScheduleAppointment(patientDetail!.patient!)
              }
              onEditPatient={onEditPatient}
              onEditAppointment={() =>
                selectedAppointment && onEditAppointment(selectedAppointment)
              }
              onCancelAppointment={
                selectedAppointment &&
                (selectedAppointment.status === "Scheduled" || selectedAppointment.status === "In Progress")
                  ? () => onCancelAppointment(selectedAppointment.id)
                  : undefined
              }
            />
          )}

          {showFollowUpBanner && (
            <div className="rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950 p-4">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Dr. {followUpData!.doctorName} recommended follow-up by {format(parseISO(followUpData!.date), 'MMM dd, yyyy')}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                onClick={() => {
                  if (patientDetail?.patient) {
                    onScheduleAppointment(patientDetail.patient, followUpData!.date);
                  }
                }}
              >
                <CalendarPlus className="h-3.5 w-3.5 mr-1.5" />
                Book Follow-Up
              </Button>
            </div>
          )}

          {isBillingBlocked && (
            <div className="rounded-lg border bg-muted/30 px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Complete the visit to generate a bill.
              </p>
            </div>
          )}

          <BillingSection
            patientBills={patientBills}
            isLoadingBills={isLoadingBills}
            showCreateBill={showCreateBill}
            onCreateBill={handleCreateBill}
            onViewBill={handleViewBill}
          />

          <ConsultationHistory
            patientDetail={patientDetail}
            isLoadingDetail={isLoadingDetail}
            selectedPatientId={selectedPatientId}
            currentAppointmentId={null}
            onViewConsultationFromHistory={onViewConsultationFromHistory}
          />
        </div>
      )}
    </div>
  );
}
