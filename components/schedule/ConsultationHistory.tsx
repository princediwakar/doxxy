// components/schedule/ConsultationHistory.tsx
"use client";

import { Eye } from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatTimeIST } from "@/lib/utils";
import { Spinner } from "@/components/ui/loading";
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
        <div className="space-y-2">
          {previousConsultations.slice(0, 5).map((c) => (
            <button
              key={c.id}
              disabled={!c.appointments?.id}
              onClick={() =>
                c.appointments?.id &&
                onViewConsultationFromHistory(
                  c.appointments.id,
                  selectedPatientId,
                  c.appointments.doctor_id ?? "",
                  c.appointments.date,
                  c.appointments.time,
                  c.appointments.doctors?.name,
                )
              }
              className="w-full text-left rounded-lg border p-3 hover:bg-muted/50 transition-colors flex items-center justify-between group disabled:pointer-events-none disabled:opacity-70"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {c.appointments?.date
                    ? format(parseISO(c.appointments.date), "MMM dd, yyyy")
                    : c.created_at
                      ? format(parseISO(c.created_at), "MMM dd, yyyy")
                      : "Unknown date"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {c.appointments?.time ? formatTimeIST(c.appointments.time) + " · " : ""}
                  Dr. {c.appointments?.doctors?.name ?? "—"}
                  {" · "}
                  {c.appointments?.status ?? "—"}
                </p>
                {extractSpecialtyField(c as Record<string, unknown>, "chief_complaint") && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {extractSpecialtyField(c as Record<string, unknown>, "chief_complaint")}
                  </p>
                )}
              </div>
              <Eye className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-3" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
