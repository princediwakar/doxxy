// components/schedule/ConsultationHistory.tsx
"use client";

import { Eye } from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatTimeIST } from "@/lib/utils";
import { Spinner } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import type { PatientDetail } from "@/types/core";

type ConsultationRow = {
  id: string;
  created_at: string;
  appointment_id?: string;
  specialty_data?: Record<string, unknown> | null;
  appointments?: {
    id?: string;
    doctor_id?: string;
    status?: string;
    date?: string;
    time?: string;
    doctors?: { name?: string } | null;
  } | null;
};

interface ConsultationHistoryProps {
  patientDetail: PatientDetail | undefined;
  isLoadingDetail: boolean;
  selectedPatientId: string;
  currentAppointmentId: string | null;
  onViewConsultationFromHistory: (appointmentId: string, patientId: string, doctorId: string, date?: string, time?: string, doctorName?: string) => void;
}

function extractSpecialtyField(row: Record<string, unknown>, field: string): string | undefined {
  const sd = row.specialty_data as Record<string, unknown> | null | undefined;
  if (!sd || typeof sd !== "object") return undefined;
  return sd[field] as string | undefined;
}

export function ConsultationHistory({
  patientDetail,
  isLoadingDetail,
  selectedPatientId,
  currentAppointmentId,
  onViewConsultationFromHistory,
}: ConsultationHistoryProps) {
  if (isLoadingDetail) {
    return (
      <div className="flex items-center justify-center py-4">
        <Spinner size="sm" />
      </div>
    );
  }

  const allConsultations = (patientDetail?.consultations ?? []) as ConsultationRow[];

  const previousConsultations = allConsultations.filter(
    (c) => c.appointments?.id !== currentAppointmentId && c.appointments?.status === "Completed",
  );

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">
        Consultation History ({previousConsultations.length})
      </h3>

      {previousConsultations.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No previous consultations.
        </p>
      ) : (
        <div className="space-y-3">
          {previousConsultations.slice(0, 5).map((c) => (
            <div key={c.id} className="text-sm border-b pb-3 last:border-0 space-y-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">
                    Consultation ·{" "}
                    {c.appointments?.date
                      ? format(parseISO(c.appointments.date), "MMM dd, yyyy")
                      : c.created_at
                        ? format(parseISO(c.created_at), "MMM dd, yyyy")
                        : "Unknown date"}
                  </p>
                  {c.appointments && (
                    <p className="text-xs text-muted-foreground">
                      {c.appointments.time ? formatTimeIST(c.appointments.time) + " · " : ""}
                      Doctor: {c.appointments.doctors?.name ?? "—"}
                      {" · "}
                      {c.appointments.status ?? "—"}
                    </p>
                  )}
                </div>
                {c.appointments?.id && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() =>
                      onViewConsultationFromHistory(
                        c.appointments!.id!,
                        selectedPatientId,
                        c.appointments!.doctor_id ?? "",
                        c.appointments!.date,
                        c.appointments!.time,
                        c.appointments!.doctors?.name
                      )
                    }
                  >
                    <Eye className="h-3 w-3 mr-1" />View Notes
                  </Button>
                )}
              </div>
              {extractSpecialtyField(c as Record<string, unknown>, "chief_complaint") && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {extractSpecialtyField(c as Record<string, unknown>, "chief_complaint")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
