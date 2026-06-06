"use client";
import { useQuery } from "@tanstack/react-query";
import { useAppState } from "@/contexts/AppStateContext";
import { getBillingContext } from "@/lib/queries/billing";

export function useBillingQueries(
  open: boolean,
  selectedPatientId: string,
  selectedAppointmentId: string | null,
  mode?: string,
) {
  const { activeClinicId } = useAppState();

  const { data, isLoading, error } = useQuery({
    queryKey: ['billing-context', activeClinicId, selectedAppointmentId, mode],
    queryFn: () => getBillingContext(activeClinicId!, selectedAppointmentId, mode),
    enabled: open && !!activeClinicId,
    staleTime: 2 * 60 * 1000,
  });

  const appointments = data?.appointments || [];
  const patients = data?.patients || [];
  const selectedAppointment = data?.selectedAppointment;

  const filteredAppointments = (appointments).filter((apt) => {
    if (!selectedPatientId) return true;
    return apt.patient_id === selectedPatientId;
  });

  return {
    appointments: filteredAppointments,
    patients,
    isLoadingAppointments: isLoading,
    isLoadingPatients: isLoading,
    appointmentsError: error as Error | null,
    patientsError: error as Error | null,
    doctorFee: data?.doctorFee || null,
    doctorFeeError: null,
    selectedAppointment,
    prescriptionItems: data?.prescriptionItems || [],
  };
}
