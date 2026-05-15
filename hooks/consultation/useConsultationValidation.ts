"use client";

import { useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { ConsultationFormValues } from "@/types/consultation";
import { getMandatoryFieldsForDepartment } from "@/lib/consultationNotesSchemas";

export interface UseConsultationValidationParams {
  form: UseFormReturn<ConsultationFormValues>;
  departmentType?: string;
}

export interface MandatoryFieldsStatus {
  completed: number;
  total: number;
  allCompleted: boolean;
  isValid: boolean;
  errors: string[];
  missingFields: number;
  validationMessage: string;
}

export interface UseConsultationValidationReturn {
  validateMandatoryFields: () => string[];
  getMandatoryFieldsStatus: () => MandatoryFieldsStatus;
  mandatoryFieldsStatus: MandatoryFieldsStatus;
}

export const useConsultationValidation = ({
  form,
  departmentType,
}: UseConsultationValidationParams): UseConsultationValidationReturn => {
  const validateMandatoryFields = useCallback(() => {
    const formValues = form.getValues();
    const specialtyData = formValues.specialty_data;

    const errors: string[] = [];

    const currentDepartment = departmentType || 'General';
    const mandatoryFields = getMandatoryFieldsForDepartment(currentDepartment);

    mandatoryFields.forEach(fieldName => {
      const fieldValue = specialtyData?.[fieldName as keyof typeof specialtyData];

      if (fieldName === 'prescriptions') {
        if (!Array.isArray(fieldValue) || fieldValue.length === 0 ||
            !fieldValue.some((med: { name?: string | null }) => med.name && med.name.trim().length > 0)) {
          errors.push('Prescriptions');
        }
      } else {
        if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim().length === 0)) {
          const displayName = fieldName
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          errors.push(displayName);
        }
      }
    });

    return errors;
  }, [form, departmentType]);

  const getMandatoryFieldsStatus = useCallback(() => {
    const errors = validateMandatoryFields();
    const currentDepartment = departmentType || 'General';
    const mandatoryFields = getMandatoryFieldsForDepartment(currentDepartment);
    const total = mandatoryFields.length;
    const completed = total - errors.length;
    const allCompleted = errors.length === 0;

    return {
      completed,
      total,
      allCompleted,
      isValid: allCompleted,
      errors,
      missingFields: errors.length,
      validationMessage: errors.length > 0
        ? `Missing required fields: ${errors.join(', ')}`
        : 'All required fields completed'
    };
  }, [validateMandatoryFields, departmentType]);

  const mandatoryFieldsStatus = getMandatoryFieldsStatus();

  return {
    validateMandatoryFields,
    getMandatoryFieldsStatus,
    mandatoryFieldsStatus,
  };
};
