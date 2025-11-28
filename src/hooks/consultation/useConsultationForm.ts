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
import { isEqual } from 'lodash-es';

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

  // Check if current user is the assigned doctor
  const isAssignedDoctor = useMemo(() => {
    // If appointment has no doctor assigned, return false
    if (!appointment?.doctor_id || !user?.id) {
      console.log('🔍 isAssignedDoctor debug: No doctor assigned or no user');
      return false;
    }

    // Check if the current user owns the doctor profile assigned to this appointment
    const result = assignedDoctor?.user_id === user.id;

    console.log('🔍 isAssignedDoctor debug:',
      'appointmentDoctorId:', appointment?.doctor_id,
      'currentUserId:', user?.id,
      'assignedDoctorUserId:', assignedDoctor?.user_id,
      'isAssignedDoctor:', result
    );
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
  useEffect(() => {
    if (isConsultationCompleted && canEditConsultation && justCompleted) {
      // User is editing a completed consultation - reset the redirect state
      setJustCompleted(false);
    }
  }, [isConsultationCompleted, canEditConsultation, justCompleted]);

  // Keep consultation completion state synchronized with appointment status
  useEffect(() => {
    if (appointment?.status) {
      setIsConsultationCompleted(appointment.status === 'Completed');
    }
  }, [appointment?.status]);

  // Fixed auto-save mutation
  const autoSaveMutation = useMutation({
    mutationFn: async (data: ConsultationFormValues) => {
      console.log('🚀 Auto-save mutation started:', data);

      if (!appointmentId || !activeClinic?.clinics?.id || !appointment) {
        console.error('❌ Auto-save failed: Missing required data', {
          appointmentId,
          clinicId: activeClinic?.clinics?.id,
          appointment
        });
        throw new Error('Missing required data');
      }

      const consultationData = {
        appointment_id: appointmentId,
        patient_id: appointment?.patient_id || '',
        doctor_id: appointment?.doctor_id || user?.id || '',
        clinic_id: activeClinic.clinics?.id,
        specialty_data: data.specialty_data,
      };

      console.log('📝 Auto-save consultation data:', consultationData);

      // Try to update existing consultation first
      const { data: updateResult, error: updateError } = await supabase
        .from('consultations')
        .update(consultationData)
        .eq('appointment_id', appointmentId)
        .select();

      console.log('🔄 Auto-save update result:', { updateResult, updateError });

      let result;

      // If no rows were updated (consultation doesn't exist), insert new one
      if (!updateError && updateResult && updateResult.length === 0) {
        console.log('➕ Auto-save: No existing consultation, inserting new one');
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
        console.log('✅ Auto-save: Existing consultation updated');
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
          console.log('💊 Auto-save: Syncing prescriptions:', validPrescriptions);
          // Prepare prescriptions data for upsert
          const prescriptionsData = validPrescriptions.map((med: PrescriptionMedication) => ({
            consultation_id: result.id,
            patient_id: appointment?.patient_id || '',
            doctor_id: appointment?.doctor_id || user?.id || '',
            clinic_id: activeClinic.clinics?.id || '',
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
          console.log('🗑️ Auto-save: No valid prescriptions, deleting existing ones');
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

      console.log('✅ Auto-save mutation completed successfully');
      return result;
    },
    onSuccess: () => {
      console.log('🎉 Auto-save onSuccess: Invalidating queries');
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
    console.log('🔍 Auto-save effect triggered:', {
      canEditConsultation,
      formValues,
      previousValues: previousValuesRef.current,
      isEqual: isEqual(previousValuesRef.current, formValues),
      isInitializing: isInitializingRef.current,
      hasFormInitialized: hasFormInitializedRef.current
    });

    if (!canEditConsultation) {
      console.log('❌ Auto-save skipped: cannot edit consultation');
      return; // Don't auto-save if editing is not allowed
    }

    // Skip if we're still initializing or form hasn't initialized
    if (isInitializingRef.current || !hasFormInitializedRef.current) {
      console.log('⏭️ Auto-save skipped: still initializing');
      return;
    }

    // Skip if values haven't changed
    if (isEqual(previousValuesRef.current, formValues)) {
      console.log('⏭️ Auto-save skipped: values unchanged');
      return;
    }

    // Clear any existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    console.log('⏰ Auto-save scheduled in 2 seconds');
    // Set new timeout for auto-save
    autoSaveTimeoutRef.current = setTimeout(() => {
      const currentValues = form.getValues();

      // Only save if we have actual data and it's different from previous save
      if (
        Object.keys(currentValues.specialty_data).length > 0 &&
        !isEqual(previousValuesRef.current, currentValues)
      ) {
        console.log('💾 Auto-save triggered with data:', currentValues);
        previousValuesRef.current = currentValues;
        autoSaveMutation.mutate(currentValues);
      } else {
        console.log('⏭️ Auto-save skipped: no data or unchanged');
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
    // If consultation is already completed and user can edit, allow saving changes
    if (isConsultationCompleted && canEditConsultation) {
      try {
        const formValues = form.getValues();
        await autoSaveMutation.mutateAsync(formValues);
        toast({
          title: 'Notes Updated',
          description: 'Your consultation notes have been updated successfully.',
        });
        return;
      } catch (error) {
        console.error('Error updating consultation notes:', error);
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
    const formValues = form.getValues();
    await autoSaveMutation.mutateAsync(formValues);
    
    // Update appointment status to completed
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'Completed' })
      .eq('id', appointmentId as string);

    if (error) throw error;
    
    setIsConsultationCompleted(true);
    setJustCompleted(true);
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    toast({
      title: 'Consultation Completed',
      description: 'The consultation has been marked as complete.',
    });

    // Just set the completion flag - parent component handles navigation
    } catch (error) {
       console.error('Error completing consultation:', error);
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