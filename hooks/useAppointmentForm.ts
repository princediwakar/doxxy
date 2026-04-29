// src/components/appointments/useAppointmentForm.ts
"use client";
import { logger } from "@/lib/logger";
import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/query-keys";
import {
  RpcPatient,
  TransformedDoctor,
} from "../components/appointments/appointment.utils";
import type { DbDoctor } from "@/types/core";

const supabase = getSupabase();

export const useAppointmentForm = (open: boolean) => {
  const { activeClinic } = useAuth();

  // --- Fetch Patients ---
  const { data: patients, isLoading: isLoadingPatients } = useQuery<
    RpcPatient[],
    Error
  >({
    queryKey: queryKeys.patients.byClinic(activeClinic?.clinic_id ?? ""),
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return [];
      const { data, error } = await supabase.rpc("get_patients_by_clinic", {
        _clinic_id: activeClinic.clinic_id,
        _limit: 100,
        _offset: 0,
      });
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!activeClinic?.clinic_id,
  });

  // --- Fetch Doctors ---
  const { data: doctors, isLoading: isLoadingDoctors } = useQuery<
    TransformedDoctor[],
    Error
  >({
    queryKey: queryKeys.doctors.forAppointment(activeClinic?.clinic_id ?? ""),
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return [];

      // 1. Try RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "get_doctors_by_clinic",
        {
          clinic_id: activeClinic.clinic_id,
        }
      );

      if (!rpcError && rpcData) {
        return (rpcData as unknown[]).map((item) => {
          const d = item as Record<string, unknown>;
          return {
            id: String(d.id ?? ""),
            user_id: String(d.user_id ?? ""),
            name: String(d.name ?? "Unknown Doctor"),
            email: String(d.email ?? ""),
            phone: String(d.phone ?? ""),
            bio: (d.bio as string) ?? null,
            created_at: String(d.created_at ?? ""),
            role: "doctor",
            department_name: String(d.department_name ?? "General Medicine"),
            department_id: (d.department_id as string) ?? null,
            is_active: (d.is_active as boolean) ?? null,
            primary_specialization: (d.primary_specialization as string) ?? null,
            consultation_fee: (d.consultation_fee as number) ?? null,
          } as TransformedDoctor;
        });
      }

      logger.warn(
        "RPC function failed, using fallback query:",
        rpcError?.message
      );

      // 2. Fallback Query
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("doctors")
        .select(
          `
          id, user_id, name, email, phone, bio, created_at, is_active, 
          primary_specialization, consultation_fee,
          profiles!doctors_user_id_fkey(name, email, phone),
          clinic_members!clinic_members_user_id_fkey(
            department_id,
            clinic_departments!clinic_members_department_id_fkey(
              department_type_id,
              department_types!clinic_departments_department_type_id_fkey(name)
            )
          )
        `
        )
        .eq("clinic_id", activeClinic.clinic_id)
        .eq("is_active", true);

      if (fallbackError) throw new Error(`Failed to fetch doctors: ${fallbackError.message}`);

      // 3. Transform Data
      return (fallbackData || []).map((doctor: unknown) => {
        // Explicitly typing the raw Supabase response structure for safety
        const d = doctor as {
          id: string;
          user_id: string;
          name: string;
          email: string;
          phone: string;
          bio: string;
          created_at: string;
          is_active: boolean;
          primary_specialization: string;
          consultation_fee: number;
          profiles?: { name?: string; email?: string; phone?: string };
          clinic_members?: Array<{
            department_id: string;
            clinic_departments?: { department_types?: { name: string } };
          }>;
        };

        const departmentName =
          d.clinic_members?.[0]?.clinic_departments?.department_types?.name ||
          d.primary_specialization ||
          "General Medicine";

        return {
          id: d.id,
          user_id: d.user_id,
          name: d.name || d.profiles?.name || "Unknown Doctor",
          email: d.email || d.profiles?.email || "",
          phone: d.phone || d.profiles?.phone || "",
          bio: d.bio,
          created_at: d.created_at,
          role: "doctor",
          department_name: departmentName,
          department_id: d.clinic_members?.[0]?.department_id || null,
          is_active: d.is_active,
          primary_specialization: d.primary_specialization,
          consultation_fee: d.consultation_fee,
        };
      });
    },
    enabled: open && !!activeClinic?.clinic_id,
  });

  return {
    patients,
    isLoadingPatients,
    doctors,
    isLoadingDoctors,
    activeClinic,
  };
};
