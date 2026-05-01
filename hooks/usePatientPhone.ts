"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";

const supabase = getSupabase();

export function usePatientPhone(patientId?: string | null) {
  return useQuery({
    queryKey: ["patient", "phone", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("phone")
        .eq("id", patientId!)
        .single();

      if (error) throw error;
      return data?.phone ?? null;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}
