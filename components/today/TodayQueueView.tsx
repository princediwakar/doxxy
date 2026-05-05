"use client";

import { TodayPatientList } from "@/components/today/TodayPatientList";
import type { TodayQueue } from "@/types/appointments";
import type { AppointmentWithDetails } from "@/types/appointments";

interface TodayQueueViewProps {
  queue: TodayQueue;
  onAppointmentClick: (app: AppointmentWithDetails) => void;
  isMobile?: boolean;
  doctorFilter: string | null;
}

export function TodayQueueView({
  queue,
  onAppointmentClick,
  isMobile = false,
  doctorFilter,
}: TodayQueueViewProps) {
  return (
    <div
      className="border rounded-lg bg-muted/5 p-4 overflow-y-auto"
      style={{ height: isMobile ? "calc(100vh - 11rem)" : "100%" }}
    >
      <TodayPatientList
        queue={queue}
        onAppointmentClick={onAppointmentClick}
        doctorFilter={doctorFilter}
      />
    </div>
  );
}
