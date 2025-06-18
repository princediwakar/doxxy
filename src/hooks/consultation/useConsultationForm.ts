import { useState, useEffect, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { consultationNotesSchema } from '@/lib/consultationNotesSchemas';
import { ConsultationFormValues, Prescription } from '@/components/consultation/types';
import { Tables, Json } from '@/integrations/supabase/types';

export const useConsultationForm = (
  appointmentId: string | undefined,
  appointment: Tables<'appointments'> | null,
  existingConsultation: Tables<'consultations'> | null
) => {
  const { user, activeClinic } = useAuth();
  const queryClient = useQueryClient();
  const supabase = getSupabase();
  
  // Consultation completion state
  const [isConsultationCompleted, setIsConsultationCompleted] = useState(false);
  
  // Initialize form
  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(z.object({
      specialty_data: consultationNotesSchema,
    })),
    defaultValues: {
      specialty_data: (existingConsultation?.specialty_data as z.infer<typeof consultationNotesSchema>) || {},
    },
  });

  // Watch form values for auto-save
  const watchedValues = useWatch({ control: form.control });

  // Fixed auto-save mutation
  const autoSaveMutation = useMutation({
    mutationFn: async (data: ConsultationFormValues) => {
      if (!appointmentId || !activeClinic?.clinics?.id || !appointment) throw new Error('Missing required data');
      
      const consultationData = {
        appointment_id: appointmentId,
        patient_id: appointment.patient_id,
        doctor_id: appointment.doctor_id || user?.id,
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

      // Save prescriptions separately if they exist
      if (data.specialty_data.prescriptions && data.specialty_data.prescriptions.length > 0) {
        const prescriptionsData = data.specialty_data.prescriptions.map((med: Prescription) => ({
          consultation_id: result.id,
          patient_id: appointment.patient_id,
          doctor_id: appointment.doctor_id || user?.id,
          clinic_id: activeClinic.clinics?.id,
          medications: [med] as unknown as Json,
        }));

        // Delete existing prescriptions for this consultation
        await supabase
          .from('prescriptions')
          .delete()
          .eq('consultation_id', result.id);

        // Insert new prescriptions
        const { error: prescError } = await supabase
          .from('prescriptions')
          .insert(prescriptionsData);

        if (prescError) throw prescError;
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

  // Auto-save with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const formValues = form.getValues();
      if (Object.keys(formValues.specialty_data).length > 0) {
        autoSaveMutation.mutate(formValues);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [watchedValues]);

  // Manual save
  const handleSave = useCallback(() => {
    const formValues = form.getValues();
    autoSaveMutation.mutate(formValues);
  }, [form, autoSaveMutation]);

  // Complete consultation
  const handleCompleteConsultation = useCallback(async () => {
    const formValues = form.getValues();
    await autoSaveMutation.mutateAsync(formValues);
    
    // Update appointment status to completed
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'Completed' })
      .eq('id', appointmentId);
    
    if (error) {
      toast({
        title: 'Error',
        description: 'Could not complete consultation',
        variant: 'destructive',
      });
      return;
    }
    
    setIsConsultationCompleted(true);
    toast({
      title: 'Consultation Completed',
      description: 'The consultation has been successfully completed.',
    });
  }, [form, autoSaveMutation, supabase, appointmentId]);

  return {
    form,
    isConsultationCompleted,
    autoSaveMutation,
    handleSave,
    handleCompleteConsultation,
  };
}; 