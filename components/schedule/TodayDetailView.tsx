"use client";

import { User } from "lucide-react";
import { TodayDetailPanel } from "@/components/schedule/TodayDetailPanel";
import type { AppointmentWithDetails } from "@/types/appointments";
import type { PatientDetail } from "@/types/core";
import type { BillWithDetails } from "@/types/billing";

interface TodayDetailViewProps {
  patientAppointments: AppointmentWithDetails[];
  patientDetail: PatientDetail | undefined;
  isLoadingDetail: boolean;
  selectedPatientId: string | null;
  selectedAppointmentId: string | null;
  patientBills: BillWithDetails[];
  isLoadingBills: boolean;
  onRefreshNeeded: () => void;
}

export function TodayDetailView({
  patientAppointments,
  patientDetail,
  isLoadingDetail,
  selectedPatientId,
  selectedAppointmentId,
  patientBills,
  isLoadingBills,
  onRefreshNeeded,
}: TodayDetailViewProps) {
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
    <TodayDetailPanel
      patientAppointments={patientAppointments}
      patientDetail={patientDetail}
      isLoadingDetail={isLoadingDetail}
      selectedPatientId={selectedPatientId}
      selectedAppointmentId={selectedAppointmentId}
      patientBills={patientBills}
      isLoadingBills={isLoadingBills}
      onRefreshNeeded={onRefreshNeeded}
    />
  );
}
