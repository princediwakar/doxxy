// components/schedule/TodayPatientList.tsx
"use client";

import { useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Clock, ChevronRight, Circle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { formatTimeIST, cn } from "@/lib/utils";
import type { TodayQueue } from "@/types/appointments";
import type { AppointmentWithDetails } from "@/types/appointments";

interface TodayPatientListProps {
  queue: TodayQueue;
  onAppointmentClick: (app: AppointmentWithDetails) => void;
  doctorFilter: string | null;
  dirtyFormGuard: boolean;
  onShake: () => void;
  onSetMobileDetailOpen: (open: boolean) => void;
}

const STATUS_GROUPS = [
  {
    key: "inProgress" as const,
    label: "In Progress",
    color: "text-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
  },
  {
    key: "scheduled" as const,
    label: "Waiting",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    key: "completed" as const,
    label: "Completed",
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950/30",
  },
  {
    key: "upcoming" as const,
    label: "Upcoming",
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950/30",
  },
];

function QueueSection({
  title,
  appointments,
  color,
  bg,
  selectedAppointmentId,
  onAppointmentClick,
  showDoctorInfo,
}: {
  title: string;
  appointments: AppointmentWithDetails[];
  color: string;
  bg: string;
  selectedAppointmentId: string | null;
  onAppointmentClick: (app: AppointmentWithDetails) => void;
  showDoctorInfo: boolean;
}) {
  if (appointments.length === 0) return null;

  return (
    <div className="mb-3">
      <div
        className={`flex items-center gap-2 px-3 py-1.5 ${bg} rounded-md mb-2`}
      >
        <Circle className={`h-2 w-2 fill-current ${color}`} />
        <span
          className={`text-xs font-semibold uppercase tracking-wide ${color}`}
        >
          {title} ({appointments.length})
        </span>
      </div>
      <div className="space-y-1">
        {appointments.map((app) => (
          <button
            key={app.id}
            data-testid="patient-card"
            onClick={() => onAppointmentClick(app)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 flex items-center justify-between group transition-colors",
              selectedAppointmentId === app.id &&
              "bg-primary/10 ring-1 ring-primary/20",
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              {(() => {
                const g = (app.patient_gender || "").toLowerCase();
                const color = g === "male" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : g === "female" ? "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400" : "bg-primary/10 text-primary";
                return (
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                    <span className="text-[10px] font-semibold">{app.patient_name?.[0]?.toUpperCase() || "?"}</span>
                  </div>
                );
              })()}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {app.patient_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {showDoctorInfo
                    ? [app.doctor_name, app.department_name].filter(Boolean).join(" · ") || "—"
                    : [app.patient_gender, app.patient_age != null ? `${app.patient_age}y` : null].filter(Boolean).join(", ") || "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(app.date), "MMM dd")}
                </p>
                <p className="text-xs font-medium">
                  {formatTimeIST(app.time)}
                </p>
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
  onAppointmentClick,
  doctorFilter,
  dirtyFormGuard,
  onShake,
  onSetMobileDetailOpen,
}: TodayPatientListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedAppointmentId = searchParams.get("appointment") || null;

  const showDoctorInfo = doctorFilter === null;

  const handleQueueAppointmentClick = useCallback(
    (app: AppointmentWithDetails) => {
      if (dirtyFormGuard) {
        toast.error(
          "Complete or discard the current bill before switching patients.",
        );
        onShake();
        return;
      }
      const params = new URLSearchParams(searchParams.toString());
      params.set("patient", app.patient_id);
      params.set("appointment", app.id);
      router.push(`/schedule?${params.toString()}`, { scroll: false });
      onAppointmentClick(app);
      onSetMobileDetailOpen(true);
    },
    [dirtyFormGuard, onShake, router, searchParams, onAppointmentClick, onSetMobileDetailOpen],
  );

  const totalEntries =
    queue.inProgress.length + queue.scheduled.length + queue.completed.length + queue.upcoming.length;

  if (totalEntries === 0) {
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
          selectedAppointmentId={selectedAppointmentId}
          onAppointmentClick={handleQueueAppointmentClick}
          showDoctorInfo={showDoctorInfo}
        />
      ))}
    </div>
  );
}
