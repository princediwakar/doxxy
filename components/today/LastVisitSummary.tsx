"use client";

import { format, parseISO } from "date-fns";
import { Spinner } from "@/components/ui/loading";
import { useLastVisitSummary } from "@/hooks/patient/useLastVisitSummary";

interface LastVisitSummaryProps {
  patientId: string | null;
}

export function LastVisitSummary({ patientId }: LastVisitSummaryProps) {
  const { data, isLoading } = useLastVisitSummary(patientId);

  if (!patientId) return null;

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-center py-2">
          <Spinner size="sm" />
        </div>
      </div>
    );
  }

  const hasConsultation = data?.lastConsultation;
  const hasPrescription = data?.lastPrescription;
  const isFirstVisit = !hasConsultation && !hasPrescription;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Last Visit
      </h3>

      {isFirstVisit ? (
        <p className="text-sm text-muted-foreground">No prior visits found</p>
      ) : (
        <>
          {hasConsultation && (
            <div>
              <p className="text-xs text-muted-foreground">
                {format(parseISO(hasConsultation.date), "MMM dd, yyyy")}
              </p>
              {hasConsultation.chief_complaint && (
                <p className="text-sm">
                  <span className="font-medium">CC:</span> {hasConsultation.chief_complaint}
                </p>
              )}
              {hasConsultation.diagnosis && (
                <p className="text-sm">
                  <span className="font-medium">Dx:</span> {hasConsultation.diagnosis}
                </p>
              )}
            </div>
          )}
          {hasPrescription && (
            <div>
              <p className="text-xs text-muted-foreground">
                {format(parseISO(hasPrescription.date), "MMM dd, yyyy")} — Rx
              </p>
              {hasPrescription.medicationNames.length > 0 && (
                <p className="text-sm">{hasPrescription.medicationNames.join(", ")}</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
