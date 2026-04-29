"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const supabase = getSupabase();

export function useHasDoctorProfile() {
  const { user, activeClinic, activeClinicRole } = useAuth();

  return useQuery({
    queryKey: ["hasDoctorProfile", user?.id, activeClinic?.clinic_id],
    queryFn: async () => {
      if (!user?.id || !activeClinic?.clinic_id) return false;
      const { data, error } = await supabase
        .from("doctors")
        .select("id")
        .eq("id", user.id)
        .eq("clinic_id", activeClinic.clinic_id)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled:
      !!user?.id &&
      !!activeClinic?.clinic_id &&
      activeClinicRole === "superadmin",
    staleTime: 60 * 1000,
  });
}
