"use client";
import { logger } from "@/lib/logger";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ConsultationFormValues } from "@/types/consultation";
import type { DbAppointment, DbConsultationBase } from "@/types/core";
import type { UseFormReturn } from "react-hook-form";
import type { ClinicMemberWithClinic } from "@/types/core";

import { completeConsultation } from "@/actions/consultations";
import type { AutoSaveResult } from "./useConsultationAutoSave";

const isDev = process.env.NODE_ENV === "development";

export interface UseConsultationCompletionParams {
  appointmentId: string | undefined;
  appointment: DbAppointment | null | undefined;
  activeClinicId: string | undefined;
  canEditConsultation: boolean;
  form: UseFormReturn<ConsultationFormValues>;
  autoSaveMutation: UseMutationResult<AutoSaveResult, Error, ConsultationFormValues>;
  validateMandatoryFields: () => string[];
}

export interface UseConsultationCompletionReturn {
  isConsultationCompleted: boolean;
  justCompleted: boolean;
  handleCompleteConsultation: () => Promise<void>;
}

export const useConsultationCompletion = ({
  appointmentId,
  appointment,
  activeClinicId,
  canEditConsultation,
  form,
  autoSaveMutation,
  validateMandatoryFields,
}: UseConsultationCompletionParams): UseConsultationCompletionReturn => {
  const queryClient = useQueryClient();
  const [isConsultationCompleted, setIsConsultationCompleted] = useState(
    appointment?.status === 'Completed'
  );
  const [justCompleted, setJustCompleted] = useState(false);
  const isCompletingRef = useRef(false);
  const isEditingCompletedRef = useRef(false);

  const isConsultationCompletedRef = useRef(isConsultationCompleted);
  isConsultationCompletedRef.current = isConsultationCompleted;
  const canEditConsultationRef = useRef(canEditConsultation);
  canEditConsultationRef.current = canEditConsultation;

  useEffect(() => {
    if (appointment?.status) {
      setIsConsultationCompleted(appointment.status === 'Completed');
    }
  }, [appointment?.status]);

  useEffect(() => {
    const completing = isCompletingRef.current;
    const editing = isEditingCompletedRef.current;
    if (isDev) logger.log('Reset effect:', { isConsultationCompleted, canEditConsultation, justCompleted, completing, editing });

    if (isConsultationCompleted && canEditConsultation && justCompleted && !completing && !editing) {
      if (appointment?.status === 'Completed') {
        if (isDev) logger.log('Resetting justCompleted - editing existing completed consultation');
        setJustCompleted(false);
      }
    }
    if (completing) setTimeout(() => { isCompletingRef.current = false; }, 1000);
    if (editing) setTimeout(() => { isEditingCompletedRef.current = false; }, 3000);
  }, [isConsultationCompleted, canEditConsultation, justCompleted, appointment?.status]);

  const handleCompleteConsultation = useCallback(async () => {
    if (!appointmentId || appointmentId.trim() === '') {
      logger.error('Invalid appointment ID:', appointmentId);
      toast.error('Invalid Appointment', {
        description: 'Cannot complete consultation with invalid appointment ID.',
      });
      return;
    }

    if (!activeClinicId) {
      toast.error('No Clinic', {
        description: 'Cannot complete consultation without an active clinic.',
      });
      return;
    }

    // Editing a completed consultation — save and redirect
    if (isConsultationCompletedRef.current && canEditConsultationRef.current) {
      try {
        if (isDev) logger.log('Editing completed consultation - saving and redirecting');
        await autoSaveMutation.mutateAsync(form.getValues());
        isEditingCompletedRef.current = true;
        setJustCompleted(true);
        toast.success('Notes Updated', {
          description: 'Your consultation notes have been updated successfully.',
        });
        return;
      } catch (error) {
        logger.error('Error updating consultation notes:', error);
        isEditingCompletedRef.current = false;
        toast.error('Update Failed', {
          description: 'Could not update consultation notes. Please try again.',
        });
        return;
      }
    }

    // Already completed and cannot edit
    if (isConsultationCompletedRef.current) {
      toast.error('Already Completed', {
        description: 'This consultation has already been completed.',
      });
      return;
    }

    // Validate mandatory fields
    const validationErrors = validateMandatoryFields();
    if (validationErrors.length > 0) {
      toast.error('Mandatory Fields Missing', {
        description: `Please complete the following required fields: ${validationErrors.join(', ')}`,
      });
      return;
    }

    try {
      isCompletingRef.current = true;
      await autoSaveMutation.mutateAsync(form.getValues());

      const result = await completeConsultation(appointmentId, activeClinicId);

      if (result.error) {
        toast.error('Completion Failed', {
          description: result.error,
        });
        isCompletingRef.current = false;
        return;
      }

      setIsConsultationCompleted(true);
      setJustCompleted(true);
      if (isDev) logger.log('Consultation completed, appointment status updated');

      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['consultation-data', appointmentId, activeClinicId] });
      queryClient.invalidateQueries({ queryKey: ['clinic-billing-summary', activeClinicId] });
      queryClient.invalidateQueries({ queryKey: ['clinic-credits', activeClinicId] });

      toast.success('Consultation Completed', {
        description: 'The consultation has been marked as complete.',
      });
    } catch (error) {
      logger.error('Error completing consultation:', error);
      isCompletingRef.current = false;
      toast.error('Completion Failed', {
        description: 'Could not complete the consultation. Please try again.',
      });
    }
  }, [
    appointmentId,
    activeClinicId,
    autoSaveMutation,
    validateMandatoryFields,
    form,
    queryClient,
  ]);

  return { isConsultationCompleted, justCompleted, handleCompleteConsultation };
};
