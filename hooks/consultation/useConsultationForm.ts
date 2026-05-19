"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UseMutationResult } from "@tanstack/react-query";
import { z } from "zod";
import { useAppState } from "@/contexts/AppStateContext";
import type { ConsultationFormValues } from "@/types/consultation";
import type { DbAppointment, DbConsultationBase } from "@/types/core";

import { useConsultationPermissions } from "./useConsultationPermissions";
import { useConsultationAutoSave } from "./useConsultationAutoSave";
import { useConsultationValidation } from "./useConsultationValidation";
import { useConsultationCompletion } from "./useConsultationCompletion";
import { isDeepEqual } from "./utils";

export interface UseConsultationFormParams {
  appointmentId: string | undefined;
  appointment: DbAppointment | null | undefined;
  existingConsultation: DbConsultationBase | null | undefined;
  departmentType?: string;
  canEditConsultation?: boolean;
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
  resetForm: () => void;
  isFormDirty: boolean;
}

export const useConsultationForm = ({
  appointmentId,
  appointment,
  existingConsultation,
  departmentType,
  canEditConsultation: canEditConsultationOverride,
}: UseConsultationFormParams): UseConsultationFormReturn => {
  const { user, activeClinicId } = useAppState();

  // 1. Permission checking — use override when provided, otherwise compute
  const { canEditConsultation } =
    canEditConsultationOverride !== undefined
      ? { canEditConsultation: canEditConsultationOverride }
      : useConsultationPermissions({ appointment });

  // 2. Form setup
  const defaultValues: ConsultationFormValues = useMemo(
    () => ({
      specialty_data: (existingConsultation?.specialty_data as Record<string, unknown>) || {},
    }),
    [existingConsultation?.specialty_data]
  );

  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(
      z.object({
        specialty_data: z.record(z.string(), z.unknown()),
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
    activeClinicId,
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
      activeClinicId,
      canEditConsultation,
      form,
      autoSaveMutation,
      validateMandatoryFields,
    });

  // Snapshot initial DB values for reset/discard
  const initialValuesRef = useRef<ConsultationFormValues>(defaultValues);

  const isFormDirty = !isDeepEqual(initialValuesRef.current, formValues);

  const resetForm = useCallback(() => {
    form.reset(initialValuesRef.current);
    setBaseline(initialValuesRef.current);
  }, [form, setBaseline]);

  // Effect: sync form baseline and manage auto-save readiness
  useEffect(() => {
    setAutoSaveReady(false);

    if (existingConsultation?.specialty_data) {
      const data = existingConsultation.specialty_data as Record<string, unknown>;
      form.reset({ specialty_data: data });
      setBaseline({ specialty_data: data });
    } else {
      form.reset(defaultValues);
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
    resetForm,
    isFormDirty,
  };
};
