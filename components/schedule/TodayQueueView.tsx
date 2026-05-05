"use client";

import { DateCarousel } from "@/components/schedule/DateCarousel";
import { TodayPatientList } from "@/components/schedule/TodayPatientList";
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
      className="border rounded-lg bg-muted/5 flex flex-col overflow-hidden"
      style={{ height: isMobile ? "calc(100vh - 11rem)" : "100%" }}
    >
      <DateCarousel />
      <div className="flex-1 overflow-y-auto p-4">
        <TodayPatientList
          queue={queue}
          onAppointmentClick={onAppointmentClick}
          doctorFilter={doctorFilter}
        />
      </div>
    </div>
  );
}
