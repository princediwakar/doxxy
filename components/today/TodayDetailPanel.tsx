// components/today/TodayDetailPanel.tsx
"use client";

import { useCallback, memo } from "react";
import { User } from "lucide-react";
import { Spinner } from "@/components/ui/loading";
import { useConsultationPermissions } from "@/hooks/consultation/useConsultationPermissions";
import { EncounterCanvas } from "./EncounterCanvas";
import { PatientHeader } from "./PatientHeader";
import { AdministrativeFooter } from "./AdministrativeFooter";
import type { AppointmentWithDetails } from "@/types/appointments";
import type { PatientDetail } from "@/hooks/usePatientDetail";
import type { BillWithDetails } from "@/types/billing";

interface TodayDetailPanelProps {
  patientAppointments: AppointmentWithDetails[];
  patientDetail: PatientDetail | undefined;
  isLoadingDetail: boolean;
  isLoadingQueue: boolean;
  selectedPatientId: string | null;
  selectedAppointmentId: string | null;
  onCreateBill: (app: AppointmentWithDetails) => void;
  onCreateBillForPatient: () => void;
  onScheduleAppointment: () => void;
  onEditAppointment: (app: AppointmentWithDetails) => void;
  onEditPatient: () => void;
  onViewBill: (bill: BillWithDetails) => void;
  onViewConsultationFromHistory: (appointmentId: string, patientId: string, doctorId: string) => void;
  onRefreshNeeded: () => void;
  deepLinkedAppointment?: AppointmentWithDetails | null;
}

const TodayDetailPanelInner = ({
  patientAppointments,
  patientDetail,
  isLoadingDetail,
  isLoadingQueue,
  selectedPatientId,
  selectedAppointmentId,
  onCreateBill,
  onScheduleAppointment,
  onCreateBillForPatient,
  onEditPatient,
  onEditAppointment,
  onViewBill,
  onViewConsultationFromHistory,
  onRefreshNeeded,
  deepLinkedAppointment,
}: TodayDetailPanelProps) => {

  const selectedAppointment = selectedAppointmentId
    ? patientAppointments.find((a) => a.id === selectedAppointmentId) ??
      (deepLinkedAppointment && deepLinkedAppointment.id === selectedAppointmentId
        ? deepLinkedAppointment
        : null)
    : null;

  const { canEditConsultation } = useConsultationPermissions({
    appointment: selectedAppointment ?? undefined,
  });

  const handleComplete = useCallback(() => {
    onRefreshNeeded();
  }, [onRefreshNeeded]);

  if (!selectedPatientId) {
    if (isLoadingQueue) {
      return (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      );
    }
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
          patientId={selectedPatientId}
          patientDetail={patientDetail}
          isLoadingDetail={isLoadingDetail}
          appointmentStatus={selectedAppointment?.status}
          departmentName={selectedAppointment?.department_name}
          onSchedule={onScheduleAppointment}
          onBill={selectedAppointment ? () => onCreateBill(selectedAppointment) : onCreateBillForPatient}
          onEditPatient={onEditPatient}
          onEditAppointment={() => selectedAppointment && onEditAppointment(selectedAppointment)}
          canEditConsultation={canEditConsultation}
          onViewBill={onViewBill}
          onViewConsultationFromHistory={onViewConsultationFromHistory}
          appointment={selectedAppointment}
          onComplete={handleComplete}
        />
      ) : (
        <div className="space-y-4">
          {patientDetail?.patient && (
            <PatientHeader
              name={patientDetail.patient.name}
              age={patientDetail.patient.age}
              gender={patientDetail.patient.gender}
              variant="staff"
              onSchedule={onScheduleAppointment}
              onBill={selectedAppointment ? () => onCreateBill(selectedAppointment) : onCreateBillForPatient}
              onEditPatient={onEditPatient}
              onEditAppointment={() => selectedAppointment && onEditAppointment(selectedAppointment)}
            />
          )}
          <AdministrativeFooter
            patientDetail={patientDetail}
            isLoadingDetail={isLoadingDetail}
            selectedPatientId={selectedPatientId}
            currentAppointmentId={null}
            defaultExpandBills
            defaultExpandHistory
            onViewBill={onViewBill}
            onViewConsultationFromHistory={onViewConsultationFromHistory}
          />
        </div>
      )}
    </div>
  );
};

export const TodayDetailPanel = memo(TodayDetailPanelInner);
