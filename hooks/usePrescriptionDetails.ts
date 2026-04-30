"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/query-keys";

const supabase = getSupabase();

export function usePrescriptionDetails(
  prescriptionId: string | undefined,
  clinicId: string | undefined,
  enabled: boolean
) {
  return useQuery({
    queryKey: queryKeys.prescriptions.details(prescriptionId ?? ""),
    queryFn: async () => {
      if (!prescriptionId) return null;

      const { data: prescriptionData, error: prescriptionError } = await supabase
        .from('prescriptions')
        .select(`
          *,
          patients!inner(id, name, gender, age, phone, email, medical_id),
          doctors!inner(id, name, user_id)
        `)
        .eq('id', prescriptionId)
        .single();

      if (prescriptionError) throw prescriptionError;

      const { data: doctorProfile } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', prescriptionData.doctors.user_id)
        .single();

      const { data: doctorDepartment } = await supabase
        .from('clinic_members')
        .select(`
          clinic_departments(
            department_types(name)
          )
        `)
        .eq('user_id', prescriptionData.doctors.user_id || '')
        .eq('clinic_id', clinicId || '')
        .single();

      return {
        ...prescriptionData,
        doctor_profile: doctorProfile,
        doctor_department: doctorDepartment?.clinic_departments?.department_types?.name
      };
    },
    enabled: enabled && !!prescriptionId && !!clinicId,
    staleTime: 30 * 60 * 1000,
  });
}
