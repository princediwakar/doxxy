"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { showErrorToast } from "@/lib/error-utils";
import { queryKeys } from "@/lib/query-keys";
import type { DbPatientInsert, DbPatientUpdate } from "@/types/core";

const supabase = getSupabase();

export function usePatientMutations() {
  const { activeClinic } = useAuth();
  const queryClient = useQueryClient();

  const createPatient = useMutation({
    mutationFn: async (values: Omit<DbPatientInsert, "clinic_id">) => {
      if (!activeClinic?.clinic_id) {
        throw new Error("No active clinic selected.");
      }

      const patientData: DbPatientInsert = {
        name: values.name,
        clinic_id: activeClinic.clinic_id,
        gender: values.gender ?? null,
        age: values.age ?? null,
        phone: values.phone ?? null,
        email: values.email ?? null,
        address: values.address ?? null,
        medical_id: values.medical_id?.trim() || null,
      };

      const { data, error } = await supabase
        .from("patients")
        .insert(patientData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Patient created successfully.");
      queryClient.invalidateQueries({
        queryKey: ['patientsWithMedicalRecords'],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.patients.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.data(activeClinic?.clinic_id ?? ""),
      });
    },
    onError: (error) => {
      showErrorToast(error, { title: "Failed to create patient" });
    },
  });

  const updatePatient = useMutation({
    mutationFn: async (values: { id: string } & Omit<DbPatientInsert, "clinic_id">) => {
      const { id, ...rest } = values;

      const patientData: DbPatientUpdate = {
        name: rest.name,
        gender: rest.gender ?? null,
        age: rest.age ?? null,
        phone: rest.phone ?? null,
        email: rest.email ?? null,
        address: rest.address ?? null,
        medical_id: rest.medical_id?.trim() || null,
      };

      const { data, error } = await supabase
        .from("patients")
        .update(patientData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Patient updated successfully.");
      queryClient.invalidateQueries({
        queryKey: ['patientsWithMedicalRecords'],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.patients.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.data(activeClinic?.clinic_id ?? ""),
      });
    },
    onError: (error) => {
      showErrorToast(error, { title: "Failed to update patient" });
    },
  });

  return { createPatient, updatePatient };
}
