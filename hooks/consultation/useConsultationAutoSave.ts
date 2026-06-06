"use client";
import { logger } from "@/lib/logger";

import { useEffect, useCallback, useRef } from "react";
import { useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ConsultationFormValues } from "@/types/consultation";
import type { DbAppointment, DbConsultationBase } from "@/types/core";
import type { UseFormReturn } from "react-hook-form";
import type { ClinicMemberWithClinic } from "@/types/core";
import type { AppUser } from "@/types/core";

import { isDeepEqual } from "./utils";
import { saveConsultation } from "@/actions/consultations";

export type AutoSaveResult = { success: boolean; id: string } | { error: string };

export interface UseConsultationAutoSaveParams {
  form: UseFormReturn<ConsultationFormValues>;
  formValues: ConsultationFormValues;
  appointmentId: string | undefined;
  appointment: DbAppointment | null | undefined;
  activeClinicId: string | undefined;
  user: AppUser | null;
  canEditConsultation: boolean;
  autoSaveReady: boolean;
}

export interface UseConsultationAutoSaveReturn {
  autoSaveMutation: UseMutationResult<AutoSaveResult, Error, ConsultationFormValues>;
  handleSave: () => void;
  setBaseline: (values: ConsultationFormValues) => void;
}

export const useConsultationAutoSave = ({
  form,
  formValues,
  appointmentId,
  appointment,
  activeClinicId,
  user,
  canEditConsultation,
  autoSaveReady,
}: UseConsultationAutoSaveParams): UseConsultationAutoSaveReturn => {
  const queryClient = useQueryClient();
  const previousValuesRef = useRef<ConsultationFormValues>();
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    previousValuesRef.current = form.getValues();
  }, []);

  const setBaseline = useCallback((values: ConsultationFormValues) => {
    previousValuesRef.current = values;
  }, []);

  const autoSaveMutation = useMutation({
    mutationFn: (data: ConsultationFormValues) => {
      if (!appointmentId || !activeClinicId || !appointment) {
        throw new Error('Missing required data');
      }

      const prescriptions = data.specialty_data.prescriptions as Array<{ name?: string; [key: string]: unknown }> | undefined;

      return saveConsultation({
        appointmentId,
        patientId: appointment.patient_id || '',
        doctorId: appointment.doctor_id || user?.id || '',
        clinicId: activeClinicId,
        specialtyData: data.specialty_data,
        prescriptions,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation-data', appointmentId, activeClinicId] });
      queryClient.invalidateQueries({ queryKey: ['consultation', appointmentId] });
    },
    onError: (error) => {
      logger.error('Auto-save error:', error);
      toast.error('Save failed', {
        description: 'Could not save consultation notes. Please try again.',
      });
    },
  });

  useEffect(() => {
    if (!canEditConsultation || !autoSaveReady) return;
    if (isDeepEqual(previousValuesRef.current, formValues)) return;

    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);

    autoSaveTimeoutRef.current = setTimeout(() => {
      const currentValues = form.getValues();
      if (
        Object.keys(currentValues.specialty_data).length > 0 &&
        !isDeepEqual(previousValuesRef.current, currentValues)
      ) {
        previousValuesRef.current = currentValues;
        autoSaveMutation.mutate(currentValues);
      }
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [formValues, canEditConsultation, autoSaveReady]);

  const handleSave = useCallback(() => {
    if (!canEditConsultation) {
      toast.error('Cannot Save', {
        description: 'You do not have permission to edit this consultation.',
      });
      return;
    }
    autoSaveMutation.mutate(form.getValues());
  }, [form, autoSaveMutation, canEditConsultation]);

  return { autoSaveMutation, handleSave, setBaseline };
};
