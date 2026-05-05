"use client";

import { PatientChart } from "@/components/patients/PatientChart";
import type { PatientDetail } from "@/types/core";

interface PatientChartPageProps {
  patientDetail: PatientDetail | null;
  userId: string;
}

export function PatientChartPage({
  patientDetail,
  userId,
}: PatientChartPageProps) {
  if (!patientDetail?.patient) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Patient not found.</p>
      </div>
    );
  }

  return (
    <PatientChart
      patientDetail={patientDetail}
    />
  );
}
