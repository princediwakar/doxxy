// components/schedule/TodayQueueView.tsx
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
  hasDoctors: boolean;
}

export function TodayQueueView({
  queue,
  onAppointmentClick,
  isMobile = false,
  doctorFilter,
  hasDoctors,
}: TodayQueueViewProps) {
  return (
    <div
      className="border rounded-lg bg-muted/5 flex flex-col overflow-hidden"
      style={{ height: isMobile ? "calc(100vh - 11rem)" : "100%" }}
    >
      <DateCarousel />
      <div className="flex-1 overflow-y-auto p-4">
        {hasDoctors ? (
          <TodayPatientList
            queue={queue}
            onAppointmentClick={onAppointmentClick}
            doctorFilter={doctorFilter}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-sm">
              <p className="text-amber-600 dark:text-amber-400 font-semibold text-lg">
                No Active Doctors
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Appointments are disabled until a doctor selects their department.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
