"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
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
  const [showLastVisit, setShowLastVisit] = useState(false);
  const patient = patientDetail?.patient ?? null;

  return (
    <div className="space-y-4">
      {patient && (
        <PatientHeader
          name={patient.name}
          age={patient.age}
          gender={patient.gender}
          variant="staff"
          onSchedule={onSchedule}
          onBill={onBill}
          onEditPatient={onEditPatient}
          onEditAppointment={onEditAppointment}
        />
      )}

      <AdministrativeFooter
        patientDetail={patientDetail}
        isLoadingDetail={isLoadingDetail}
        patientBills={patientBills}
        isLoadingBills={isLoadingBills}
        selectedPatientId={patientId}
        defaultExpandBills
        defaultExpandHistory
        onViewBill={onViewBill}
        onViewConsultationFromHistory={onViewConsultationFromHistory}
      />

      <div className="rounded-lg border">
        <button
          onClick={() => setShowLastVisit(!showLastVisit)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium hover:bg-muted/50 rounded-lg transition-colors"
        >
          <span>Last Visit Summary</span>
          {showLastVisit ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showLastVisit && (
          <div className="px-4 pb-4">
            <LastVisitSummary patientId={patientId} />
          </div>
        )}
      </div>
    </div>
  );
}
