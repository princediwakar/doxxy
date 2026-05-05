// components/today/TodayPatientList.tsx
"use client";

import { useCallback, useState, startTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Clock, User, ChevronRight, Circle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { formatTimeIST, cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/loading";
import { useTodayStore } from "@/stores/todayStore";
import { queryPatientSearch } from "@/lib/queries/patients";
import { useAppState } from "@/contexts/AppStateContext";
import type { TodayQueue } from "@/types/appointments";
import type { AppointmentWithDetails } from "@/types/appointments";

interface TodayPatientListProps {
  queue: TodayQueue;
  onAppointmentClick: (app: AppointmentWithDetails) => void;
}

const STATUS_GROUPS = [
  {
    key: "inProgress" as const,
    label: "In Progress",
    color: "text-yellow-500",
    bg: "bg-yellow-50",
  },
  {
    key: "scheduled" as const,
    label: "Waiting",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    key: "completed" as const,
    label: "Completed",
    color: "text-green-500",
    bg: "bg-green-50",
  },
];

function QueueSection({
  title,
  appointments,
  color,
  bg,
  selectedAppointmentId,
  onAppointmentClick,
}: {
  title: string;
  appointments: AppointmentWithDetails[];
  color: string;
  bg: string;
  selectedAppointmentId: string | null;
  onAppointmentClick: (app: AppointmentWithDetails) => void;
}) {
  if (appointments.length === 0) return null;

  return (
    <div className="mb-4">
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
            onClick={() => onAppointmentClick(app)}
            className={cn(
              "w-full text-left px-3 py-2.5 rounded-lg hover:bg-muted/50 flex items-center justify-between group transition-colors",
              selectedAppointmentId === app.id &&
                "bg-primary/10 ring-1 ring-primary/20",
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {app.patient_name}
                </p>
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
}: TodayPatientListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dirtyFormGuard = useTodayStore((s) => s.dirtyFormGuard);
  const triggerShake = useTodayStore((s) => s.triggerShake);
  const { activeClinicId } = useAppState();

  const activeFilter = searchParams.get("filter") || "queue";
  const selectedAppointmentId = searchParams.get("appointment") || null;
  const selectedPatientId = searchParams.get("patient") || null;
  const searchQuery = activeFilter === "all" ? searchParams.get("q") || "" : "";
  const genderFilter = searchParams.get("gender");
  const ageGroupFilter = searchParams.get("age_group");

  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch] = useDebounce(searchQuery, 300);

  const { data: searchResult, isLoading: isLoadingSearch } = useQuery({
    queryKey: [
      "patientSearch",
      activeClinicId,
      debouncedSearch,
      genderFilter ?? "",
      ageGroupFilter ?? "",
      currentPage,
    ],
    queryFn: () =>
      queryPatientSearch(activeClinicId!, debouncedSearch, {
        gender: genderFilter ?? undefined,
        ageGroup: ageGroupFilter ?? undefined,
        page: currentPage,
      }),
    enabled:
      activeFilter === "all" && !!activeClinicId && (!!debouncedSearch.trim() || !!genderFilter || !!ageGroupFilter),
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const searchPatients = searchResult?.patients ?? [];
  const totalSearchCount = searchResult?.totalCount ?? 0;

  const handleQueueAppointmentClick = useCallback(
    (app: AppointmentWithDetails) => {
      if (dirtyFormGuard) {
        toast.error(
          "Complete or discard the current bill before switching patients.",
        );
        triggerShake();
        return;
      }
      const params = new URLSearchParams(searchParams.toString());
      params.set("patient", app.patient_id);
      params.set("appointment", app.id);
      router.push(`/today?${params.toString()}`, { scroll: false });
      onAppointmentClick(app);
    },
    [dirtyFormGuard, triggerShake, router, searchParams, onAppointmentClick],
  );

  const handleSearchPatientClick = useCallback(
    (patientId: string) => {
      if (dirtyFormGuard) {
        toast.error(
          "Complete or discard the current bill before switching patients.",
        );
        triggerShake();
        return;
      }
      const params = new URLSearchParams(searchParams.toString());
      params.set("patient", patientId);
      router.push(`/today?${params.toString()}`, { scroll: false });
    },
    [dirtyFormGuard, triggerShake, router, searchParams],
  );

  const totalToday =
    queue.inProgress.length + queue.scheduled.length + queue.completed.length;

  // ── QUEUE MODE ──
  if (activeFilter === "queue") {
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
            selectedAppointmentId={selectedAppointmentId}
            onAppointmentClick={handleQueueAppointmentClick}
          />
        ))}
      </div>
    );
  }

  // ── ALL MODE (Search) ──
  if (isLoadingSearch) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const hasActiveFilter = !!(genderFilter || ageGroupFilter);

  if (!searchQuery.trim() && !hasActiveFilter) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="font-medium">Search for patients</p>
        <p className="text-sm">Type a name in the search bar above.</p>
      </div>
    );
  }

  if (searchPatients.length === 0) {
    const filterLabel = [
      searchQuery.trim() && `"${searchQuery}"`,
      genderFilter && `gender: ${genderFilter}`,
      ageGroupFilter && `age: ${ageGroupFilter}`,
    ]
      .filter(Boolean)
      .join(", ");
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="font-medium">No patients found</p>
        <p className="text-sm">No patients matching {filterLabel}.</p>
      </div>
    );
  }

  return (
    <div className="py-2 space-y-1">
      {searchPatients.map((patient) => (
        <button
          key={patient.id}
          onClick={() => handleSearchPatientClick(patient.id)}
          className={cn(
            "w-full text-left px-3 py-2.5 rounded-lg hover:bg-muted/50 flex items-center justify-between group transition-colors",
            selectedPatientId === patient.id &&
              "bg-primary/10 ring-1 ring-primary/20",
          )}
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
