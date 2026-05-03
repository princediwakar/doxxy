"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, User, Phone, Hash, Eye } from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatTimeIST } from "@/lib/utils";
import { Spinner } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import type { PatientDetail } from "@/hooks/usePatientDetail";
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

type PrescriptionRow = {
  id: string;
  created_at: string;
  medications?: Array<{ name?: string }> | null;
};

interface AdministrativeFooterProps {
  patientDetail: PatientDetail | undefined;
  isLoadingDetail: boolean;
  patientBills: BillWithDetails[];
  isLoadingBills: boolean;
  selectedPatientId: string;
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
  patientBills,
  isLoadingBills,
  selectedPatientId,
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

  const patient = patientDetail?.patient ?? null;
  const consultations = (patientDetail?.consultations ?? []) as ConsultationRow[];
  const prescriptions = (patientDetail?.prescriptions ?? []) as PrescriptionRow[];

  return (
    <div className="space-y-2">
      {patient && (
        <div className="rounded-lg border bg-card p-3 space-y-1.5">
          <div className="grid grid-cols-2 gap-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span>
                {[patient.gender, patient.age ? `${patient.age}y` : null].filter(Boolean).join(", ") || "N/A"}
              </span>
            </div>
            {patient.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                <span>{patient.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-1 col-span-2">
              <Hash className="h-3.5 w-3.5" />
              <span className="font-mono text-xs">{patient.medical_id ?? patient.id.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>
        </div>
      )}

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

      {/* History Accordion */}
      <div className="rounded-lg border">
        <button
          onClick={() => setHistoryOpen(!historyOpen)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium hover:bg-muted/50 rounded-lg transition-colors"
        >
          <span>History ({consultations.length + prescriptions.length} records)</span>
          {historyOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {historyOpen && (
          <div className="px-4 pb-4 space-y-3">
            {consultations.length === 0 && prescriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                This is the patient&apos;s first visit.
              </p>
            ) : (
              <>
                {consultations.slice(0, 5).map((c) => (
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
                {prescriptions.slice(0, 3).map((p) => (
                  <div key={p.id} className="text-sm border-b pb-2 last:border-0">
                    <p className="font-medium">
                      Prescription ·{" "}
                      {p.created_at
                        ? format(parseISO(p.created_at), "MMM dd, yyyy")
                        : "Unknown date"}
                    </p>
                    {p.medications && p.medications.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {p.medications.map((m) => m.name).filter(Boolean).join(", ") || "No medications listed"}
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
