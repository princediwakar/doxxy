"use client";

import { logger } from "@/lib/logger";
import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";
import { AppointmentData, Patient } from "@/types/patients";
import { Consultation, TransformedDoctorData, ConsultationFormValues } from "@/types/consultation";

const supabase = getSupabase();

export function useConsultationViewData(
  appointment: AppointmentData | null,
  open: boolean
) {
  const { activeClinic, user } = useAuth();

  const patientQuery = useQuery<Patient | null>({
    queryKey: queryKeys.patients.byId(appointment?.patient_id ?? ""),
    queryFn: async () => {
      if (!appointment?.patient_id || !activeClinic?.clinic_id) return null;
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", appointment.patient_id)
        .eq("clinic_id", activeClinic.clinic_id)
        .single();
      if (error) return null;
      return data;
    },
    enabled:
      open &&
      !!appointment?.patient_id &&
      !!activeClinic?.clinic_id &&
      (!appointment.patient_gender || !appointment.patient_age),
  });

  const consultationQuery = useQuery<Consultation | null>({
    queryKey: queryKeys.consultations.byAppointment(appointment?.id ?? ""),
    queryFn: async () => {
      if (!appointment?.id) return null;
      const { data, error } = await supabase
        .from("consultations")
        .select("*")
        .eq("appointment_id", appointment.id)
        .single();
      if (error && error.code !== "PGRST116") {
        toast.error(`Failed to fetch consultation: ${error.message}`);
        throw error;
      }
      if (data) {
        return {
          ...data,
          specialty_data: data.specialty_data as ConsultationFormValues["specialty_data"],
        } as Consultation;
      }
      return null;
    },
    enabled: open && !!appointment?.id,
  });

  const doctorQuery = useQuery<TransformedDoctorData[] | null>({
    queryKey: queryKeys.doctors.details(appointment?.doctor_id ?? "", activeClinic?.clinic_id ?? ""),
    queryFn: async () => {
      if (!appointment?.doctor_id || !activeClinic?.clinic_id) return null;

      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "get_doctors_by_clinic",
        { clinic_id: activeClinic.clinic_id }
      );

      if (!rpcError && rpcData) {
        const doctor = rpcData?.find(
          (d: TransformedDoctorData) => d.id === appointment.doctor_id
        );
        return doctor
          ? [{ id: doctor.id, name: doctor.name, department_name: doctor.department_name, phone: doctor.phone, email: doctor.email, bio: doctor.bio, user_id: doctor.user_id }]
          : null;
      }

      const { data: fallbackData } = await supabase
        .from("doctors")
        .select("id, name, primary_specialization, phone, email, bio")
        .eq("clinic_id", activeClinic.clinic_id)
        .eq("is_active", true);

      const transformedData =
        fallbackData?.map(
          (doctor) =>
            ({
              id: doctor.id,
              name: doctor.name,
              department_name: doctor.primary_specialization || "General Medicine",
              phone: doctor.phone,
              email: doctor.email,
              bio: doctor.bio,
            } as TransformedDoctorData)
        ) || [];

      const doctor = transformedData?.find((d) => d.id === appointment.doctor_id);
      return doctor ? [doctor] : null;
    },
    enabled: open && !!appointment?.doctor_id && !!activeClinic?.clinic_id,
  });

  return {
    patientData: patientQuery.data,
    consultationData: consultationQuery.data,
    isLoadingConsultation: consultationQuery.isLoading,
    doctorDetails: doctorQuery.data,
  };
}
