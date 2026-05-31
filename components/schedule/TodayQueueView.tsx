// components/schedule/TodayQueueView.tsx
"use client";

import { DateCarousel } from "@/components/schedule/DateCarousel";
import { TodayPatientList } from "@/components/schedule/TodayPatientList";
import type { TodayQueue } from "@/types/appointments";
import type { AppointmentWithDetails } from "@/types/appointments";

interface TodayQueueViewProps {
  queue: TodayQueue;
  onAppointmentClick: (app: AppointmentWithDetails) => void;
  doctorFilter: string | null;
  hasDoctors: boolean;
}

export function TodayQueueView({
  queue,
  onAppointmentClick,
  doctorFilter,
  hasDoctors,
}: TodayQueueViewProps) {
  return (
    <div className="flex flex-col overflow-hidden h-full lg:border lg:rounded-lg lg:bg-muted/5">
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
