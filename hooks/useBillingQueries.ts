"use client";
import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { AppointmentForBilling, DoctorFeeInfo } from "@/types/billing";
import type { DbPatient } from "@/types/core";
import { queryKeys } from "@/lib/query-keys";

const supabase = getSupabase();

export function useBillingQueries(
  open: boolean,
  selectedPatientId: string,
  selectedAppointmentId: string | null,
  mode?: string,
) {
  const { activeClinic } = useAuth();

  const { data: appointments, isLoading: isLoadingAppointments, error: appointmentsError } = useQuery({
    queryKey: queryKeys.appointments.byClinic(activeClinic?.clinic_id ?? ""),
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return [];
      const { data, error } = await supabase
        .rpc("get_appointments_with_details_by_clinic", { clinic_id: activeClinic.clinic_id });
      if (error) throw error;
      return (data || []) as AppointmentForBilling[];
    },
    enabled: open && !!activeClinic?.clinic_id,
    staleTime: 2 * 60 * 1000,
  });

  const { data: patients, isLoading: isLoadingPatients, error: patientsError } = useQuery({
    queryKey: queryKeys.patients.byClinic(activeClinic?.clinic_id ?? ""),
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return [];
      const { data, error } = await supabase
        .from("patients")
        .select("id, name, phone, email, medical_id")
        .eq("clinic_id", activeClinic.clinic_id)
        .order("name");
      if (error) throw error;
      return (data || []) as DbPatient[];
    },
    enabled: open && !!activeClinic?.clinic_id,
    staleTime: 2 * 60 * 1000,
  });

  // Find selected appointment from loaded appointments
  const selectedAppointment = appointments?.find((apt) => apt.id === selectedAppointmentId);

  // Fetch doctor consultation fee (derives doctor_id from selected appointment internally)
  const { data: doctorFee, error: doctorFeeError } = useQuery({
    queryKey: ["doctorFee", selectedAppointment?.doctor_id],
    queryFn: async () => {
      if (!selectedAppointment?.doctor_id) return null;
      const { data, error } = await supabase
        .from("doctors")
        .select("consultation_fee, name")
        .eq("id", selectedAppointment.doctor_id)
        .single();
      if (error) throw error;
      return {
        consultation_fee: data.consultation_fee || 0,
        doctor_name: data.name,
      } as DoctorFeeInfo;
    },
    enabled: !!selectedAppointment?.doctor_id && mode !== "view",
    staleTime: 5 * 60 * 1000,
  });

  // Filter appointments by selected patient
  const filteredAppointments = (appointments || []).filter((apt) => {
    if (!selectedPatientId) return true;
    return apt.patient_id === selectedPatientId;
  });

  return {
    appointments: filteredAppointments,
    patients: patients || [],
    isLoadingAppointments,
    isLoadingPatients,
    appointmentsError: appointmentsError as Error | null,
    patientsError: patientsError as Error | null,
    doctorFee: doctorFee || null,
    doctorFeeError: doctorFeeError as Error | null,
    selectedAppointment,
  };
}
