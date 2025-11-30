import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ConsultationFormValues, PrescriptionMedication } from '@/types/consultation';
import { Tables, Json } from '@/integrations/supabase/types';
import { consultationNotesSchema, getMandatoryFieldsForDepartment } from '@/lib/consultationNotesSchemas';
// Custom deep comparison function to replace lodash-es isEqual
const isDeepEqual = <T>(a: T, b: T): boolean => {
  if (a === b) return true;

  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key) || !isDeepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
      return false;
    }
  }

  return true;
};

export interface UseConsultationFormParams {
  appointmentId: string | undefined;
  appointment: Tables<'appointments'> | null | undefined;
  existingConsultation: Tables<'consultations'> | null | undefined;
  departmentType?: string;
}

export interface UseConsultationFormReturn {
  form: ReturnType<typeof useForm<ConsultationFormValues>>;
  isConsultationCompleted: boolean;
  canEditConsultation: boolean;
  autoSaveMutation: UseMutationResult<Tables<'consultations'>, Error, ConsultationFormValues, unknown>;
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
  departmentType
}: UseConsultationFormParams): UseConsultationFormReturn => {
  const { user, activeClinic, hasDoctorProfile } = useAuth();
  const queryClient = useQueryClient();
  const supabase = getSupabase();
  const previousValuesRef = useRef<ConsultationFormValues>();
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const isInitializingRef = useRef(true);
  const hasFormInitializedRef = useRef(false);

  // Fetch the assigned doctor data to check if current user owns the doctor profile
  const { data: assignedDoctor } = useQuery({
    queryKey: ['assigned-doctor', appointment?.doctor_id],
    queryFn: async () => {
      if (!appointment?.doctor_id) return null;

      const { data, error } = await supabase
        .from('doctors')
        .select('id, user_id, name, email')
        .eq('id', appointment.doctor_id)
        .single();

      if (error) {
        console.error('Error fetching assigned doctor:', error);
        return null;
      }

      return data;
    },
    enabled: !!appointment?.doctor_id,
  });
  
  // Consultation completion state
  const [isConsultationCompleted, setIsConsultationCompleted] = useState(
    appointment?.status === 'Completed'
  );

  // Track if consultation was just completed (for redirect)
  const [justCompleted, setJustCompleted] = useState(false);
  const isCompletingRef = useRef(false);
  const isEditingCompletedRef = useRef(false);

  // Check if current user is the assigned doctor
  const isAssignedDoctor = useMemo(() => {
    // If appointment has no doctor assigned, return false
    if (!appointment?.doctor_id || !user?.id) {
      return false;
    }

    // Check if the current user owns the doctor profile assigned to this appointment
    const result = assignedDoctor?.user_id === user.id;

    return result;
  }, [appointment?.doctor_id, user?.id, assignedDoctor?.user_id]);

  // Allow editing if user is the assigned doctor OR
  // if user is a superadmin with doctor profile in this clinic
  const canEditConsultation = useMemo(() => {
    // Always allow editing for assigned doctors
    if (isAssignedDoctor) {
      console.log('✅ canEditConsultation: true (isAssignedDoctor)');
      return true;
    }

    // For superadmins, check if they have a doctor profile in this clinic
    if (activeClinic?.role === 'superadmin' && hasDoctorProfile && user?.id) {
      console.log('✅ canEditConsultation: true (superadmin with doctor profile)');
      return true;
    }

    console.log('❌ canEditConsultation: false',
      'isAssignedDoctor:', isAssignedDoctor,
      'activeClinicRole:', activeClinic?.role,
      'hasDoctorProfile:', hasDoctorProfile,
      'userId:', user?.id
    );
    return false;
  }, [isAssignedDoctor, activeClinic?.role, hasDoctorProfile, user?.id]);
  
  // Initialize form with existing data
  const defaultValues: ConsultationFormValues = useMemo(() => ({
    specialty_data: (existingConsultation?.specialty_data as z.infer<typeof consultationNotesSchema>) || {},
  }), [existingConsultation?.specialty_data]);

  // Initialize form
  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(z.object({
      specialty_data: consultationNotesSchema,
    })),
    defaultValues,
  });

  // Store initial values and enable autosave after first render
  useEffect(() => {
    previousValuesRef.current = defaultValues;

    // Enable autosave after the first render cycle
    setTimeout(() => {
      hasFormInitializedRef.current = true;
      isInitializingRef.current = false;
    }, 100);
  }, [defaultValues]);

  // Reset form when existing consultation data becomes available
  useEffect(() => {
    if (existingConsultation?.specialty_data) {
      // Prevent autosave during form reset
      isInitializingRef.current = true;

      // Reset form with the loaded consultation data
      form.reset({
        specialty_data: existingConsultation.specialty_data as z.infer<typeof consultationNotesSchema>,
      });
      // Update the previous values reference
      previousValuesRef.current = {
        specialty_data: existingConsultation.specialty_data as z.infer<typeof consultationNotesSchema>,
      };

      // Re-enable autosave after a short delay
      setTimeout(() => {
        isInitializingRef.current = false;
      }, 100);
    }
  }, [existingConsultation?.specialty_data, form]);

  // Watch all form values
  const formValues = useWatch({
    control: form.control,
  });

  // Reset justCompleted state when user starts editing a completed consultation
  // Only reset if the consultation was already completed before this session
  useEffect(() => {
    console.log('🔄 Reset effect - isConsultationCompleted:', isConsultationCompleted, 'canEditConsultation:', canEditConsultation, 'justCompleted:', justCompleted, 'isCompletingRef:', isCompletingRef.current, 'isEditingCompletedRef:', isEditingCompletedRef.current);

    // Don't reset if we're currently editing a completed consultation and want to redirect
    if (isConsultationCompleted && canEditConsultation && justCompleted && !isCompletingRef.current && !isEditingCompletedRef.current) {
      // Check if this consultation was already completed when we loaded the page
      // If appointment was already 'Completed' on load, then this is an edit session
      const wasAlreadyCompleted = appointment?.status === 'Completed';
      console.log('🔄 Reset effect - wasAlreadyCompleted:', wasAlreadyCompleted);
      if (wasAlreadyCompleted) {
        console.log('🔄 Resetting justCompleted - editing existing completed consultation');
        setJustCompleted(false);
      }
    }
    // Reset the completion flag after the effect runs
    if (isCompletingRef.current) {
      console.log('🔄 Reset effect - isCompletingRef is true, will reset in 1 second');
      setTimeout(() => {
        console.log('🔄 Reset effect - setting isCompletingRef to false');
        isCompletingRef.current = false;
      }, 1000);
    }
    // Reset the editing completed flag after navigation
    if (isEditingCompletedRef.current) {
      console.log('🔄 Reset effect - isEditingCompletedRef is true, will reset in 3 seconds');
      setTimeout(() => {
        console.log('🔄 Reset effect - setting isEditingCompletedRef to false');
        isEditingCompletedRef.current = false;
      }, 3000);
    }
  }, [isConsultationCompleted, canEditConsultation, justCompleted, appointment?.status]);

  // Keep consultation completion state synchronized with appointment status
  useEffect(() => {
    if (appointment?.status) {
      setIsConsultationCompleted(appointment.status === 'Completed');
    }
  }, [appointment?.status]);

  // Fixed auto-save mutation
  const autoSaveMutation = useMutation({
    mutationFn: async (data: ConsultationFormValues) => {

      if (!appointmentId || !activeClinic?.clinic_id || !appointment) {
        console.error('❌ Auto-save failed: Missing required data', {
          appointmentId,
          clinicId: activeClinic?.clinic_id,
          appointment
        });
        throw new Error('Missing required data');
      }

      const consultationData = {
        appointment_id: appointmentId,
        patient_id: appointment?.patient_id || '',
        doctor_id: appointment?.doctor_id || user?.id || '',
        clinic_id: activeClinic.clinic_id,
        specialty_data: data.specialty_data,
      };


      // Try to update existing consultation first
      const { data: updateResult, error: updateError } = await supabase
        .from('consultations')
        .update(consultationData)
        .eq('appointment_id', appointmentId)
        .select();


      let result;

      // If no rows were updated (consultation doesn't exist), insert new one
      if (!updateError && updateResult && updateResult.length === 0) {
        const insertResult = await supabase
          .from('consultations')
          .insert(consultationData)
          .select()
          .single();

        if (insertResult.error) {
        console.error('❌ Auto-save insert error:', insertResult.error);
        throw insertResult.error;
      }
        result = insertResult.data;
      } else if (updateError) {
        console.error('❌ Auto-save update error:', updateError);
        throw updateError;
      } else if (updateResult && updateResult.length > 0) {
        result = updateResult[0];
      } else {
        console.error('❌ Auto-save: Unexpected response from consultation update');
        throw new Error('Unexpected response from consultation update');
      }

      // Always sync prescriptions using proper upsert pattern
      if (data.specialty_data.prescriptions !== undefined) {
        // Filter out prescriptions with empty medication names
        const validPrescriptions = data.specialty_data.prescriptions.filter((med: PrescriptionMedication) =>
          med.name && med.name.trim().length > 0
        );

        if (validPrescriptions.length > 0) {
          // Prepare prescriptions data for upsert
          const prescriptionsData = validPrescriptions.map((med: PrescriptionMedication) => ({
            consultation_id: result.id,
            patient_id: appointment?.patient_id || '',
            doctor_id: appointment?.doctor_id || user?.id || '',
            clinic_id: activeClinic.clinic_id || '',
            medications: [med] as unknown as Json,
          }));

          // Use upsert to handle both creation and updates atomically
          const { error: prescError } = await supabase
            .from('prescriptions')
            .upsert(prescriptionsData, {
              onConflict: 'consultation_id,patient_id,doctor_id',
              ignoreDuplicates: false
            });

          if (prescError) {
            console.error('❌ Auto-save prescription upsert error:', prescError);
            throw prescError;
          }
        } else {
          // If no valid prescriptions, delete existing ones for this consultation
          const { error: deleteError } = await supabase
            .from('prescriptions')
            .delete()
            .eq('consultation_id', result.id);

          if (deleteError) {
            console.error('❌ Auto-save prescription delete error:', deleteError);
            throw deleteError;
          }
        }
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation-data', appointmentId, activeClinic?.clinic_id] });
      queryClient.invalidateQueries({ queryKey: ['consultation', appointmentId] });
      toast({
        title: 'Consultation saved',
        description: 'Your consultation notes have been saved successfully.',
      });
    },
    onError: (error) => {
      console.error('❌ Auto-save error:', error);
      toast({
        title: 'Save failed',
        description: 'Could not save consultation notes. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Auto-save with debounce and deep comparison
  useEffect(() => {

    if (!canEditConsultation) {
      return; // Don't auto-save if editing is not allowed
    }

    // Skip if we're still initializing or form hasn't initialized
    if (isInitializingRef.current || !hasFormInitializedRef.current) {
      return;
    }

    // Skip if values haven't changed
    if (isDeepEqual(previousValuesRef.current, formValues)) {
      return;
    }

    // Clear any existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    autoSaveTimeoutRef.current = setTimeout(() => {
      const currentValues = form.getValues();

      // Only save if we have actual data and it's different from previous save
      if (
        Object.keys(currentValues.specialty_data).length > 0 &&
        !isDeepEqual(previousValuesRef.current, currentValues)
      ) {
        previousValuesRef.current = currentValues;
        autoSaveMutation.mutate(currentValues);
      } 
    }, 2000);

    // Cleanup timeout on unmount or next effect
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formValues, canEditConsultation]);

  // Manual save (only if editing is allowed)
  const handleSave = useCallback(() => {
    if (!canEditConsultation) {
      toast({
        title: 'Cannot Save',
        description: 'You do not have permission to edit this consultation.',
        variant: 'destructive',
      });
      return;
    }

    const formValues = form.getValues();
    autoSaveMutation.mutate(formValues);
  }, [form, autoSaveMutation, canEditConsultation]);

  // Validate mandatory fields before completion
  const validateMandatoryFields = useCallback(() => {
    const formValues = form.getValues();
    const specialtyData = formValues.specialty_data;
    
    const errors: string[] = [];
    
    // Get mandatory fields for the current department (fallback to General)
    const currentDepartment = departmentType || 'General';
    const mandatoryFields = getMandatoryFieldsForDepartment(currentDepartment);
    
    // Check each mandatory field
    mandatoryFields.forEach(fieldName => {
      const fieldValue = specialtyData?.[fieldName as keyof typeof specialtyData];
      
      // For prescription fields, check if they have valid medications
      if (fieldName === 'prescriptions') {
        if (!Array.isArray(fieldValue) || fieldValue.length === 0 || 
            !fieldValue.some((med: PrescriptionMedication) => med.name && med.name.trim().length > 0)) {
          errors.push('Prescriptions');
        }
      } else {
        // For text fields, check if they have content
        if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim().length === 0)) {
          // Convert field name to display name
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

  // Real-time validation state for UX feedback
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

  // Watch for real-time validation updates
  const mandatoryFieldsStatus = getMandatoryFieldsStatus();

  // Complete consultation with validation
  const handleCompleteConsultation = useCallback(async () => {
    // Validate appointment ID
    if (!appointmentId || appointmentId.trim() === '') {
      console.error('Invalid appointment ID in handleCompleteConsultation:', appointmentId);
      toast({
        title: 'Invalid Appointment',
        description: 'Cannot complete consultation with invalid appointment ID.',
        variant: 'destructive',
      });
      return;
    }

    // If consultation is already completed and user can edit, allow saving changes and redirect
    if (isConsultationCompleted && canEditConsultation) {
      try {
        console.log('🔄 Editing completed consultation - saving changes and setting up redirect');
        const formValues = form.getValues();
        await autoSaveMutation.mutateAsync(formValues);

        // Set flags to prevent reset and trigger redirect
        isEditingCompletedRef.current = true;
        console.log('🔄 Setting justCompleted to true for editing completed consultation');
        setJustCompleted(true);
        console.log('✅ Editing completed consultation - justCompleted set to true for redirect');

        toast({
          title: 'Notes Updated',
          description: 'Your consultation notes have been updated successfully.',
        });
        return;
      } catch (error) {
        console.error('Error updating consultation notes:', error);
        isEditingCompletedRef.current = false;
        toast({
          title: 'Update Failed',
          description: 'Could not update consultation notes. Please try again.',
          variant: 'destructive',
        });
        return;
      }
    }

    // If consultation is completed but user cannot edit, show error
    if (isConsultationCompleted) {
      toast({
        title: 'Already Completed',
        description: 'This consultation has already been completed.',
        variant: 'destructive',
      });
      return;
    }

    // Validate mandatory fields first
    const validationErrors = validateMandatoryFields();
    if (validationErrors.length > 0) {
      toast({
        title: 'Mandatory Fields Missing',
        description: `Please complete the following required fields: ${validationErrors.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    try {
      isCompletingRef.current = true;
      const formValues = form.getValues();
      await autoSaveMutation.mutateAsync(formValues);

      // Update appointment status to completed
      console.log('handleCompleteConsultation: Updating appointment status to "Completed" for appointment ID:', appointmentId);
      console.log('SQL Query: UPDATE appointments SET status = \'Completed\' WHERE id =', appointmentId);

      const { data: updateResult, error: appointmentError } = await supabase
        .from('appointments')
        .update({ status: 'Completed' })
        .eq('id', appointmentId as string)
        .select();

      if (appointmentError) {
        console.error('Error updating appointment status to "Completed":', appointmentError);
        throw appointmentError;
      }

      console.log('Update result:', updateResult);
      console.log('Successfully updated appointment status to "Completed"');


      setIsConsultationCompleted(true);
      setJustCompleted(true);
      console.log('✅ Consultation completed - justCompleted set to true');
      console.log('✅ Appointment status updated to "Completed"');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['consultation-data', appointmentId, activeClinic?.clinic_id] });

      toast({
        title: 'Consultation Completed',
        description: 'The consultation has been marked as complete.',
      });

      // Just set the completion flag - parent component handles navigation
    } catch (error) {
       console.error('Error completing consultation:', error);
       isCompletingRef.current = false;
       toast({
        title: 'Completion Failed',
        description: 'Could not complete the consultation. Please try again.',
        variant: 'destructive',
       });
    }
  }, [
    isConsultationCompleted,
    canEditConsultation,
    validateMandatoryFields,
    form,
    autoSaveMutation,
    appointmentId,
    supabase,
    queryClient
  ]);

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