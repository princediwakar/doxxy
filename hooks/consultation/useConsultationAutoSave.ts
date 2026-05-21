"use client";
import { logger } from "@/lib/logger";

import { useEffect, useCallback, useRef } from "react";
import { useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ConsultationFormValues } from "@/types/consultation";
import type { DbAppointment, DbConsultationBase, DbJson } from "@/types/core";
import type { UseFormReturn } from "react-hook-form";
import type { ClinicMemberWithClinic } from "@/types/core";
import type { AppUser } from "@/types/core";

import { isDeepEqual } from "./utils";

const supabase = getSupabase();

async function saveConsultation(
  data: ConsultationFormValues,
  appointmentId: string | undefined,
  clinicId: string | undefined,
  appointment: DbAppointment | null | undefined,
  userId: string | undefined,
): Promise<DbConsultationBase> {
  if (!appointmentId || !clinicId || !appointment) {
    logger.error('❌ Auto-save failed: Missing required data', {
      appointmentId, clinicId, appointment
    });
    throw new Error('Missing required data');
  }

  const consultationData = {
    appointment_id: appointmentId,
    patient_id: appointment.patient_id || '',
    doctor_id: appointment.doctor_id || userId || '',
    clinic_id: clinicId,
    specialty_data: data.specialty_data as DbJson,
  };

  const { data: updateResult, error: updateError } = await supabase
    .from('consultations')
    .update(consultationData)
    .eq('appointment_id', appointmentId)
    .select();

  let result: DbConsultationBase;

  if (!updateError && updateResult && updateResult.length === 0) {
    const insertResult = await supabase
      .from('consultations')
      .insert(consultationData)
      .select()
      .single();

    if (insertResult.error) {
      logger.error('❌ Auto-save insert error:', insertResult.error);
      throw insertResult.error;
    }
    result = insertResult.data;
  } else if (updateError) {
    logger.error('❌ Auto-save update error:', updateError);
    throw updateError;
  } else if (updateResult && updateResult.length > 0) {
    result = updateResult[0];
  } else {
    logger.error('❌ Auto-save: Unexpected response from consultation update');
    throw new Error('Unexpected response from consultation update');
  }

  if (data.specialty_data.prescriptions != null) {
    const prescriptions = data.specialty_data.prescriptions as Array<{ name?: string; [key: string]: unknown }>;
    const validPrescriptions = prescriptions.filter(
      (med) => med.name && med.name.trim().length > 0
    );

    if (validPrescriptions.length > 0) {
      const prescriptionData = {
        consultation_id: result.id,
        patient_id: appointment.patient_id || '',
        doctor_id: appointment.doctor_id || userId || '',
        clinic_id: clinicId || '',
        medications: validPrescriptions as unknown as DbJson,
      };

      const { error: prescError } = await supabase
        .from('prescriptions')
        .upsert(prescriptionData, {
          onConflict: 'consultation_id,patient_id,doctor_id',
          ignoreDuplicates: false
        });

      if (prescError) {
        logger.error('❌ Auto-save prescription upsert error:', prescError);
        throw prescError;
      }
    } else {
      const { error: deleteError } = await supabase
        .from('prescriptions')
        .delete()
        .eq('consultation_id', result.id);

      if (deleteError) {
        logger.error('❌ Auto-save prescription delete error:', deleteError);
        throw deleteError;
      }
    }
  }

  return result;
}

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
  autoSaveMutation: UseMutationResult<DbConsultationBase, Error, ConsultationFormValues>;
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
    mutationFn: (data: ConsultationFormValues) =>
      saveConsultation(
        data,
        appointmentId,
        activeClinicId,
        appointment,
        user?.id,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation-data', appointmentId, activeClinicId] });
      queryClient.invalidateQueries({ queryKey: ['consultation', appointmentId] });
    },
    onError: (error) => {
      logger.error('❌ Auto-save error:', error);
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
