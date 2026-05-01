"use client";

import { useCallback } from "react";
import { Clock, User, ChevronRight, Circle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { formatTimeIST } from "@/lib/utils";
import { Spinner } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { useTodayStore } from "@/stores/todayStore";
import type { TodayQueue } from "@/hooks/useTodayAppointments";
import type { BillingPatient } from "@/hooks/useOutstandingBalances";
import type { DbPatientByClinic } from "@/types/core";
import type { AppointmentWithDetails } from "@/types/appointments";

interface TodayPatientListProps {
  queue: TodayQueue;
  isLoadingQueue: boolean;
  billingPatients: BillingPatient[];
  isLoadingBilling: boolean;
  searchPatients: DbPatientByClinic[];
  isLoadingSearch: boolean;
  appointmentsByPatient: Map<string, AppointmentWithDetails[]>;
  onAppointmentClick: (app: AppointmentWithDetails) => void;
}

const STATUS_GROUPS = [
  { key: "inProgress" as const, label: "In Progress", color: "text-yellow-500", bg: "bg-yellow-50" },
  { key: "scheduled" as const, label: "Waiting", color: "text-blue-500", bg: "bg-blue-50" },
  { key: "completed" as const, label: "Completed", color: "text-green-500", bg: "bg-green-50" },
];

function QueueSection({
  title,
  appointments,
  color,
  bg,
  onAppointmentClick,
}: {
  title: string;
  appointments: AppointmentWithDetails[];
  color: string;
  bg: string;
  onAppointmentClick: (app: AppointmentWithDetails) => void;
}) {
  if (appointments.length === 0) return null;

  return (
    <div className="mb-4">
      <div className={`flex items-center gap-2 px-3 py-1.5 ${bg} rounded-md mb-2`}>
        <Circle className={`h-2 w-2 fill-current ${color}`} />
        <span className={`text-xs font-semibold uppercase tracking-wide ${color}`}>
          {title} ({appointments.length})
        </span>
      </div>
      <div className="space-y-1">
        {appointments.map((app) => (
          <button
            key={app.id}
            onClick={() => onAppointmentClick(app)}
            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-muted/50 flex items-center justify-between group transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{app.patient_name}</p>
                <p className="text-xs text-muted-foreground">
                  {app.doctor_name}
                  {app.department_name ? ` · ${app.department_name}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(app.date), "MMM dd")}
                </p>
                <p className="text-xs font-medium">{formatTimeIST(app.time)}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function TodayPatientList({
  queue,
  isLoadingQueue,
  billingPatients,
  isLoadingBilling,
  searchPatients,
  isLoadingSearch,
  onAppointmentClick,
}: TodayPatientListProps) {
  const activeFilter = useTodayStore((s) => s.activeFilter);
  const selectedPatientId = useTodayStore((s) => s.selectedPatientId);
  const searchQuery = useTodayStore((s) => s.searchQuery);
  const selectPatient = useTodayStore((s) => s.selectPatient);

  const handleBillingPatientClick = useCallback(
    (patientId: string) => {
      selectPatient(patientId);
    },
    [selectPatient]
  );

  const handleSearchPatientClick = useCallback(
    (patientId: string) => {
      selectPatient(patientId);
    },
    [selectPatient]
  );

  const totalToday =
    queue.inProgress.length + queue.scheduled.length + queue.completed.length;

  // --- QUEUE MODE ---
  if (activeFilter === "queue") {
    if (isLoadingQueue) {
      return (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      );
    }

    if (totalToday === 0) {
      return (
        <div className="text-center py-16 text-muted-foreground">
          <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No appointments today</p>
          <p className="text-sm">New patients will appear here.</p>
        </div>
      );
    }

    return (
      <div className="py-2">
        {STATUS_GROUPS.map((group) => (
          <QueueSection
            key={group.key}
            title={group.label}
            appointments={queue[group.key]}
            color={group.color}
            bg={group.bg}
            onAppointmentClick={onAppointmentClick}
          />
        ))}
      </div>
    );
  }

  // --- BILLING MODE ---
  if (activeFilter === "billing") {
    if (isLoadingBilling) {
      return (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      );
    }

    if (billingPatients.length === 0) {
      return (
        <div className="text-center py-16 text-muted-foreground">
          <p className="font-medium">All bills are settled</p>
          <p className="text-sm">No outstanding balances.</p>
        </div>
      );
    }

    return (
      <div className="py-2 space-y-1">
        {billingPatients.map((bp) => (
          <button
            key={bp.patient_id}
            onClick={() => handleBillingPatientClick(bp.patient_id)}
            className={`w-full text-left px-3 py-2.5 rounded-lg hover:bg-muted/50 flex items-center justify-between group transition-colors ${
              selectedPatientId === bp.patient_id ? "bg-muted" : ""
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-orange-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{bp.patient_name}</p>
                <p className="text-xs text-muted-foreground">
                  {bp.bill_count} unpaid bill{bp.bill_count !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 text-xs">
                ₹{bp.total_due.toLocaleString("en-IN")}
              </Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>
    );
  }

  // --- ALL MODE (Search) ---
  if (isLoadingSearch) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!searchQuery.trim()) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="font-medium">Search for patients</p>
        <p className="text-sm">Type a name in the search bar above.</p>
      </div>
    );
  }

  if (searchPatients.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="font-medium">No patients found</p>
        <p className="text-sm">No patients matching &quot;{searchQuery}&quot;.</p>
      </div>
    );
  }

  return (
    <div className="py-2 space-y-1">
      {searchPatients.map((patient) => (
        <button
          key={patient.id}
          onClick={() => handleSearchPatientClick(patient.id)}
          className={`w-full text-left px-3 py-2.5 rounded-lg hover:bg-muted/50 flex items-center justify-between group transition-colors ${
            selectedPatientId === patient.id ? "bg-muted" : ""
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{patient.name}</p>
              <p className="text-xs text-muted-foreground">
                {[patient.gender, patient.age ? `${patient.age}y` : null]
                  .filter(Boolean)
                  .join(" · ") || "No details"}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      ))}
    </div>
  );
}
