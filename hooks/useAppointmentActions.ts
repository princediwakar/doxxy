"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { queryKeys } from "@/lib/query-keys";
import { APPOINTMENT_STATUS } from "@/types/appointments";

const supabase = getSupabase();

export function useAppointmentActions() {
  const { activeClinic, activeClinicRole } = useAuth();
  const queryClient = useQueryClient();

  const cancelAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      const { error } = await supabase
        .from("appointments")
        .update({ status: APPOINTMENT_STATUS.CANCELLED })
        .eq("id", appointmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      queryClient.invalidateQueries({ queryKey: ["clinic-billing-summary"] });
      toast.success("Appointment cancelled");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleStartConsultation = async (
    appointmentId: string,
    canBookAppointment: (credits: number) => boolean
  ): Promise<boolean> => {
    try {
      if (!appointmentId) throw new Error("Invalid appointment ID");
      if (!activeClinic?.clinic_id) throw new Error("Clinic ID not found");

      const { data: existing, error: checkError } = await supabase
        .from("consultations")
        .select("id")
        .eq("appointment_id", appointmentId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        const { error: updateError } = await supabase
          .from("appointments")
          .update({ status: APPOINTMENT_STATUS.IN_PROGRESS })
          .eq("id", appointmentId);
        if (updateError) throw updateError;
        queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
        queryClient.invalidateQueries({ queryKey: ["clinic-billing-summary"] });
        return true;
      }

      if (activeClinicRole !== "superadmin") {
        const hasCredits = await canBookAppointment(1);
        if (!hasCredits) {
          throw new Error("Insufficient credits. Please purchase more.");
        }
      }

      const { data: appData, error: appError } = await supabase
        .from("appointments")
        .select("patient_id, doctor_id")
        .eq("id", appointmentId)
        .single();

      if (appError) throw appError;

      const { error: insertError } = await supabase
        .from("consultations")
        .insert({
          appointment_id: appointmentId,
          clinic_id: activeClinic.clinic_id,
          patient_id: appData.patient_id,
          doctor_id: appData.doctor_id,
          specialty_data: {},
          clinical_notes: {},
        });

      if (insertError) throw insertError;

      const { error: statusError } = await supabase
        .from("appointments")
        .update({ status: APPOINTMENT_STATUS.IN_PROGRESS })
        .eq("id", appointmentId);

      if (statusError) throw statusError;

      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      queryClient.invalidateQueries({ queryKey: ["clinic-billing-summary"] });
      return true;
    } catch (err: unknown) {
      logger.error("Consultation Start Failed:", err);
      const message = err instanceof Error ? err.message : "Failed to start consultation";
      toast.error(message);
      throw err;
    }
  };

  return {
    cancelAppointmentMutation,
    handleStartConsultation,
  };
}
