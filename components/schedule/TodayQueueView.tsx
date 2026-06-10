// components/schedule/TodayQueueView.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Stethoscope, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTodayStore } from "@/stores/todayStore";
import { TodayPatientList } from "@/components/schedule/TodayPatientList";
import type { TodayQueue } from "@/types/appointments";
import type { AppointmentWithDetails } from "@/types/appointments";

interface Doctor {
  id: string;
  name: string;
  user_id: string;
  primary_specialization: string | null;
}

interface TodayQueueViewProps {
  queue: TodayQueue;
  onAppointmentClick: (app: AppointmentWithDetails) => void;
  doctorFilter: string | null;
  hasDoctors: boolean;
  dirtyFormGuard: boolean;
  onShake: () => void;
  onSetMobileDetailOpen: (open: boolean) => void;
  doctors: Doctor[];
  userDoctorId: string | null;
}

export function TodayQueueView({
  queue,
  onAppointmentClick,
  doctorFilter,
  hasDoctors,
  dirtyFormGuard,
  onShake,
  onSetMobileDetailOpen,
  doctors,
  userDoctorId,
}: TodayQueueViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const openModal = useTodayStore((s) => s.openModal);

  const handleDoctorChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.set("doctor", "all");
    } else {
      params.set("doctor", value);
    }
    params.delete("patient");
    params.delete("appointment");
    router.push(`/schedule?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <div className="flex-1 overflow-y-auto">
        {hasDoctors ? (
          <>
            <div className="mb-4 shrink-0">
              <div className="flex items-center justify-between lg:flex-col lg:items-stretch xl:flex-row xl:items-center xl:justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted shrink-0">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <h1 className="text-2xl font-bold">Schedule</h1>
                </div>
                <Button onClick={() => openModal("patient-new")} size="sm" className="gap-1.5 bg-primary shrink-0 lg:w-full xl:w-auto">
                  <Plus className="w-4 h-4" />
                  New Patient
                </Button>
              </div>

              <div className="shrink-0">
              <Select
                value={doctorFilter ?? "all"}
                onValueChange={handleDoctorChange}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <Stethoscope className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {userDoctorId && (
                    <SelectItem value={userDoctorId}>My Patients</SelectItem>
                  )}
                  {doctors
                    .filter((d) => d.id !== userDoctorId)
                    .map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            </div>

            <TodayPatientList
              queue={queue}
              onAppointmentClick={onAppointmentClick}
              doctorFilter={doctorFilter}
              dirtyFormGuard={dirtyFormGuard}
              onShake={onShake}
              onSetMobileDetailOpen={onSetMobileDetailOpen}
            />
          </>
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
