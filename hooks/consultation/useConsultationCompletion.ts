"use client";
import { logger } from "@/lib/logger";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ConsultationFormValues } from "@/types/consultation";
import type { DbAppointment, DbConsultationBase } from "@/types/core";
import type { UseFormReturn } from "react-hook-form";
import type { ClinicMemberWithClinic } from "@/hooks/useClinicData";

const supabase = getSupabase();
const isDev = process.env.NODE_ENV === "development";

type CreditDeductionResult = 'success' | 'failed' | 'insufficient' | 'no_clinic';

async function finalizeAppointment(
  appointmentId: string,
  clinicId: string | undefined,
): Promise<{ creditResult: CreditDeductionResult }> {
  if (isDev) logger.log('Updating appointment status to "Completed" for:', appointmentId);

  const { error: appointmentError } = await supabase
    .from('appointments')
    .update({ status: 'Completed' })
    .eq('id', appointmentId);

  if (appointmentError) {
    logger.error('Error updating appointment status:', appointmentError);
    throw appointmentError;
  }

  if (!clinicId) {
    logger.warn('Cannot deduct credits: No active clinic found');
    return { creditResult: 'no_clinic' };
  }

  if (isDev) logger.log('Deducting consultation credit');
  const { data: deductResult, error: deductError } = await supabase
    .rpc('deduct_appointment_credit', {
      appointment_id_param: appointmentId,
      clinic_id_param: clinicId,
      credits_to_deduct: 1
    });

  if (deductError) {
    logger.error('Error deducting appointment credit:', deductError);
    return { creditResult: 'failed' };
  }
  if (deductResult !== true) {
    logger.warn('Credit deduction returned false - clinic may have insufficient credits');
    return { creditResult: 'insufficient' };
  }
  return { creditResult: 'success' };
}

export interface UseConsultationCompletionParams {
  appointmentId: string | undefined;
  appointment: DbAppointment | null | undefined;
  activeClinic: ClinicMemberWithClinic | null;
  canEditConsultation: boolean;
  form: UseFormReturn<ConsultationFormValues>;
  autoSaveMutation: UseMutationResult<DbConsultationBase, Error, ConsultationFormValues>;
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
  activeClinic,
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

  // Sync completion state with appointment status
  useEffect(() => {
    if (appointment?.status) {
      setIsConsultationCompleted(appointment.status === 'Completed');
    }
  }, [appointment?.status]);

  // Reset justCompleted when editing a previously completed consultation
  useEffect(() => {
    const completing = isCompletingRef.current;
    const editing = isEditingCompletedRef.current;
    if (isDev) logger.log('🔄 Reset effect:', { isConsultationCompleted, canEditConsultation, justCompleted, completing, editing });

    if (isConsultationCompleted && canEditConsultation && justCompleted && !completing && !editing) {
      if (appointment?.status === 'Completed') {
        if (isDev) logger.log('🔄 Resetting justCompleted - editing existing completed consultation');
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

    // Editing a completed consultation — save and redirect
    if (isConsultationCompletedRef.current && canEditConsultationRef.current) {
      try {
        if (isDev) logger.log('🔄 Editing completed consultation - saving and redirecting');
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

      const { creditResult } = await finalizeAppointment(appointmentId, activeClinic?.clinic_id);

      if (creditResult === 'failed') {
        toast('Consultation Completed', {
          description: 'Consultation marked as complete, but credit deduction failed. Please check billing.',
        });
      } else if (creditResult === 'insufficient') {
        toast('Consultation Completed', {
          description: 'Consultation marked as complete, but clinic has insufficient credits for billing.',
        });
      }

      setIsConsultationCompleted(true);
      setJustCompleted(true);
      if (isDev) logger.log('✅ Consultation completed, appointment status updated');

      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['consultation-data', appointmentId, activeClinic?.clinic_id] });
      queryClient.invalidateQueries({ queryKey: ['clinic-billing-summary', activeClinic?.clinic_id] });
      queryClient.invalidateQueries({ queryKey: ['clinic-credits', activeClinic?.clinic_id] });

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
    autoSaveMutation,
    validateMandatoryFields,
    form,
    queryClient,
    activeClinic,
  ]);

  return { isConsultationCompleted, justCompleted, handleCompleteConsultation };
};
