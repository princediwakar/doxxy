"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UseMutationResult } from "@tanstack/react-query";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import type { ConsultationFormValues } from "@/types/consultation";
import type { DbAppointment, DbConsultationBase } from "@/types/core";
import { consultationNotesSchema } from "@/lib/consultationNotesSchemas";

import { useConsultationPermissions } from "./useConsultationPermissions";
import { useConsultationAutoSave } from "./useConsultationAutoSave";
import { useConsultationValidation } from "./useConsultationValidation";
import { useConsultationCompletion } from "./useConsultationCompletion";

export interface UseConsultationFormParams {
  appointmentId: string | undefined;
  appointment: DbAppointment | null | undefined;
  existingConsultation: DbConsultationBase | null | undefined;
  departmentType?: string;
}

export interface UseConsultationFormReturn {
  form: ReturnType<typeof useForm<ConsultationFormValues>>;
  isConsultationCompleted: boolean;
  canEditConsultation: boolean;
  autoSaveMutation: UseMutationResult<DbConsultationBase, Error, ConsultationFormValues>;
  handleSave: () => void;
  handleCompleteConsultation: () => Promise<void>;
  validateMandatoryFields: () => string[];
  getMandatoryFieldsStatus: () => {
    completed: number;
    total: number;
    allCompleted: boolean;
    isValid: boolean;
    errors: string[];
    missingFields: number;
    validationMessage: string;
  };
  mandatoryFieldsStatus: {
    completed: number;
    total: number;
    allCompleted: boolean;
    isValid: boolean;
    errors: string[];
    missingFields: number;
    validationMessage: string;
  };
  justCompleted: boolean;
}

export const useConsultationForm = ({
  appointmentId,
  appointment,
  existingConsultation,
  departmentType,
}: UseConsultationFormParams): UseConsultationFormReturn => {
  const { user, activeClinic } = useAuth();

  // 1. Permission checking
  const { canEditConsultation } = useConsultationPermissions({ appointment });

  // 2. Form setup
  const defaultValues: ConsultationFormValues = useMemo(
    () => ({
      specialty_data: (existingConsultation?.specialty_data as z.infer<typeof consultationNotesSchema>) || {},
    }),
    [existingConsultation?.specialty_data]
  );

  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(
      z.object({
        specialty_data: consultationNotesSchema,
      })
    ),
    defaultValues,
  });

  const formValues = useWatch({
    control: form.control,
  }) as ConsultationFormValues;

  // 3. Auto-save readiness
  const [autoSaveReady, setAutoSaveReady] = useState(false);

  // 4. Auto-save mutation + debounce
  const { autoSaveMutation, handleSave, setBaseline } = useConsultationAutoSave({
    form,
    formValues,
    appointmentId,
    appointment,
    activeClinic,
    user,
    canEditConsultation,
    autoSaveReady,
  });

  // 5. Mandatory field validation
  const { validateMandatoryFields, getMandatoryFieldsStatus, mandatoryFieldsStatus } =
    useConsultationValidation({ form, departmentType });

  // 6. Completion logic
  const { isConsultationCompleted, justCompleted, handleCompleteConsultation } =
    useConsultationCompletion({
      appointmentId,
      appointment,
      activeClinic,
      canEditConsultation,
      form,
      autoSaveMutation,
      validateMandatoryFields,
    });

  // Effect: sync form baseline and manage auto-save readiness
  useEffect(() => {
    setAutoSaveReady(false);

    if (existingConsultation?.specialty_data) {
      const data = existingConsultation.specialty_data as z.infer<typeof consultationNotesSchema>;
      form.reset({ specialty_data: data });
      setBaseline({ specialty_data: data });
    } else {
      setBaseline(defaultValues);
    }

    const timer = setTimeout(() => setAutoSaveReady(true), 100);
    return () => clearTimeout(timer);
  }, [existingConsultation?.specialty_data, defaultValues, form, setBaseline]);

  return {
    form,
    isConsultationCompleted,
    canEditConsultation,
    autoSaveMutation,
    handleSave,
    handleCompleteConsultation,
    validateMandatoryFields,
    getMandatoryFieldsStatus,
    mandatoryFieldsStatus,
    justCompleted,
  };
};
