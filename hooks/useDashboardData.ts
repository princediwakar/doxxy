"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/query-keys";
import { StaffDashboardData, isValidDatabaseAppointment } from "@/types/dashboard";

const supabase = getSupabase();

export function useDashboardData() {
  const { activeClinic, activeClinicRole, loading: authLoading } = useAuth();

  return useQuery<StaffDashboardData | null>({
    queryKey: queryKeys.dashboard.data(activeClinic?.clinic_id ?? ""),
    queryFn: async () => {
      if (!activeClinic?.clinic_id || activeClinicRole === "doctor")
        return null;
      const { data, error } = await supabase.rpc("get_dashboard_data", {
        _clinic_id: activeClinic.clinic_id,
      });
      if (error) throw error;
      const result = (data?.[0] ??
        null) as unknown as StaffDashboardData | null;
      if (result) {
        result.all_relevant_appointments = Array.isArray(
          result.all_relevant_appointments
        )
          ? result.all_relevant_appointments.filter(isValidDatabaseAppointment)
          : [];
      }
      return result;
    },
    enabled:
      !!activeClinic?.clinic_id &&
      activeClinicRole !== "doctor" &&
      !authLoading,
    staleTime: 5 * 60 * 1000,
  });
}
