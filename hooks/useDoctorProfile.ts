"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/query-keys";

const supabase = getSupabase();

export function useDoctorProfile(userId: string | undefined, clinicId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.profile.doctor(userId ?? "", clinicId ?? ""),
    queryFn: async () => {
      if (!userId || !clinicId) return null;

      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("user_id", userId)
        .eq("clinic_id", clinicId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }

      const { data: memberData } = await supabase
        .from("clinic_members")
        .select(`
          department_id,
          clinic_departments(
            id,
            department_types(name)
          )
        `)
        .eq("user_id", userId)
        .eq("clinic_id", clinicId)
        .single();

      return {
        ...data,
        department_name:
          memberData?.clinic_departments?.department_types?.name ||
          "No Department",
      };
    },
    enabled: !!userId && !!clinicId,
    retry: (failureCount, error: unknown) => {
      if ((error as { code?: string })?.code === "PGRST116") return false;
      return failureCount < 3;
    },
  });
}
