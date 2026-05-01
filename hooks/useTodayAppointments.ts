"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { parseISO, isToday } from "date-fns";
import { queryKeys } from "@/lib/query-keys";
import type { AppointmentWithDetails } from "@/types/appointments";

const supabase = getSupabase();

export interface TodayQueue {
  inProgress: AppointmentWithDetails[];
  scheduled: AppointmentWithDetails[];
  completed: AppointmentWithDetails[];
}

async function fetchTodayAppointments(clinicId: string): Promise<TodayQueue> {
  const { data, error } = await supabase.rpc("get_appointments_with_details_by_clinic", {
    clinic_id: clinicId,
  });

  if (error) throw error;

  const todayApps = ((data ?? []) as AppointmentWithDetails[]).filter((app) =>
    isToday(parseISO(app.date))
  );

  return {
    inProgress: todayApps.filter((a) => a.status === "In Progress"),
    scheduled: todayApps.filter((a) => a.status === "Scheduled"),
    completed: todayApps.filter((a) => a.status === "Completed"),
  };
}

export function useTodayAppointments() {
  const { activeClinic, loading: authLoading } = useAuth();
  const clinicId = activeClinic?.clinic_id ?? "";
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [...queryKeys.appointments.byClinic(clinicId), "today"],
    queryFn: () => fetchTodayAppointments(clinicId),
    enabled: !!clinicId && !authLoading,
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });

  const queue = useMemo(
    () =>
      data ?? { inProgress: [], scheduled: [], completed: [] },
    [data]
  );

  return {
    queue,
    isLoading,
    refetch: () =>
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.appointments.byClinic(clinicId), "today"],
      }),
  };
}
