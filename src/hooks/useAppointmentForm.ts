// src/components/appointments/useAppointmentForm.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  AppointmentFormValues,
  RpcPatient,
  TransformedDoctor,
} from "../components/appointments/appointment.utils";
import type { AppointmentData } from "@/types/appointments";

const supabase = getSupabase();

export const useAppointmentForm = (open: boolean) => {
  const { activeClinic } = useAuth();

  // --- Fetch Patients ---
  const { data: patients, isLoading: isLoadingPatients } = useQuery<
    RpcPatient[],
    Error
  >({
    queryKey: ["patients", activeClinic?.clinic_id],
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
    queryKey: ["doctorsForAppointment", activeClinic?.clinic_id],
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
        // We cast this to TransformedDoctor[] assuming the RPC returns a compatible structure
        // or map it if necessary. Ideally RPC returns exact structure.
        return rpcData as unknown as TransformedDoctor[];
      }

      console.warn(
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

      if (fallbackError) throw new Error("Failed to fetch doctors");

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

// --- Mutation Hook ---
export const useAppointmentMutation = (
  appointment: AppointmentData | null,
  onSuccessCallback: () => void
) => {
  const queryClient = useQueryClient();
  const { activeClinic } = useAuth();

  return useMutation({
    mutationFn: async (values: AppointmentFormValues) => {
      if (!activeClinic?.clinic_id)
        throw new Error("No active clinic selected.");

      const baseAppointmentData = {
        clinic_id: activeClinic.clinic_id,
        date: format(values.date, "yyyy-MM-dd"),
        time: values.time || "",
        patient_id: values.patient_id,
        doctor_id: values.doctor_id,
        type: values.type,
        status: values.status,
        notes: values.notes || "",
      };

      const query = appointment
        ? supabase
            .from("appointments")
            .update(baseAppointmentData)
            .eq("id", appointment.id)
        : supabase.from("appointments").insert(baseAppointmentData);

      const { data, error } = await query.select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success(
        appointment ? "Appointment updated!" : "Appointment created!"
      );
      queryClient.invalidateQueries({
        queryKey: ["appointments", activeClinic?.clinic_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboardData", activeClinic?.clinic_id],
      });
      queryClient.invalidateQueries({ queryKey: ["patientAppointments"] });
      onSuccessCallback();
    },
    onError: (error: Error) => {
      toast.error(
        appointment
          ? "Failed to update appointment."
          : "Failed to create appointment.",
        {
          description: error.message,
        }
      );
    },
  });
};
