// hooks/consultation/useConsultationData.ts
"use client";
import { useQuery } from '@tanstack/react-query';
import { useAppState } from '@/contexts/AppStateContext';
import { getConsultationContext } from '@/lib/queries/consultation';
import type { AppointmentWithDetails } from '@/types/appointments';
import type { PatientDetail } from '@/types/core';

interface UseConsultationDataOptions {
  appointmentId: string | undefined;
  appointment?: AppointmentWithDetails | null;
  patientDetail?: PatientDetail | null;
}

function derivePreviousConsultations(
  prefetchedConsultations: Array<Record<string, unknown>>,
  appointmentId: string,
  limit = 5,
): Array<Record<string, unknown>> {
  return prefetchedConsultations
    .filter((c) => {
      const rec = c as Record<string, unknown>;
      const apts = rec.appointments as Record<string, unknown> | null;
      return apts?.id !== appointmentId && apts?.status === 'Completed';
    })
    .slice(0, limit)
    .map((c) => {
      const rec = { ...(c as Record<string, unknown>) };
      const apts = rec.appointments as Record<string, unknown> | null;
      delete rec.appointments;
      return {
        ...rec,
        specialty_data: rec.specialty_data as Record<string, unknown> | null,
        appointment: apts
          ? {
              date: apts.date as string,
              time: apts.time as string,
              doctor_name: (apts.doctors as { name?: string } | null)?.name ?? 'Previous Doctor',
              department_name: 'Previous Department',
            }
          : null,
      };
    });
}

export const useConsultationData = ({
  appointmentId,
  appointment: prefillAppointment,
  patientDetail,
}: UseConsultationDataOptions) => {
  const { activeClinicId } = useAppState();

  const patientId = prefillAppointment?.patient_id;
  const doctorUserId = prefillAppointment?.user_id;
  const hasPrefetched = !!patientDetail?.consultations?.length;

  const consultationDataQuery = useQuery({
    queryKey: ['consultation-context', appointmentId, activeClinicId, patientId, doctorUserId],
    queryFn: () =>
      getConsultationContext(
        appointmentId!,
        activeClinicId!,
        patientId,
        doctorUserId,
        hasPrefetched,
      ),
    enabled: !!appointmentId && !!activeClinicId,
    staleTime: 2 * 60 * 1000,
  });

  const previousConsultations: Array<Record<string, unknown>> = hasPrefetched
    ? derivePreviousConsultations(patientDetail!.consultations, appointmentId!)
    : ((consultationDataQuery.data?.previousConsultations || []) as unknown as Array<Record<string, unknown>>).map((consultation) => {
        const rec = consultation as Record<string, unknown>;
        const apt = rec.appointment as Record<string, unknown> | undefined;
        return {
          ...rec,
          specialty_data: rec.specialty_data as Record<string, unknown> | null,
          appointment: apt
            ? {
                date: apt.date as string,
                time: apt.time as string,
                doctor_name: 'Previous Doctor',
                department_name: 'Previous Department',
              }
            : null,
        };
      });

  const departmentInfo = consultationDataQuery.data?.departmentInfo?.clinic_departments
    ? {
        name: consultationDataQuery.data.departmentInfo.name,
        clinic_departments: consultationDataQuery.data.departmentInfo.clinic_departments,
      }
    : null;

  return {
    previousConsultations,
    recentPrescriptions: consultationDataQuery.data?.recentPrescriptions || [],
    existingConsultation: consultationDataQuery.data?.existingConsultation,
    departmentInfo,
    isInitialLoading: consultationDataQuery.isLoading && !consultationDataQuery.isPlaceholderData,
    isRefetching: consultationDataQuery.isFetching && !consultationDataQuery.isLoading,
  };
};
