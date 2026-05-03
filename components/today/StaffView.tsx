"use client";

import { PatientHeader } from "./PatientHeader";
import { LastVisitSummary } from "./LastVisitSummary";
import { AdministrativeFooter } from "./AdministrativeFooter";
import type { PatientDetail } from "@/hooks/usePatientDetail";
import type { BillWithDetails } from "@/types/billing";

interface StaffViewProps {
  patientId: string;
  patientDetail: PatientDetail | undefined;
  isLoadingDetail: boolean;
  patientBills: BillWithDetails[];
  isLoadingBills: boolean;
  onSchedule: () => void;
  onBill: () => void;
  onEditPatient: () => void;
  onEditAppointment: () => void;
  onViewBill: (bill: BillWithDetails) => void;
  onViewConsultationFromHistory: (appointmentId: string, patientId: string, doctorId: string) => void;
}

export function StaffView({
  patientId,
  patientDetail,
  isLoadingDetail,
  patientBills,
  isLoadingBills,
  onSchedule,
  onBill,
  onEditPatient,
  onEditAppointment,
  onViewBill,
  onViewConsultationFromHistory,
}: StaffViewProps) {
  const patient = patientDetail?.patient ?? null;

  return (
    <div className="space-y-4">
      {patient && (
        <PatientHeader
          name={patient.name}
          age={patient.age}
          gender={patient.gender}
          onSchedule={onSchedule}
          onBill={onBill}
          onEditPatient={onEditPatient}
          onEditAppointment={onEditAppointment}
        />
      )}
      <LastVisitSummary patientId={patientId} />
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
