"use client";

import { useState, useCallback, useMemo } from "react";
import { ChevronDown, ChevronUp, Clock, User, Phone, Hash, Play, Receipt, Edit, Eye, X, CalendarPlus, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatTimeIST } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/loading";
import { useTodayStore, type ActiveFilter } from "@/stores/todayStore";
import { useAuth } from "@/contexts/AuthContext";
import type { AppointmentWithDetails } from "@/types/appointments";
import type { PatientDetail } from "@/hooks/usePatientDetail";
import type { BillWithDetails } from "@/types/billing";

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
}

const STATUS_COLORS: Record<string, string> = {
  "In Progress": "bg-yellow-100 text-yellow-800",
  Scheduled: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

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
    type?: string;
    created_at?: string;
    doctors?: { name?: string } | null;
  } | null;
};

type PrescriptionRow = {
  id: string;
  created_at: string;
  medications?: Array<{ name?: string }> | null;
};

function AppointmentCard({
  appointment,
  onStart,
  onView,
  onEditConsultation,
  onBill,
  onViewBill,
  onEdit,
  isOwnAppointment,
  hasBill,
}: {
  appointment: AppointmentWithDetails;
  onStart: () => void;
  onView: () => void;
  onEditConsultation: () => void;
  onBill: () => void;
  onViewBill?: () => void;
  onEdit: () => void;
  isOwnAppointment: boolean;
  hasBill: boolean;
}) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <Badge className={STATUS_COLORS[appointment.status] ?? "bg-gray-100 text-gray-800"}>
            {appointment.status}
          </Badge>
          <p className="text-sm text-muted-foreground mt-1">
            <Clock className="inline h-3 w-3 mr-1" />
            {format(parseISO(appointment.date), "MMM dd, yyyy")} at {formatTimeIST(appointment.time)}
          </p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{appointment.doctor_name}</p>
          {appointment.department_name && <p>{appointment.department_name}</p>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {appointment.status === "Scheduled" && isOwnAppointment && (
          <Button size="sm" onClick={onStart}><Play className="h-3 w-3 mr-1" />Start</Button>
        )}
        {appointment.status === "In Progress" && isOwnAppointment && (
          <Button size="sm" onClick={onStart}><Play className="h-3 w-3 mr-1" />Continue</Button>
        )}
        {appointment.status === "Completed" && isOwnAppointment && (
          <Button size="sm" onClick={onEditConsultation}><Edit className="h-3 w-3 mr-1" />Edit Notes</Button>
        )}
        {appointment.status === "Completed" && !isOwnAppointment && (
          <Button size="sm" variant="outline" onClick={onView}>View</Button>
        )}
        {appointment.status !== "Cancelled" && !hasBill && (
          <Button size="sm" variant="outline" onClick={onBill}>
            <Receipt className="h-3 w-3 mr-1" />Bill
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={onEdit}>
          <Edit className="h-3 w-3 mr-1" />Reschedule
        </Button>
      </div>

      {appointment.status === "Completed" && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={onView}>
            <Eye className="h-3 w-3 mr-1" />View Notes
          </Button>
          {hasBill && onViewBill && (
            <Button size="sm" variant="secondary" onClick={onViewBill}>
              <Receipt className="h-3 w-3 mr-1" />View Bill
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function TodayDetailPanel({
  activeFilter,
  patientAppointments,
  patientDetail,
  isLoadingDetail,
  patientBills,
  isLoadingBills,
  onStartConsultation,
  onViewConsultation,
  onEditConsultation,
  onCreateBill,
  onCreateBillForPatient,
  onScheduleAppointment,
  onEditAppointment,
  onEditPatient,
  onViewBill,
  onViewConsultationFromHistory,
}: TodayDetailPanelProps) {
  const selectedPatientId = useTodayStore((s) => s.selectedPatientId);
  const clearSelection = useTodayStore((s) => s.clearSelection);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { user } = useAuth();

  const handleClose = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const billsByAppointment = useMemo(() => {
    const map = new Map<string, BillWithDetails[]>();
    for (const bill of patientBills) {
      if (bill.appointment_id) {
        const list = map.get(bill.appointment_id) || [];
        list.push(bill);
        map.set(bill.appointment_id, list);
      }
    }
    return map;
  }, [patientBills]);

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

  const patient = patientDetail?.patient ?? null;
  const consultations = patientDetail?.consultations ?? [];
  const prescriptions = patientDetail?.prescriptions ?? [];

  const activeAppointments = patientAppointments.filter(
    (a) => a.status !== "Completed" && a.status !== "Cancelled"
  );
  const completedAppointments = patientAppointments.filter(
    (a) => a.status === "Completed"
  );

  // --- BILLING MODE ---
  if (activeFilter === "billing") {
    return (
      <div className="relative">
        <button
          onClick={handleClose}
          className="hidden lg:block absolute top-0 right-0 text-muted-foreground hover:text-foreground z-10"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="space-y-4">
          {patient && (
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold">{patient.name}</h3>
                <Button size="sm" variant="secondary" onClick={onCreateBillForPatient}>
                  <Receipt className="h-3 w-3 mr-1" />Create Bill
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>{[patient.gender, patient.age ? `${patient.age}y` : null].filter(Boolean).join(", ") || "N/A"}</span>
                </div>
                {patient.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{patient.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {isLoadingBills ? (
            <div className="flex items-center justify-center py-10">
              <Spinner size="lg" />
            </div>
          ) : patientBills.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No bills for this patient</p>
              <p className="text-sm">Create a bill to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Bills ({patientBills.length})
              </h3>
              {patientBills.map((bill) => (
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
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- QUEUE / ALL MODE ---
  const content = (
    <div className="space-y-4">
      {activeAppointments.map((app) => {
        const appBills = billsByAppointment.get(app.id) ?? [];
        return (
          <AppointmentCard
            key={app.id}
            appointment={app}
            onStart={() => onStartConsultation(app)}
            onView={() => onViewConsultation(app)}
            onEditConsultation={() => onEditConsultation(app)}
            onBill={() => onCreateBill(app)}
            onViewBill={appBills.length > 0 ? () => onViewBill(appBills[0]) : undefined}
            onEdit={() => onEditAppointment(app)}
            isOwnAppointment={app.user_id === user?.id}
            hasBill={appBills.length > 0}
          />
        );
      })}

      {completedAppointments.map((app) => {
        const appBills = billsByAppointment.get(app.id) ?? [];
        return (
          <AppointmentCard
            key={app.id}
            appointment={app}
            onStart={() => {}}
            onView={() => onViewConsultation(app)}
            onEditConsultation={() => onEditConsultation(app)}
            onBill={() => onCreateBill(app)}
            onViewBill={appBills.length > 0 ? () => onViewBill(appBills[0]) : undefined}
            onEdit={() => onEditAppointment(app)}
            isOwnAppointment={app.user_id === user?.id}
            hasBill={appBills.length > 0}
          />
        );
      })}

      {patient && (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold">{patient.name}</h3>
            <div className="flex gap-1">
              <Button size="sm" variant="secondary" onClick={onScheduleAppointment}>
                <CalendarPlus className="h-3 w-3 mr-1" />Schedule
              </Button>
              <Button size="sm" variant="secondary" onClick={onCreateBillForPatient}>
                <Receipt className="h-3 w-3 mr-1" />Bill
              </Button>
              <Button size="sm" variant="secondary" onClick={onEditPatient}>
                <Edit className="h-3 w-3 mr-1" />Edit
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span>{[patient.gender, patient.age ? `${patient.age}y` : null].filter(Boolean).join(", ") || "N/A"}</span>
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

      {/* History Section */}
      <div className="rounded-lg border">
        <button
          onClick={() => setHistoryOpen(!historyOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 rounded-lg transition-colors"
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
                {(consultations as ConsultationRow[]).slice(0, 5).map((c) => (
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
                          onClick={() => onViewConsultationFromHistory(
                            c.appointments!.id!,
                            selectedPatientId!,
                            c.appointments!.doctor_id ?? ""
                          )}
                        >
                          <Eye className="h-3 w-3 mr-1" />View Notes
                        </Button>
                      )}
                    </div>
                    {c.specialty_data && typeof c.specialty_data === "object" && "chief_complaint" in c.specialty_data && c.specialty_data.chief_complaint ? (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {(c.specialty_data as Record<string, unknown>).chief_complaint as string}
                      </p>
                    ) : null}
                  </div>
                ))}
                {(prescriptions as PrescriptionRow[]).slice(0, 3).map((p) => (
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

  return (
    <div className="relative">
      <button
        onClick={handleClose}
        className="hidden lg:block absolute top-0 right-0 text-muted-foreground hover:text-foreground z-10"
      >
        <X className="h-4 w-4" />
      </button>
      {content}
    </div>
  );
}

export { AppointmentCard };
