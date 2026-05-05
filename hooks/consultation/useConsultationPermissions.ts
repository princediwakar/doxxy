// hooks/consultation/useConsultationPermissions.ts
"use client";

import { useMemo, useEffect, useState } from "react";
import { useAppState } from "@/contexts/AppStateContext";
import { getSupabase } from "@/integrations/supabase/client";

export interface UseConsultationPermissionsParams {
  appointment: { doctor_id: string } | null | undefined;
}

export interface UseConsultationPermissionsReturn {
  isAssignedDoctor: boolean;
  canEditConsultation: boolean;
}

export const useConsultationPermissions = ({
  appointment,
}: UseConsultationPermissionsParams): UseConsultationPermissionsReturn => {
  const { user, activeClinicRole, activeClinicId } = useAppState();
  const [userDoctorId, setUserDoctorId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setUserDoctorId(null);
      return;
    }
    const supabase = getSupabase();
    const query = supabase.from("doctors").select("id").eq("user_id", user.id);
    if (activeClinicId) query.eq("clinic_id", activeClinicId);
    query
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          setUserDoctorId(null);
          return;
        }
        setUserDoctorId(data?.id ?? null);
      });
  }, [user?.id, activeClinicId]);

  const isAssignedDoctor = useMemo(() => {
    if (!appointment?.doctor_id || !user?.id || !userDoctorId) return false;
    return appointment.doctor_id === userDoctorId;
  }, [appointment?.doctor_id, user?.id, userDoctorId]);

  const canEditConsultation = useMemo(() => {
    if (isAssignedDoctor) return true;
    if (activeClinicRole === "superadmin") return true;
    return false;
  }, [isAssignedDoctor, activeClinicRole]);

  return { isAssignedDoctor, canEditConsultation };
};
