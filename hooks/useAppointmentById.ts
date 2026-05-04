"use client";
import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import type { AppointmentWithDetails } from "@/types/appointments";

const supabase = getSupabase();

async function fetchAppointmentById(id: string): Promise<AppointmentWithDetails | null> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*, patient:patients(*), doctor:doctors(user_id, name)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as unknown as AppointmentWithDetails;
}

export function useAppointmentById(id: string | undefined | null) {
  return useQuery({
    queryKey: ["appointment", id],
    queryFn: () => fetchAppointmentById(id!),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}
