// components/schedule/TodayDetailPanel.tsx
"use client";

import { useCallback } from "react";
import { format, parseISO } from "date-fns";
import { CalendarPlus, Receipt, User } from "lucide-react";
import { Spinner } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { useConsultationPermissions } from "@/hooks/consultation/useConsultationPermissions";
import { extractFollowUp } from "@/lib/utils";
import { EncounterCanvas } from "./EncounterCanvas";
import { PatientHeader } from "./PatientHeader";
import { AdministrativeFooter } from "./AdministrativeFooter";
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
  const showMutedBilling = appointmentStatus === APPOINTMENT_STATUS.SCHEDULED || appointmentStatus === APPOINTMENT_STATUS.IN_PROGRESS;
  const currentAppointmentHasBill = patientBills?.some(bill => bill.appointment_id === selectedAppointment?.id && selectedAppointment?.id != null);
  const showCreateBill = appointmentStatus === APPOINTMENT_STATUS.COMPLETED && !currentAppointmentHasBill;
  const showBillList = appointmentStatus === APPOINTMENT_STATUS.COMPLETED && patientBills && patientBills.length > 0;

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
          onBill={
            selectedAppointment
              ? () => onCreateBill(selectedAppointment)
              : () =>
                patientDetail?.patient &&
                onCreateBillForPatient(patientDetail.patient)
          }
          onEditPatient={onEditPatient}
          onEditAppointment={() =>
            selectedAppointment && onEditAppointment(selectedAppointment)
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
              variant="staff"
              appointmentType={selectedAppointment?.type}
              appointmentTime={selectedAppointment?.time}
              departmentName={selectedAppointment?.department_name}
              notes={selectedAppointment?.notes}
              onSchedule={() =>
                onScheduleAppointment(patientDetail!.patient!)
              }
              onBill={
                selectedAppointment
                  ? () => onCreateBill(selectedAppointment)
                  : () => onCreateBillForPatient(patientDetail!.patient!)
              }
              onEditPatient={onEditPatient}
              onEditAppointment={() =>
                selectedAppointment && onEditAppointment(selectedAppointment)
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

          {showMutedBilling && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Complete the visit to generate a bill.</p>
            </div>
          )}

          {showCreateBill && (
            <div className="rounded-lg border p-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (selectedAppointment) {
                    onCreateBill(selectedAppointment);
                  } else if (patientDetail?.patient) {
                    onCreateBillForPatient(patientDetail.patient);
                  }
                }}
              >
                <Receipt className="h-3.5 w-3.5 mr-1.5" />
                Create Bill
              </Button>
            </div>
          )}

          {showBillList && (
            <div className="rounded-lg border p-4 space-y-2">
              {patientBills.map((bill) => (
                <button
                  key={bill.id}
                  onClick={() => handleViewBill(bill)}
                  className="w-full text-left flex items-center justify-between hover:bg-muted/50 rounded p-2 transition-colors"
                >
                  <span className="text-sm font-medium">
                    {bill.invoice_number ?? `INV-${bill.id.slice(0, 8)}`}
                  </span>
                  <span className="text-sm font-semibold">₹{Number(bill.amount).toLocaleString('en-IN')}</span>
                </button>
              ))}
            </div>
          )}

          <AdministrativeFooter
            patientDetail={patientDetail}
            isLoadingDetail={isLoadingDetail}
            selectedPatientId={selectedPatientId}
            currentAppointmentId={null}
            patientBills={patientBills}
            isLoadingBills={isLoadingBills}
            hideBillsAccordion
            defaultExpandHistory
            onViewBill={handleViewBill}
            onViewConsultationFromHistory={onViewConsultationFromHistory}
            onCreateBill={
              selectedAppointment
                ? () => onCreateBill(selectedAppointment)
                : () => patientDetail?.patient && onCreateBillForPatient(patientDetail.patient)
            }
          />
        </div>
      )}
    </div>
  );
}
