// components/schedule/TodayDetailPanel.tsx
"use client";

import { useCallback } from "react";
import { format, parseISO } from "date-fns";
import { CalendarPlus, Receipt, User } from "lucide-react";
import { Spinner } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { useTodayStore } from "@/stores/todayStore";
import { useConsultationPermissions } from "@/hooks/consultation/useConsultationPermissions";
import { extractFollowUp } from "@/lib/utils";
import { EncounterCanvas } from "./EncounterCanvas";
import { PatientHeader } from "./PatientHeader";
import { AdministrativeFooter } from "./AdministrativeFooter";
import type { AppointmentWithDetails } from "@/types/appointments";
import type { PatientDetail } from "@/types/core";
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
}: TodayDetailPanelProps) {
  const createBill = useTodayStore((s) => s.createBill);
  const createBillForPatient = useTodayStore((s) => s.createBillForPatient);
  const scheduleAppointment = useTodayStore((s) => s.scheduleAppointment);
  const editAppointment = useTodayStore((s) => s.editAppointment);
  const editPatient = useTodayStore((s) => s.editPatient);
  const viewBill = useTodayStore((s) => s.viewBill);
  const viewConsultation = useTodayStore((s) => s.viewConsultation);

  const handleViewBill = useCallback(
    (bill: BillWithDetails) => viewBill(bill, patientDetail?.patient ?? null),
    [viewBill, patientDetail?.patient],
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
            scheduleAppointment(patientDetail.patient)
          }
          onBill={
            selectedAppointment
              ? () => createBill(selectedAppointment)
              : () =>
                patientDetail?.patient &&
                createBillForPatient(patientDetail.patient)
          }
          onEditPatient={editPatient}
          onEditAppointment={() =>
            selectedAppointment && editAppointment(selectedAppointment)
          }
          canEditConsultation={canEditConsultation}
          onViewBill={handleViewBill}
          onViewConsultationFromHistory={viewConsultation}
          onCreateBill={
            selectedAppointment
              ? () => createBill(selectedAppointment)
              : () => patientDetail?.patient && createBillForPatient(patientDetail.patient)
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
                scheduleAppointment(patientDetail!.patient!)
              }
              onBill={
                selectedAppointment
                  ? () => createBill(selectedAppointment)
                  : () => createBillForPatient(patientDetail!.patient!)
              }
              onEditPatient={editPatient}
              onEditAppointment={() =>
                selectedAppointment && editAppointment(selectedAppointment)
              }
            />
          )}

          {(() => {
            const followUp = extractFollowUp(patientDetail?.consultations);
            if (followUp && patientDetail?.hasFutureAppointment === false) {
              return (
                <div className="rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950 p-4">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Dr. {followUp.doctorName} recommended follow-up by {format(parseISO(followUp.date), 'MMM dd, yyyy')}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    onClick={() => {
                      if (patientDetail?.patient) {
                        scheduleAppointment(patientDetail.patient, followUp.date);
                      }
                    }}
                  >
                    <CalendarPlus className="h-3.5 w-3.5 mr-1.5" />
                    Book Follow-Up
                  </Button>
                </div>
              );
            }
            return null;
          })()}

          {(() => {
            const status = selectedAppointment?.status;
            if (status === 'Scheduled' || status === 'In Progress') {
              return (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">Complete the visit to generate a bill.</p>
                </div>
              );
            }
            if (status === 'Completed') {
              if (!patientBills || patientBills.length === 0) {
                return (
                  <div className="rounded-lg border p-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (selectedAppointment) {
                          createBill(selectedAppointment);
                        } else if (patientDetail?.patient) {
                          createBillForPatient(patientDetail.patient);
                        }
                      }}
                    >
                      <Receipt className="h-3.5 w-3.5 mr-1.5" />
                      Create Bill
                    </Button>
                  </div>
                );
              }
              return (
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
              );
            }
            return null;
          })()}

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
            onViewConsultationFromHistory={viewConsultation}
            onCreateBill={
              selectedAppointment
                ? () => createBill(selectedAppointment)
                : () => patientDetail?.patient && createBillForPatient(patientDetail.patient)
            }
          />
        </div>
      )}
    </div>
  );
}
