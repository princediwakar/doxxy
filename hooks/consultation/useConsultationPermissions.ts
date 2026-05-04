// hooks/consultation/useConsultationPermissions.ts
"use client";

import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user, activeClinic, hasDoctorProfile, doctorId } = useAuth();

  const isAssignedDoctor = useMemo(() => {
    if (!appointment?.doctor_id || !user?.id || !doctorId) return false;
    return doctorId === appointment.doctor_id;
  }, [appointment?.doctor_id, user?.id, doctorId]);

  const canEditConsultation = useMemo(() => {
    if (isAssignedDoctor) return true;

    if (activeClinic?.role === 'superadmin' && hasDoctorProfile && user?.id) {
      return true;
    }

    return false;
  }, [isAssignedDoctor, activeClinic?.role, hasDoctorProfile, user?.id]);

  return { isAssignedDoctor, canEditConsultation };
};
