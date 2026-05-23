"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppState } from "@/contexts/AppStateContext";
import { toast } from "sonner";
import { showErrorToast } from "@/lib/error-utils";
import { queryKeys } from "@/lib/query-keys";
import { submitEncounter } from "@/actions/encounter/complete";
import type { AIStructuredOutput } from "@/types/voice";

export function useEncounterCompletion() {
  const { activeClinicId } = useAppState();
  const queryClient = useQueryClient();

  const completeMutation = useMutation({
    mutationFn: async ({
      appointmentId,
      patientId,
      doctorId,
      aiData,
    }: {
      appointmentId: string;
      patientId: string;
      doctorId: string;
      aiData: AIStructuredOutput;
    }) => {
      if (!activeClinicId) throw new Error("Clinic ID not found");

      await submitEncounter(
        appointmentId,
        patientId,
        doctorId,
        activeClinicId,
        aiData,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      queryClient.invalidateQueries({ queryKey: ["clinic-billing-summary"] });
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      toast.success("Encounter completed");
    },
    onError: (err) => {
      showErrorToast(err);
    },
  });

  return {
    completeEncounter: completeMutation.mutate,
    isCompleting: completeMutation.isPending,
  };
}
