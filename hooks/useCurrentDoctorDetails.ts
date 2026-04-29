"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/query-keys";

const supabase = getSupabase();

export interface CurrentDoctorDetails {
  id: string;
  name: string;
  department_name: string;
  phone?: string;
  email?: string;
  bio?: string;
  user_id?: string;
}

export function useCurrentDoctorDetails() {
  const { activeClinic, user } = useAuth();

  return useQuery({
    queryKey: queryKeys.doctors.currentForClinic(
      activeClinic?.clinic_id ?? "",
      user?.id ?? ""
    ),
    queryFn: async () => {
      if (!activeClinic?.clinic_id || !user?.id) return null;
      const { data, error } = await supabase.rpc("get_doctors_by_clinic", {
        clinic_id: activeClinic.clinic_id,
      });
      if (error) throw error;
      return (data?.find((d: CurrentDoctorDetails) => d.user_id === user.id) || null) as CurrentDoctorDetails | null;
    },
    enabled: !!activeClinic?.clinic_id && !!user?.id,
  });
}
