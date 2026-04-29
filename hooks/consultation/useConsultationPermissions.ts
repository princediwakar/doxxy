"use client";
import { logger } from "@/lib/logger";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { DbAppointment } from "@/types/core";

const supabase = getSupabase();

export interface UseConsultationPermissionsParams {
  appointment: DbAppointment | null | undefined;
}

export interface UseConsultationPermissionsReturn {
  isAssignedDoctor: boolean;
  canEditConsultation: boolean;
}

export const useConsultationPermissions = ({
  appointment,
}: UseConsultationPermissionsParams): UseConsultationPermissionsReturn => {
  const { user, activeClinic, hasDoctorProfile } = useAuth();

  const { data: assignedDoctor } = useQuery({
    queryKey: ['assigned-doctor', appointment?.doctor_id],
    queryFn: async () => {
      if (!appointment?.doctor_id) return null;

      const { data, error } = await supabase
        .from('doctors')
        .select('id, user_id, name, email')
        .eq('id', appointment.doctor_id)
        .single();

      if (error) {
        logger.error('Error fetching assigned doctor:', error);
        return null;
      }

      return data;
    },
    enabled: !!appointment?.doctor_id,
  });

  const isAssignedDoctor = useMemo(() => {
    if (!appointment?.doctor_id || !user?.id) return false;
    return assignedDoctor?.user_id === user.id;
  }, [appointment?.doctor_id, user?.id, assignedDoctor?.user_id]);

  const canEditConsultation = useMemo(() => {
    if (isAssignedDoctor) {
      if (process.env.NODE_ENV === "development") logger.log('✅ canEditConsultation: true (isAssignedDoctor)');
      return true;
    }

    if (activeClinic?.role === 'superadmin' && hasDoctorProfile && user?.id) {
      if (process.env.NODE_ENV === "development") logger.log('✅ canEditConsultation: true (superadmin with doctor profile)');
      return true;
    }

    if (process.env.NODE_ENV === "development") {
      logger.log('❌ canEditConsultation: false',
        'isAssignedDoctor:', isAssignedDoctor,
        'activeClinicRole:', activeClinic?.role,
        'hasDoctorProfile:', hasDoctorProfile,
        'userId:', user?.id
      );
    }
    return false;
  }, [isAssignedDoctor, activeClinic?.role, hasDoctorProfile, user?.id]);

  return { isAssignedDoctor, canEditConsultation };
};
