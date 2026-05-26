// components/schedule/TodayDetailPanel.tsx
"use client";

import { useCallback } from "react";
import { User } from "lucide-react";
import { Spinner } from "@/components/ui/loading";
import { useTodayStore } from "@/stores/todayStore";
import { useConsultationPermissions } from "@/hooks/consultation/useConsultationPermissions";
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
              medicalId={patientDetail.patient.medical_id}
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
          <AdministrativeFooter
            patientDetail={patientDetail}
            isLoadingDetail={isLoadingDetail}
            selectedPatientId={selectedPatientId}
            currentAppointmentId={null}
            patientBills={patientBills}
            isLoadingBills={isLoadingBills}
            defaultExpandBills
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
