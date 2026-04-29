"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/query-keys";
import { DoctorDashboardData, isValidDatabaseAppointment } from "@/types/dashboard";

const supabase = getSupabase();

export function useDoctorDashboardData(enabled = true) {
  const { activeClinic, user, activeClinicRole } = useAuth();

  return useQuery<DoctorDashboardData | null>({
    queryKey: queryKeys.dashboard.doctor(
      activeClinic?.clinic_id ?? "",
      user?.id ?? ""
    ),
    queryFn: async () => {
      if (
        !activeClinic?.clinic_id ||
        !user?.id ||
        (activeClinicRole !== "doctor" && activeClinicRole !== "superadmin")
      )
        return null;

      const { data, error } = await supabase.rpc("get_doctor_dashboard_data", {
        _clinic_id: activeClinic.clinic_id,
        _user_id: user.id,
      });
      if (error) throw error;
      const result = (data?.[0] ??
        null) as unknown as DoctorDashboardData | null;
      if (result) {
        result.upcoming_appointments = Array.isArray(
          result.upcoming_appointments
        )
          ? result.upcoming_appointments.filter(isValidDatabaseAppointment)
          : [];
        result.my_patients = Array.isArray(result.my_patients)
          ? result.my_patients.map((p) => ({
              id: p.id ?? "",
              name: p.name ?? "",
              last_visit: p.last_visit ?? undefined,
              address: p.address ?? undefined,
              clinic_id: p.clinic_id ?? undefined,
              created_at: p.created_at ?? null,
              age: p.age ?? null,
              email: p.email ?? "",
              gender: p.gender ?? "",
              medical_id: p.medical_id ?? "",
              phone: p.phone ?? "",
            }))
          : [];
      }
      return result;
    },
    enabled:
      enabled &&
      !!activeClinic?.clinic_id &&
      !!user?.id &&
      (activeClinicRole === "doctor" || activeClinicRole === "superadmin"),
    staleTime: 5 * 60 * 1000,
  });
}
