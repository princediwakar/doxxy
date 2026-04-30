"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import { showErrorToast } from "@/lib/error-utils";
import { toast } from "sonner";

const supabase = getSupabase();

export function useClinicDepartmentsForOnboarding(clinicId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.clinicDepartments.forMembers(clinicId ?? ""),
    queryFn: async () => {
      if (!clinicId) return [];
      const { data, error } = await supabase
        .from("clinic_departments")
        .select("id, department_types(id, name)")
        .eq("clinic_id", clinicId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!clinicId,
  });
}

export function useDoctorQuickOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      departmentId,
      specialization,
      consultationFee,
      userId,
      userEmail,
      userPhone,
      clinicId,
      existingDoctorProfile,
    }: {
      name: string;
      departmentId: string;
      specialization: string;
      consultationFee: number;
      userId: string;
      userEmail?: string | null;
      userPhone?: string | null;
      clinicId: string;
      existingDoctorProfile: boolean;
    }) => {
      // 1. Upsert Profile (Name only)
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, phone")
        .eq("id", userId)
        .maybeSingle();

      if (!existingProfile) {
        await supabase.from("profiles").insert({
          id: userId,
          name: name.trim(),
          email: userEmail,
          created_at: new Date().toISOString(),
        });
      } else {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ name: name.trim() })
          .eq("id", userId);
        if (profileError) throw profileError;
      }

      // 2. Update Auth Metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { name: name.trim() },
      });
      if (authError) throw authError;

      // 3. Upsert Doctor Record
      const doctorData = {
        name: name.trim(),
        email: userEmail || "",
        phone: existingProfile?.phone || userPhone || "",
        primary_specialization: specialization,
        consultation_fee: consultationFee,
        bio: `Medical professional specializing in ${specialization}`,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      if (existingDoctorProfile) {
        const { error: doctorError } = await supabase
          .from("doctors")
          .update(doctorData)
          .eq("user_id", userId)
          .eq("clinic_id", clinicId);
        if (doctorError) throw doctorError;
      } else {
        const { error: doctorError } = await supabase.from("doctors").insert({
          ...doctorData,
          user_id: userId,
          clinic_id: clinicId,
        });
        if (doctorError) throw doctorError;
      }

      // 4. Update Clinic Member Department
      const { error: deptError } = await supabase
        .from("clinic_members")
        .update({ department_id: departmentId })
        .eq("user_id", userId)
        .eq("clinic_id", clinicId);
      if (deptError) throw deptError;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.profile.user(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.profile.doctor(variables.userId, variables.clinicId),
      });
      queryClient.invalidateQueries({ queryKey: ["userHasDoctorProfile"] });
      toast.success(
        "Medical profile ready! You can now start accepting appointments."
      );
    },
    onError: (error) => {
      showErrorToast(error, { title: "Failed to save medical profile" });
    },
  });
}
