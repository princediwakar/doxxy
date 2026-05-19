// hooks/consultation/useConsultationData.ts
"use client";
import { useQuery } from '@tanstack/react-query';
import { useAppState } from '@/contexts/AppStateContext';
import { getSupabase } from '@/integrations/supabase/client';
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
  const supabase = getSupabase();

  const consultationDataQuery = useQuery({
    queryKey: ['consultation-data', appointmentId, activeClinicId],
    queryFn: async () => {
      if (!appointmentId || !activeClinicId) return null;

      const patientId = prefillAppointment?.patient_id;
      const doctorUserId = prefillAppointment?.user_id;

      const hasPrefetched = !!patientDetail?.consultations?.length;

      const [
        existingConsultationResult,
        previousConsultationsResult,
        recentPrescriptionsResult,
        departmentInfoResult,
      ] = await Promise.all([
        supabase
          .from('consultations')
          .select('*')
          .eq('appointment_id', appointmentId)
          .maybeSingle(),

        patientId && !hasPrefetched
          ? supabase
              .from('consultations')
              .select(`*, appointment:appointments(date, time)`)
              .eq('patient_id', patientId)
              .eq('clinic_id', activeClinicId)
              .neq('appointment_id', appointmentId)
              .order('created_at', { ascending: false })
              .limit(5)
          : Promise.resolve({ data: null, error: null }),

        patientId
          ? supabase
              .from('prescriptions')
              .select('*')
              .eq('patient_id', patientId)
              .eq('clinic_id', activeClinicId)
              .order('created_at', { ascending: false })
              .limit(3)
          : Promise.resolve({ data: [], error: null }),

        doctorUserId && activeClinicId
          ? supabase
              .from('clinic_members')
              .select(`department_id, clinic_departments(department_types(name))`)
              .eq('user_id', doctorUserId)
              .eq('clinic_id', activeClinicId)
              .single()
          : Promise.resolve({ data: null, error: null }),
      ]);

      if (existingConsultationResult.error) throw existingConsultationResult.error;
      if (previousConsultationsResult.error) throw previousConsultationsResult.error;
      if (recentPrescriptionsResult.error) throw recentPrescriptionsResult.error;
      if (departmentInfoResult.error && departmentInfoResult.error.code !== 'PGRST116') throw departmentInfoResult.error;

      const previousConsultations: Array<Record<string, unknown>> = hasPrefetched
        ? derivePreviousConsultations(patientDetail!.consultations, appointmentId)
        : ((previousConsultationsResult.data || []) as unknown as Array<Record<string, unknown>>).map((consultation) => {
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

      const recentPrescriptions = recentPrescriptionsResult.data || [];

      const departmentInfo = departmentInfoResult.data?.clinic_departments?.department_types
        ? {
            name: departmentInfoResult.data.clinic_departments.department_types.name,
            description: undefined,
            clinic_departments: departmentInfoResult.data.clinic_departments,
          }
        : null;

      return {
        existingConsultation: existingConsultationResult.data,
        previousConsultations,
        recentPrescriptions,
        departmentInfo,
      };
    },
    enabled: !!appointmentId && !!activeClinicId,
    staleTime: 2 * 60 * 1000,
  });

  return {
    previousConsultations: consultationDataQuery.data?.previousConsultations || [],
    recentPrescriptions: consultationDataQuery.data?.recentPrescriptions || [],
    existingConsultation: consultationDataQuery.data?.existingConsultation,
    departmentInfo: consultationDataQuery.data?.departmentInfo,
    isInitialLoading: consultationDataQuery.isLoading && !consultationDataQuery.isPlaceholderData,
    isRefetching: consultationDataQuery.isFetching && !consultationDataQuery.isLoading,
  };
};
