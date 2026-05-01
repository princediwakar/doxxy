"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/query-keys";

const supabase = getSupabase();

export interface BillingPatient {
  patient_id: string;
  patient_name: string;
  total_due: number;
  bill_count: number;
}

async function fetchOutstandingBalances(clinicId: string): Promise<BillingPatient[]> {
  const { data, error } = await supabase
    .from("bills")
    .select("patient_id, amount, patients(name)")
    .eq("clinic_id", clinicId)
    .neq("status", "Paid")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const byPatient = new Map<string, { name: string; total: number; count: number }>();

  for (const row of (data ?? []) as Array<{
    patient_id: string;
    amount: number;
    patients: { name: string } | null;
  }>) {
    const existing = byPatient.get(row.patient_id);
    if (existing) {
      existing.total += Number(row.amount);
      existing.count++;
    } else {
      byPatient.set(row.patient_id, {
        name: row.patients?.name ?? "Unknown",
        total: Number(row.amount),
        count: 1,
      });
    }
  }

  return Array.from(byPatient.entries())
    .map(([patient_id, v]) => ({
      patient_id,
      patient_name: v.name,
      total_due: v.total,
      bill_count: v.count,
    }))
    .sort((a, b) => b.total_due - a.total_due);
}

export function useOutstandingBalances() {
  const { activeClinic, loading: authLoading } = useAuth();
  const clinicId = activeClinic?.clinic_id ?? "";

  return useQuery({
    queryKey: [...queryKeys.billing.byClinic(clinicId, "outstanding"), "outstanding"],
    queryFn: () => fetchOutstandingBalances(clinicId),
    enabled: !!clinicId && !authLoading,
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
