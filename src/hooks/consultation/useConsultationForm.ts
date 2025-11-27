import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ConsultationFormValues, PrescriptionMedication } from '@/components/consultation/types';
import { Tables, Json } from '@/integrations/supabase/types';
import { consultationNotesSchema, getMandatoryFieldsForDepartment } from '@/lib/consultationNotesSchemas';
import { isEqual } from 'lodash-es';

export const useConsultationForm = (
  appointmentId: string | undefined,
  appointment: Tables<'appointments'> | null | undefined,
  existingConsultation: Tables<'consultations'> | null | undefined,
  onConsultationCompleted?: () => void,
  departmentType?: string
) => {
  const { user, activeClinic, hasDoctorProfile } = useAuth();
  const queryClient = useQueryClient();
  const supabase = getSupabase();
  const previousValuesRef = useRef<ConsultationFormValues>();
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

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

  // Store initial values
  useEffect(() => {
    previousValuesRef.current = defaultValues;
  }, [defaultValues]);

  // Reset form when existing consultation data becomes available
  useEffect(() => {
    if (existingConsultation?.specialty_data) {
      // Reset form with the loaded consultation data
      form.reset({
        specialty_data: existingConsultation.specialty_data as z.infer<typeof consultationNotesSchema>,
      });
      // Update the previous values reference
      previousValuesRef.current = {
        specialty_data: existingConsultation.specialty_data as z.infer<typeof consultationNotesSchema>,
      };
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
      if (!appointmentId || !activeClinic?.clinics?.id || !appointment) throw new Error('Missing required data');
      
      const consultationData = {
        appointment_id: appointmentId,
        patient_id: appointment?.patient_id || '',
        doctor_id: appointment?.doctor_id || user?.id || '',
        clinic_id: activeClinic.clinics?.id,
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
        
        if (insertResult.error) throw insertResult.error;
        result = insertResult.data;
      } else if (updateError) {
        throw updateError;
      } else if (updateResult && updateResult.length > 0) {
        result = updateResult[0];
      } else {
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

          if (prescError) throw prescError;
        } else {
          // If no valid prescriptions, delete existing ones for this consultation
          const { error: deleteError } = await supabase
            .from('prescriptions')
            .delete()
            .eq('consultation_id', result.id);

          if (deleteError) throw deleteError;
        }
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation', appointmentId] });
      toast({
        title: 'Consultation saved',
        description: 'Your consultation notes have been saved successfully.',
      });
    },
    onError: (error) => {
      console.error('Auto-save error:', error);
      toast({
        title: 'Save failed',
        description: 'Could not save consultation notes. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Auto-save with debounce and deep comparison
  useEffect(() => {
    if (!canEditConsultation) return; // Don't auto-save if editing is not allowed
    
    // Clear any existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Skip if values haven't changed
    if (isEqual(previousValuesRef.current, formValues)) {
      return;
    }

    // Set new timeout for auto-save
    autoSaveTimeoutRef.current = setTimeout(() => {
      const currentValues = form.getValues();
      
      // Only save if we have actual data and it's different from previous save
      if (
        Object.keys(currentValues.specialty_data).length > 0 && 
        !isEqual(previousValuesRef.current, currentValues)
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
  }, [formValues, isConsultationCompleted, autoSaveMutation, form, canEditConsultation]);

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
      const fieldValue = specialtyData?.[fieldName];
      
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
    return {
      isValid: errors.length === 0,
      errors,
      missingFields: errors.length,
      validationMessage: errors.length > 0 
        ? `Missing required fields: ${errors.join(', ')}`
        : 'All required fields completed'
    };
  }, [validateMandatoryFields]);

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

    // Set timeout for redirect
    setTimeout(() => {
      if (onConsultationCompleted) {
        onConsultationCompleted();
      }
    }, 3000);
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
    queryClient,
    onConsultationCompleted
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