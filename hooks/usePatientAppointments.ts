"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/query-keys";
import type { Appointment } from "@/types/patients";

const supabase = getSupabase();

export interface AppointmentWithDetails extends Appointment {
  doctor_name: string;
}

export function usePatientAppointments(patientId: string | undefined) {
  const { activeClinic } = useAuth();

  return useQuery({
    queryKey: queryKeys.appointments.byPatient(patientId ?? ""),
    queryFn: async () => {
      if (!patientId || !activeClinic?.clinic_id) return [];

      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          doctors!inner(name)
        `)
        .eq("patient_id", patientId)
        .eq("clinic_id", activeClinic.clinic_id)
        .order("date", { ascending: false });

      if (error) throw error;

      return (data || []).map((apt) => ({
        ...apt,
        doctor_name: apt.doctors?.name || "Unknown Doctor",
      })) as AppointmentWithDetails[];
    },
    enabled: !!patientId && !!activeClinic?.clinic_id,
  });
}
