// src/hooks/usePrefetching.ts
"use client";
import { useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const supabase = getSupabase();

export const usePrefetching = () => {
  const queryClient = useQueryClient();
  const { activeClinic } = useAuth();

  const prefetchAppointments = async () => {
    if (!activeClinic?.clinics?.id) return;

    // Prefetch appointments data using the same query structure as useAppointments
    await queryClient.prefetchQuery({
      queryKey: ['appointments', activeClinic.clinics.id],
      queryFn: async () => {
        const { data, error } = await supabase
          .rpc('get_appointments_with_details_by_clinic', { clinic_id: activeClinic.clinics?.id || '' });

        if (error) throw error;
        return data || [];
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  const prefetchPatients = async () => {
    if (!activeClinic?.clinics?.id) return;

    // Prefetch basic patient list (without detailed records)
    await queryClient.prefetchQuery({
      queryKey: ['patients-basic', activeClinic.clinics.id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('clinic_id', activeClinic.clinics?.id || '')
          .limit(20); // Prefetch first 20 patients

        if (error) throw error;
        return data || [];
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  const prefetchDoctors = async () => {
    if (!activeClinic?.clinics?.id) return;

    // Prefetch doctors list
    await queryClient.prefetchQuery({
      queryKey: ['doctors', activeClinic.clinics.id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('doctors')
          .select('id, name, user_id, primary_specialization, email, phone, bio, consultation_fee, is_active, created_at, updated_at')
          .eq('clinic_id', activeClinic.clinics?.id || '')
          .eq('is_active', true);

        if (error) throw error;
        return data || [];
      },
      staleTime: 30 * 60 * 1000, // 30 minutes
    });
  };

  const prefetchConsultationData = async (appointmentId: string) => {
    if (!activeClinic?.clinic_id) return;

    // Prefetch consultation-specific data that will be needed on the consultation page
    await queryClient.prefetchQuery({
      queryKey: ['consultation-data', appointmentId, activeClinic.clinic_id],
      queryFn: async () => {
        // Fetch appointment with patient and doctor info
        const appointmentResult = await supabase
          .from('appointments')
          .select(`
            *,
            patient:patients(*),
            doctor:doctors(user_id, name)
          `)
          .eq('id', appointmentId)
          .eq('clinic_id', activeClinic.clinic_id)
          .single();

        if (appointmentResult.error) throw appointmentResult.error;

        const appointmentData = appointmentResult.data;
        const patientId = appointmentData?.patient?.id;

        if (!patientId) {
          return {
            appointment: appointmentData,
            existingConsultation: null,
            clinicDetails: null,
            previousConsultations: [],
            recentPrescriptions: [],
            doctorDetails: null,
            departmentInfo: null
          };
        }

        // Fetch essential consultation data in parallel
        const [
          existingConsultationResult,
          previousConsultationsResult,
          recentPrescriptionsResult
        ] = await Promise.all([
          // Fetch existing consultation
          supabase
            .from('consultations')
            .select('*')
            .eq('appointment_id', appointmentId)
            .maybeSingle(),

          // Fetch patient's previous consultations
          supabase
            .from('consultations')
            .select(`
              *,
              appointment:appointments(date, time)
            `)
            .eq('patient_id', patientId)
            .eq('clinic_id', activeClinic.clinic_id)
            .neq('appointment_id', appointmentId)
            .order('created_at', { ascending: false })
            .limit(5),

          // Fetch patient's recent prescriptions
          supabase
            .from('prescriptions')
            .select('*')
            .eq('patient_id', patientId)
            .eq('clinic_id', activeClinic.clinic_id)
            .order('created_at', { ascending: false })
            .limit(3),
        ]);

        // Check for errors
        if (existingConsultationResult.error) throw existingConsultationResult.error;
        if (previousConsultationsResult.error) throw previousConsultationsResult.error;
        if (recentPrescriptionsResult.error) throw recentPrescriptionsResult.error;

        return {
          appointment: appointmentData,
          existingConsultation: existingConsultationResult.data,
          clinicDetails: null,
          previousConsultations: previousConsultationsResult.data || [],
          recentPrescriptions: recentPrescriptionsResult.data || [],
          doctorDetails: null,
          departmentInfo: null
        };
      },
      staleTime: 2 * 60 * 1000, // 2 minutes for consultation data
    });
  };

  const prefetchAllEssentialData = async () => {
    await Promise.all([
      prefetchAppointments(),
      prefetchPatients(),
      prefetchDoctors(),
    ]);
  };

  return {
    prefetchAppointments,
    prefetchPatients,
    prefetchDoctors,
    prefetchConsultationData,
    prefetchAllEssentialData,
  };
};