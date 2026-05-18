"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '@/integrations/supabase/client';
import { useAppState } from '@/contexts/AppStateContext';
import { toast } from 'sonner';
import { showErrorToast } from '@/lib/error-utils';
import { queryKeys } from '@/lib/query-keys';
import { APPOINTMENT_STATUS } from '@/types/appointments';
import { stripNotSpecified } from '@/lib/voice/structureClinicalNotes';
import type { AIStructuredOutput } from '@/types/core';
import type { Json } from '@/integrations/supabase/types';

const supabase = getSupabase();

export function useEncounterCompletion() {
  const { activeClinicId } = useAppState();
  const queryClient = useQueryClient();

  const completeMutation = useMutation({
    mutationFn: async ({
      appointmentId,
      patientId,
      doctorId,
      aiData,
    }: {
      appointmentId: string;
      patientId: string;
      doctorId: string;
      aiData: AIStructuredOutput;
    }) => {
      const clinicId = activeClinicId;
      if (!clinicId) throw new Error('Clinic ID not found');

      const cleanedRawFields = stripNotSpecified(aiData.rawFields) as Record<string, unknown> | null;

      const specialtyData: Record<string, unknown> = {
        chief_complaint: aiData.symptoms !== 'NOT_SPECIFIED' ? aiData.symptoms : '',
        diagnosis: aiData.diagnosis !== 'NOT_SPECIFIED' ? aiData.diagnosis : '',
        ...(cleanedRawFields || {}),
      };
      const specialtyJson = specialtyData as Json;

      const { data: existing, error: checkError } = await supabase
        .from('consultations')
        .select('id')
        .eq('appointment_id', appointmentId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        const { error: updateError } = await supabase
          .from('consultations')
          .update({ specialty_data: specialtyJson })
          .eq('id', existing.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('consultations')
          .insert({
            appointment_id: appointmentId,
            clinic_id: clinicId,
            patient_id: patientId,
            doctor_id: doctorId,
            specialty_data: specialtyJson,
            clinical_notes: {},
          });
        if (insertError) throw insertError;
      }

      const validPrescriptions = aiData.prescriptions.filter(
        (p) => p.drug_name && p.drug_name !== 'NOT_SPECIFIED'
      );

      if (validPrescriptions.length > 0) {
        const medicineCache = new Map<string, { id: number; name: string } | null>();

        const resolveMedicine = async (
          drugName: string,
          formulation?: string | null,
        ): Promise<{ id: number; name: string } | null> => {
          const cacheKey = `${drugName}|${formulation ?? ''}`;
          if (medicineCache.has(cacheKey)) return medicineCache.get(cacheKey) ?? null;

          try {
            const searchTerm = formulation
              ? `${drugName} ${formulation}`
              : drugName;

            const { data: results } = await supabase.rpc('search_medicines', {
              search_term: searchTerm,
              limit_count: 1,
            });

            if (results && results.length > 0 && results[0].id) {
              const match = { id: results[0].id, name: results[0].name };
              medicineCache.set(cacheKey, match);
              return match;
            }

            const { data: created, error: insertError } = await supabase
              .from('medicines')
              .insert({ name: drugName, is_auto_created: true })
              .select('id, name')
              .single();

            if (insertError || !created) {
              medicineCache.set(cacheKey, null);
              return null;
            }

            const match = { id: created.id, name: created.name };
            medicineCache.set(cacheKey, match);
            return match;
          } catch {
            medicineCache.set(cacheKey, null);
            return null;
          }
        };

        const medications = await Promise.all(
          validPrescriptions.map(async (p) => {
            const resolved = await resolveMedicine(p.drug_name!, p.formulation);
            return {
              name: p.drug_name,
              dosage: p.dosage !== 'NOT_SPECIFIED' ? p.dosage : '',
              frequency: p.frequency !== 'NOT_SPECIFIED' ? p.frequency : '',
              duration: p.duration !== 'NOT_SPECIFIED' ? p.duration : '',
              route: p.route !== 'NOT_SPECIFIED' ? p.route : '',
              instructions: p.instructions !== 'NOT_SPECIFIED' ? p.instructions : '',
              formulation: p.formulation !== 'NOT_SPECIFIED' ? p.formulation : '',
              ...(resolved
                ? { medicine_id: resolved.id, medicine_name: resolved.name }
                : {}),
            };
          }),
        );

        const { error: rxError } = await supabase
          .from('prescriptions')
          .insert({
            patient_id: patientId,
            clinic_id: clinicId,
            doctor_id: doctorId,
            appointment_id: appointmentId,
            medications,
          });
        if (rxError) throw rxError;
      }

      const { error: statusError } = await supabase
        .from('appointments')
        .update({ status: APPOINTMENT_STATUS.COMPLETED })
        .eq('id', appointmentId);
      if (statusError) throw statusError;

      try {
        await supabase.rpc('deduct_appointment_credit', {
          appointment_id_param: appointmentId,
          clinic_id_param: clinicId,
          credits_to_deduct: 1,
        });
      } catch {
        // non-blocking — credit deduction is best-effort
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      queryClient.invalidateQueries({ queryKey: ['clinic-billing-summary'] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast.success('Encounter completed');
    },
    onError: (err) => {
      showErrorToast(err);
    },
  });

  return {
    completeEncounter: completeMutation.mutate,
    isCompleting: completeMutation.isPending,
  };
}
