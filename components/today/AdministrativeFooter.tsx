// components/today/AdministrativeFooter.tsx
"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Eye } from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatTimeIST } from "@/lib/utils";
import { Spinner } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import type { PatientDetail } from "@/types/core";
import type { BillWithDetails } from "@/types/billing";

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

interface AdministrativeFooterProps {
  patientDetail: PatientDetail | undefined;
  isLoadingDetail: boolean;
  selectedPatientId: string;
  currentAppointmentId: string | null;
  patientBills: BillWithDetails[];
  isLoadingBills: boolean;
  defaultExpandBills?: boolean;
  defaultExpandHistory?: boolean;
  onViewBill: (bill: BillWithDetails) => void;
  onViewConsultationFromHistory: (appointmentId: string, patientId: string, doctorId: string) => void;
}

function extractSpecialtyField(row: Record<string, unknown>, field: string): string | undefined {
  const sd = row.specialty_data as Record<string, unknown> | null | undefined;
  if (!sd || typeof sd !== "object") return undefined;
  return sd[field] as string | undefined;
}

export function AdministrativeFooter({
  patientDetail,
  isLoadingDetail,
  selectedPatientId,
  currentAppointmentId,
  patientBills = [],
  isLoadingBills = false,
  defaultExpandBills = false,
  defaultExpandHistory = false,
  onViewBill,
  onViewConsultationFromHistory,
}: AdministrativeFooterProps) {
  const [billsOpen, setBillsOpen] = useState(defaultExpandBills);
  const [historyOpen, setHistoryOpen] = useState(defaultExpandHistory);

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
      {/* Bills Accordion */}
      <div className="rounded-lg border">
        <button
          onClick={() => setBillsOpen(!billsOpen)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium hover:bg-muted/50 rounded-lg transition-colors"
        >
          <span>Bills ({patientBills.length})</span>
          {billsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {billsOpen && (
          <div className="px-4 pb-4 space-y-2">
            {isLoadingBills ? (
              <div className="flex items-center justify-center py-4">
                <Spinner size="sm" />
              </div>
            ) : patientBills.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No bills for this patient.</p>
            ) : (
              patientBills.map((bill) => (
                <button
                  key={bill.id}
                  onClick={() => onViewBill(bill)}
                  className="w-full text-left rounded-lg border bg-card p-3 hover:bg-muted/50 transition-colors flex items-center justify-between group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {bill.invoice_number ?? `INV-${bill.id.slice(0, 8)}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {bill.created_at ? format(parseISO(bill.created_at), "MMM dd, yyyy") : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold">₹{Number(bill.amount).toLocaleString("en-IN")}</span>
                    <Eye className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Previous Consultations Accordion */}
      <div className="rounded-lg border">
        <button
          onClick={() => setHistoryOpen(!historyOpen)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium hover:bg-muted/50 rounded-lg transition-colors"
        >
          <span>Previous Consultations ({previousConsultations.length})</span>
          {historyOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {historyOpen && (
          <div className="px-4 pb-4 space-y-3">
            {previousConsultations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No previous consultations.
              </p>
            ) : (
              <>
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
                              c.appointments!.doctor_id ?? ""
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
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
