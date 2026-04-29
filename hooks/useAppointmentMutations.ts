// src/hooks/useAppointmentMutations.ts
"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import type { AppointmentFormValues } from "@/components/appointments/appointment.utils";
import type { AppointmentData } from "@/types/appointments";

const supabase = getSupabase();

export const useAppointmentMutation = (
  appointment: AppointmentData | null,
  onSuccessCallback: () => void
) => {
  const queryClient = useQueryClient();
  const { activeClinic } = useAuth();

  return useMutation({
    mutationFn: async (values: AppointmentFormValues) => {
      if (!activeClinic?.clinic_id)
        throw new Error("No active clinic selected.");

      const baseAppointmentData = {
        clinic_id: activeClinic.clinic_id,
        date: format(values.date, "yyyy-MM-dd"),
        time: values.time || "",
        patient_id: values.patient_id,
        doctor_id: values.doctor_id,
        type: values.type,
        status: values.status,
        notes: values.notes || "",
      };

      const query = appointment
        ? supabase
            .from("appointments")
            .update(baseAppointmentData)
            .eq("id", appointment.id)
        : supabase.from("appointments").insert(baseAppointmentData);

      const { data, error } = await query.select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success(
        appointment ? "Appointment updated!" : "Appointment created!"
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.appointments.byClinic(activeClinic?.clinic_id ?? ""),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.data(activeClinic?.clinic_id ?? ""),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      onSuccessCallback();
    },
    onError: (error: Error) => {
      toast.error(
        appointment
          ? "Failed to update appointment."
          : "Failed to create appointment.",
        {
          description: error.message,
        }
      );
    },
  });
};
