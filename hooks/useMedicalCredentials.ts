"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import { showErrorToast } from "@/lib/error-utils";
import { logger } from "@/lib/logger";
import { toast } from "sonner";

const supabase = getSupabase();

export function useMedicalCredentials(
  clinicId?: string,
  doctorUserId?: string,
  onSuccess?: () => void
) {
  const queryClient = useQueryClient();

  const departmentsQuery = useQuery({
    queryKey: queryKeys.clinicDepartments.forMembers(clinicId ?? ""),
    queryFn: async () => {
      if (!clinicId) return [];
      const { data, error } = await supabase
        .from("clinic_departments")
        .select("id, department_types(name)")
        .eq("clinic_id", clinicId);
      if (error) {
        logger.error("Error fetching departments:", error);
        return [];
      }
      return ((data as Record<string, unknown>[]) || []).map((d) => ({
        id: d.id as string,
        name:
          ((d.department_types as { name?: string } | null)?.name) ||
          "Unnamed Department",
      }));
    },
    enabled: !!clinicId,
    staleTime: 10 * 60 * 1000,
  });

  const currentDepartmentQuery = useQuery({
    queryKey: queryKeys.doctorDepartment.byDoctor(
      doctorUserId ?? "",
      clinicId ?? ""
    ),
    queryFn: async () => {
      if (!doctorUserId || !clinicId) return null;
      const { data, error } = await supabase
        .from("clinic_members")
        .select("department_id")
        .eq("user_id", doctorUserId)
        .eq("clinic_id", clinicId)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!doctorUserId && !!clinicId,
    staleTime: 5 * 60 * 1000,
  });

  const updateCredentialsMutation = useMutation({
    mutationFn: async (formData: Record<string, string>) => {
      if (!doctorUserId || !clinicId) {
        throw new Error("Doctor profile or active clinic not found");
      }

      const updateData = {
        medical_registration_number:
          formData.medical_registration_number || null,
        medical_council: formData.medical_council || null,
        medical_license_state: formData.medical_license_state || null,
        medical_license_expiry: formData.medical_license_expiry || null,
        primary_specialization: formData.primary_specialization || null,
        medical_specializations: formData.medical_specializations
          ? formData.medical_specializations
              .split(",")
              .map((s: string) => s.trim())
          : null,
        subspecialty: formData.subspecialty
          ? formData.subspecialty.split(",").map((s: string) => s.trim())
          : null,
        board_certifications: formData.board_certifications
          ? formData.board_certifications
              .split(",")
              .map((s: string) => s.trim())
          : null,
        fellowship_details: formData.fellowship_details || null,
        professional_summary: formData.professional_summary || null,
        years_of_experience: formData.years_of_experience
          ? parseInt(formData.years_of_experience)
          : null,
        consultation_fee: formData.consultation_fee
          ? parseFloat(formData.consultation_fee)
          : null,
        medical_degree: formData.medical_degree || null,
        medical_college: formData.medical_college || null,
        graduation_year: formData.graduation_year
          ? parseInt(formData.graduation_year)
          : null,
        medical_university: formData.medical_university || null,
        postgraduate_degree: formData.postgraduate_degree || null,
        pg_specialization: formData.pg_specialization || null,
        pg_institution: formData.pg_institution || null,
        pg_completion_year: formData.pg_completion_year
          ? parseInt(formData.pg_completion_year)
          : null,
        additional_qualifications: formData.additional_qualifications || null,
        research_experience: formData.research_experience || null,
      };

      const { error: doctorError } = await supabase
        .from("doctors")
        .update(updateData)
        .eq("user_id", doctorUserId);

      if (doctorError) throw doctorError;

      const { error: clinicMemberError } = await supabase
        .from("clinic_members")
        .update({
          department_id: formData.department_id || null,
        })
        .eq("user_id", doctorUserId)
        .eq("clinic_id", clinicId);

      if (clinicMemberError) throw clinicMemberError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.profile.doctor(doctorUserId ?? "", clinicId ?? ""),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.clinicMembers.byClinic(clinicId ?? ""),
      });
      toast.success("Medical credentials updated successfully");
      onSuccess?.();
    },
    onError: (error: Error) => {
      showErrorToast(error, { title: "Failed to update medical credentials" });
    },
  });

  return {
    departments: departmentsQuery.data ?? [],
    currentDepartment: currentDepartmentQuery.data ?? null,
    updateCredentials: updateCredentialsMutation.mutate,
    isUpdating: updateCredentialsMutation.isPending,
  };
}
