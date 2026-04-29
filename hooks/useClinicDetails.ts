"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import { showErrorToast } from "@/lib/error-utils";
import { toast } from "sonner";

const supabase = getSupabase();

export function useClinicDetails(clinicId?: string) {
  const queryClient = useQueryClient();

  const clinicQuery = useQuery({
    queryKey: queryKeys.clinics.details(clinicId ?? ""),
    queryFn: async () => {
      if (!clinicId) return null;
      const { data, error } = await supabase
        .from("clinics")
        .select("*")
        .eq("id", clinicId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!clinicId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const updateMutation = useMutation({
    mutationFn: async (formData: {
      name: string;
      address: string;
      email: string;
      phone: string;
      website?: string;
    }) => {
      if (!clinicId) throw new Error("No clinic found");
      const { name, address, email, phone, website } = formData;
      const { error } = await supabase
        .from("clinics")
        .update({ name, address, email, phone, website: website || null })
        .eq("id", clinicId);
      if (error) throw error;
      return formData;
    },
    onSuccess: () => {
      toast.success("Clinic details updated successfully");
      queryClient.invalidateQueries({
        queryKey: queryKeys.clinics.details(clinicId ?? ""),
      });
    },
    onError: (error: Error) => {
      showErrorToast(error, { title: "Failed to update clinic details" });
    },
  });

  return {
    clinicData: clinicQuery.data,
    isLoading: clinicQuery.isLoading,
    updateClinic: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
