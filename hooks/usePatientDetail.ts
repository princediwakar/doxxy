// hooks/usePatientDetail.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/query-keys";
import type { DbPatientByClinic } from "@/types/core";

const supabase = getSupabase();

interface PatientDetail {
  patient: DbPatientByClinic | null;
  consultations: Array<Record<string, unknown>>;
}

async function fetchPatientDetail(
  clinicId: string,
  patientId: string
): Promise<PatientDetail> {
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("*")
    .eq("id", patientId)
    .eq("clinic_id", clinicId)
    .single();

  if (patientError) throw patientError;

  const { data: consultations, error: consultationsError } = await supabase
    .from("consultations")
    .select("*, appointments(id, date, time, status, doctor_id, type, created_at, doctors(name))")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (consultationsError) throw consultationsError;

  return {
    patient: patient as DbPatientByClinic | null,
    consultations: (consultations ?? []) as Array<Record<string, unknown>>,
  };
}

export function usePatientDetail(patientId: string | null) {
  const { activeClinic, loading: authLoading } = useAuth();
  const clinicId = activeClinic?.clinic_id ?? "";

  return useQuery({
    queryKey: [...queryKeys.patients.byId(patientId ?? ""), "detail"],
    queryFn: () => fetchPatientDetail(clinicId, patientId!),
    enabled: !!clinicId && !!patientId && !authLoading,
    staleTime: 30 * 1000,
  });
}

export type { PatientDetail };
