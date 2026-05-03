"use client";

import { useCallback } from "react";
import { X, User } from "lucide-react";
import { Spinner } from "@/components/ui/loading";
import { useTodayStore, type ActiveFilter } from "@/stores/todayStore";
import { useAuth } from "@/contexts/AuthContext";
import { EncounterCanvas } from "./EncounterCanvas";
import { StaffView } from "./StaffView";
import type { AppointmentWithDetails } from "@/types/appointments";
import type { PatientDetail } from "@/hooks/usePatientDetail";
import type { BillWithDetails } from "@/types/billing";
import type { AIStructuredOutput } from "@/types/voice";

interface TodayDetailPanelProps {
  activeFilter: ActiveFilter;
  patientAppointments: AppointmentWithDetails[];
  patientDetail: PatientDetail | undefined;
  isLoadingDetail: boolean;
  patientBills: BillWithDetails[];
  isLoadingBills: boolean;
  onStartConsultation: (app: AppointmentWithDetails) => void;
  onViewConsultation: (app: AppointmentWithDetails) => void;
  onEditConsultation: (app: AppointmentWithDetails) => void;
  onCreateBill: (app: AppointmentWithDetails) => void;
  onCreateBillForPatient: () => void;
  onScheduleAppointment: () => void;
  onEditAppointment: (app: AppointmentWithDetails) => void;
  onEditPatient: () => void;
  onViewBill: (bill: BillWithDetails) => void;
  onViewConsultationFromHistory: (appointmentId: string, patientId: string, doctorId: string) => void;
  onApproveEncounter: (appointmentId: string, patientId: string, doctorId: string, aiData: AIStructuredOutput) => void;
  onEditManually: (appointmentId: string, aiData: AIStructuredOutput) => void;
  isCompleting: boolean;
}

export function TodayDetailPanel({
  patientAppointments,
  patientDetail,
  isLoadingDetail,
  patientBills,
  isLoadingBills,
  onStartConsultation,
  onScheduleAppointment,
  onCreateBillForPatient,
  onEditPatient,
  onEditAppointment,
  onViewBill,
  onViewConsultationFromHistory,
  onApproveEncounter,
  onEditManually,
  isCompleting,
}: TodayDetailPanelProps) {
  const selectedPatientId = useTodayStore((s) => s.selectedPatientId);
  const selectedAppointmentId = useTodayStore((s) => s.selectedAppointmentId);
  const clearSelection = useTodayStore((s) => s.clearSelection);
  const { user } = useAuth();

  const selectedAppointment = selectedAppointmentId
    ? patientAppointments.find((a) => a.id === selectedAppointmentId) ?? null
    : null;


  const handleApproveEncounter = useCallback(
    (aiData: AIStructuredOutput) => {
      if (!selectedAppointment) return;
      onApproveEncounter(
        selectedAppointment.id,
        selectedAppointment.patient_id,
        selectedAppointment.doctor_id,
        aiData
      );
    },
    [selectedAppointment, onApproveEncounter]
  );

  const handleEditManually = useCallback(
    (aiData: AIStructuredOutput) => {
      if (!selectedAppointment) return;
      onEditManually(selectedAppointment.id, aiData);
    },
    [selectedAppointment, onEditManually]
  );

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

  if (isLoadingDetail) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const isOwnAppointment = selectedAppointment?.user_id === user?.id;

  return (
    <div className="relative">

      {isOwnAppointment ? (
        <EncounterCanvas
          patientId={selectedPatientId}
          patientDetail={patientDetail}
          isLoadingDetail={isLoadingDetail}
          appointmentStatus={selectedAppointment?.status}
          patientBills={patientBills}
          isLoadingBills={isLoadingBills}
          departmentName={selectedAppointment?.department_name}
          onSchedule={onScheduleAppointment}
          onBill={onCreateBillForPatient}
          onEditPatient={onEditPatient}
          onEditAppointment={() => selectedAppointment && onEditAppointment(selectedAppointment)}
          onApproveEncounter={handleApproveEncounter}
          onEditManually={handleEditManually}
          onStartConsultation={() => selectedAppointment && onStartConsultation(selectedAppointment)}
          isCompleting={isCompleting}
          onViewBill={onViewBill}
          onViewConsultationFromHistory={onViewConsultationFromHistory}
        />
      ) : (
        <StaffView
          patientId={selectedPatientId}
          patientDetail={patientDetail}
          isLoadingDetail={isLoadingDetail}
          patientBills={patientBills}
          isLoadingBills={isLoadingBills}
          onSchedule={onScheduleAppointment}
          onBill={onCreateBillForPatient}
          onEditPatient={onEditPatient}
          onEditAppointment={() => selectedAppointment && onEditAppointment(selectedAppointment)}
          onViewBill={onViewBill}
          onViewConsultationFromHistory={onViewConsultationFromHistory}
        />
      )}
    </div>
  );
}
