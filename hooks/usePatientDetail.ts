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
  prescriptions: Array<Record<string, unknown>>;
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

  const [consultationsRes, prescriptionsRes] = await Promise.all([
    supabase
      .from("consultations")
      .select("*, appointments(id, date, time, status, doctor_id)")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("prescriptions")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return {
    patient: patient as DbPatientByClinic | null,
    consultations: (consultationsRes.data ?? []) as Array<Record<string, unknown>>,
    prescriptions: (prescriptionsRes.data ?? []) as Array<Record<string, unknown>>,
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
    placeholderData: (prev) => prev,
  });
}

export type { PatientDetail };
