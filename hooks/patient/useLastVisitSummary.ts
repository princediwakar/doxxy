"use client";

import { useQuery } from '@tanstack/react-query';
import { getSupabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/query-keys';

const supabase = getSupabase();

interface LastVisitData {
  lastConsultation: {
    date: string;
    chief_complaint?: string;
    diagnosis?: string;
  } | null;
  lastPrescription: {
    date: string;
    medicationNames: string[];
  } | null;
}

function extractSpecialtyField(row: unknown, field: string): string | undefined {
  const record = row as Record<string, unknown> | null;
  if (!record || !record.specialty_data || typeof record.specialty_data !== 'object') return undefined;
  return (record.specialty_data as Record<string, unknown>)[field] as string | undefined;
}

async function fetchLastVisitSummary(patientId: string): Promise<LastVisitData> {
  const [{ data: consultations }, { data: prescriptions }] = await Promise.all([
    supabase
      .from('consultations')
      .select('created_at, specialty_data, appointments!inner(status)')
      .eq('patient_id', patientId)
      .eq('appointments.status', 'Completed')
      .order('created_at', { ascending: false })
      .limit(1),
    supabase
      .from('prescriptions')
      .select('created_at, medications')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(1),
  ]);

  const lastConsultation =
    consultations && consultations.length > 0
      ? {
          date: (consultations[0] as Record<string, unknown>).created_at as string,
          chief_complaint: extractSpecialtyField(consultations[0], 'chief_complaint'),
          diagnosis: extractSpecialtyField(consultations[0], 'diagnosis'),
        }
      : null;

  const lastPrescription =
    prescriptions && prescriptions.length > 0
      ? {
          date: (prescriptions[0] as Record<string, unknown>).created_at as string,
          medicationNames: (
            ((prescriptions[0] as Record<string, unknown>).medications as Array<{ name?: string }>) || []
          )
            .map((m) => m.name)
            .filter(Boolean) as string[],
        }
      : null;

  return { lastConsultation, lastPrescription };
}

export function useLastVisitSummary(patientId: string | null) {
  return useQuery({
    queryKey: queryKeys.lastVisitSummary(patientId ?? ''),
    queryFn: () => fetchLastVisitSummary(patientId!),
    enabled: !!patientId,
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export type { LastVisitData };
