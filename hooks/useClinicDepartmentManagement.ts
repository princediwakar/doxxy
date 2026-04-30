"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import { showErrorToast } from "@/lib/error-utils";
import { toast } from "sonner";
import { DbDepartmentType, DbClinicDepartment } from "@/types/core";

const supabase = getSupabase();

export function useClinicDepartmentManagement(clinicId?: string) {
  const queryClient = useQueryClient();

  const departmentTypesQuery = useQuery<DbDepartmentType[]>({
    queryKey: queryKeys.clinicDepartments.allTypes,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("department_types")
        .select("*")
        .order("name");
      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 60 * 1000,
  });

  const clinicDepartmentsQuery = useQuery<DbClinicDepartment[]>({
    queryKey: queryKeys.clinicDepartments.byClinic(clinicId ?? ""),
    queryFn: async () => {
      if (!clinicId) return [];
      const { data, error } = await supabase
        .from("clinic_departments")
        .select("*")
        .eq("clinic_id", clinicId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!clinicId,
    staleTime: 2 * 60 * 1000,
  });

  const addDepartmentMutation = useMutation({
    mutationFn: async (departmentTypeId: string) => {
      if (!clinicId) throw new Error("Active clinic not found.");
      const { error } = await supabase
        .from("clinic_departments")
        .insert({ clinic_id: clinicId, department_type_id: departmentTypeId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.clinicDepartments.byClinic(clinicId ?? ""),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.clinicDepartments.forMembers(clinicId ?? ""),
      });
      toast.success("Department added successfully");
    },
    onError: (error: Error) => {
      showErrorToast(error, { title: "Failed to add department" });
    },
  });

  const removeDepartmentMutation = useMutation({
    mutationFn: async (clinicDepartmentId: string) => {
      if (!clinicId) throw new Error("Active clinic not found.");

      const { count, error: countError } = await supabase
        .from("clinic_members")
        .select("*", { count: "exact", head: true })
        .eq("department_id", clinicDepartmentId);

      if (countError) {
        throw new Error(
          `Failed to check for department members: ${countError.message}`
        );
      }
      if (count && count > 0) {
        throw new Error(
          `Cannot remove department: ${count} member(s) are still assigned.`
        );
      }

      const { error } = await supabase
        .from("clinic_departments")
        .delete()
        .eq("id", clinicDepartmentId);

      if (error) {
        if (error.message.includes("violates foreign key constraint")) {
          throw new Error("This department is in use and cannot be removed.");
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.clinicDepartments.byClinic(clinicId ?? ""),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.clinicDepartments.forMembers(clinicId ?? ""),
      });
      toast.success("Department removed successfully");
    },
    onError: (error: Error) => {
      showErrorToast(error, { title: "Failed to remove department" });
    },
  });

  return {
    departmentTypes: departmentTypesQuery.data ?? [],
    clinicDepartments: clinicDepartmentsQuery.data ?? [],
    isLoading:
      departmentTypesQuery.isLoading ||
      clinicDepartmentsQuery.isLoading ||
      addDepartmentMutation.isPending ||
      removeDepartmentMutation.isPending,
    addDepartment: addDepartmentMutation.mutate,
    removeDepartment: removeDepartmentMutation.mutate,
  };
}
