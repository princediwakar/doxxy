"use client";

import { useState, useCallback } from "react";
import { ChevronDown, ChevronUp, Clock, User, Phone, Hash, Play, Receipt, Edit, Eye, X, CalendarPlus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatTimeIST } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/loading";
import { useTodayStore } from "@/stores/todayStore";
import { useAuth } from "@/contexts/AuthContext";
import type { AppointmentWithDetails } from "@/types/appointments";
import type { PatientDetail } from "@/hooks/usePatientDetail";

interface TodayDetailPanelProps {
  patientAppointments: AppointmentWithDetails[];
  patientDetail: PatientDetail | undefined;
  isLoadingDetail: boolean;
  onStartConsultation: (app: AppointmentWithDetails) => void;
  onViewConsultation: (app: AppointmentWithDetails) => void;
  onCreateBill: (app: AppointmentWithDetails) => void;
  onCreateBillForPatient: () => void;
  onScheduleAppointment: () => void;
  onEditAppointment: (app: AppointmentWithDetails) => void;
  onCancelAppointment: (app: AppointmentWithDetails) => void;
  onEditPatient: () => void;
  cancelLoading?: boolean;
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
  appointments?: {
    doctor_id?: string;
    status?: string;
  } | null;
};

type PrescriptionRow = {
  id: string;
  created_at: string;
};

function AppointmentCard({
  appointment,
  onStart,
  onView,
  onBill,
  onEdit,
  onCancel,
  cancelLoading,
  isOwnAppointment,
}: {
  appointment: AppointmentWithDetails;
  onStart: () => void;
  onView: () => void;
  onBill: () => void;
  onEdit: () => void;
  onCancel: () => void;
  cancelLoading: boolean;
  isOwnAppointment: boolean;
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
        {appointment.status === "Completed" && (
          <Button size="sm" variant="outline" onClick={onView}>{isOwnAppointment ? "Edit" : "View"}</Button>
        )}
        {appointment.status !== "Cancelled" && (
          <Button size="sm" variant="outline" onClick={onBill}><Receipt className="h-3 w-3 mr-1" />Bill</Button>
        )}
        <Button size="sm" variant="ghost" onClick={onEdit}>
          <Edit className="h-3 w-3 mr-1" />Reschedule
        </Button>
        {(appointment.status === "Scheduled" || appointment.status === "In Progress") && (
          <Button size="sm" variant="ghost" className="text-destructive" onClick={onCancel} disabled={cancelLoading}>
            <X className="h-3 w-3 mr-1" />Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

export function TodayDetailPanel({
  patientAppointments,
  patientDetail,
  isLoadingDetail,
  onStartConsultation,
  onViewConsultation,
  onCreateBill,
  onCreateBillForPatient,
  onScheduleAppointment,
  onEditAppointment,
  onCancelAppointment,
  onEditPatient,
  cancelLoading,
}: TodayDetailPanelProps) {
  const selectedPatientId = useTodayStore((s) => s.selectedPatientId);
  const clearSelection = useTodayStore((s) => s.clearSelection);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { user } = useAuth();

  const handleClose = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

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

  const content = (
    <div className="space-y-4">
      {/* Active Appointments */}
      {activeAppointments.map((app) => (
        <AppointmentCard
          key={app.id}
          appointment={app}
          onStart={() => onStartConsultation(app)}
          onView={() => onViewConsultation(app)}
          onBill={() => onCreateBill(app)}
          onEdit={() => onEditAppointment(app)}
          onCancel={() => onCancelAppointment(app)}
          cancelLoading={cancelLoading ?? false}
          isOwnAppointment={app.user_id === user?.id}
        />
      ))}

      {/* Patient Info */}
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
                  <div key={c.id} className="text-sm border-b pb-2 last:border-0">
                    <p className="font-medium">
                      Consultation ·{" "}
                      {c.created_at
                        ? format(parseISO(c.created_at), "MMM dd, yyyy")
                        : "Unknown date"}
                    </p>
                    {c.appointments && (
                      <p className="text-xs text-muted-foreground">
                        Doctor: {c.appointments.doctor_id ?? "—"}
                        {" · "}
                        Status: {c.appointments.status ?? "—"}
                      </p>
                    )}
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

// Re-export AppointmentCard in case it's useful elsewhere
export { AppointmentCard };
