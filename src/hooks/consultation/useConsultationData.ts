// src/hooks/consultation/useConsultationData.ts
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/integrations/supabase/client';
import { ConsultationNotes } from '@/lib/consultationNotesSchemas';

export const useConsultationData = (appointmentId: string | undefined) => {
  const { activeClinic } = useAuth();
  const supabase = getSupabase();

  // Primary parallel query - fetch all essential data in one go
  const consultationDataQuery = useQuery({
    queryKey: ['consultation-data', appointmentId, activeClinic?.clinic_id],
    queryFn: async () => {
      if (!appointmentId || !activeClinic?.clinic_id) return null;

      // Execute all queries in parallel
      const [
        appointmentResult,
        existingConsultationResult,
        clinicDetailsResult
      ] = await Promise.all([
        // Fetch appointment with patient and doctor info
        supabase
          .from('appointments')
          .select(`
            *,
            patient:patients(*),
            doctor:doctors(user_id, name)
          `)
          .eq('id', appointmentId)
          .eq('clinic_id', activeClinic.clinic_id)
          .single(),

        // Fetch existing consultation
        supabase
          .from('consultations')
          .select('*')
          .eq('appointment_id', appointmentId)
          .maybeSingle(),

        // Fetch clinic details
        activeClinic.clinics?.id
          ? supabase
              .from('clinics')
              .select('*')
              .eq('id', activeClinic.clinics.id)
              .single()
          : Promise.resolve({ data: null, error: null })
      ]);

      // Check for errors in primary queries
      if (appointmentResult.error) throw appointmentResult.error;
      if (existingConsultationResult.error) throw existingConsultationResult.error;
      if (clinicDetailsResult.error) throw clinicDetailsResult.error;

      const appointmentData = appointmentResult.data;
      const patientId = appointmentData?.patient?.id;

      if (!patientId) {
        return {
          appointment: appointmentData,
          existingConsultation: existingConsultationResult.data,
          clinicDetails: clinicDetailsResult.data,
          previousConsultations: [],
          recentPrescriptions: [],
          doctorDetails: null,
          departmentInfo: null
        };
      }

      // Secondary parallel queries - fetch patient-related data
      const [
        previousConsultationsResult,
        recentPrescriptionsResult,
        doctorDetailsResult,
        departmentInfoResult
      ] = await Promise.all([
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

        // Fetch doctor details
        appointmentData?.doctor?.user_id
          ? supabase
              .from('profiles')
              .select('*')
              .eq('id', appointmentData.doctor.user_id)
              .single()
          : Promise.resolve({ data: null, error: null }),

        // Fetch department information
        appointmentData?.doctor?.user_id && activeClinic?.clinic_id
          ? supabase
              .from('clinic_members')
              .select(`
                department_id,
                clinic_departments(
                  department_types(name)
                )
              `)
              .eq('user_id', appointmentData.doctor.user_id)
              .eq('clinic_id', activeClinic.clinic_id)
              .single()
          : Promise.resolve({ data: null, error: null })
      ]);

      // Check for errors in secondary queries
      if (previousConsultationsResult.error) throw previousConsultationsResult.error;
      if (recentPrescriptionsResult.error) throw recentPrescriptionsResult.error;
      if (doctorDetailsResult.error && doctorDetailsResult.error.code !== 'PGRST116') throw doctorDetailsResult.error;
      if (departmentInfoResult.error && departmentInfoResult.error.code !== 'PGRST116') throw departmentInfoResult.error;

      // Transform previous consultations data
      const previousConsultations = (previousConsultationsResult.data || []).map(consultation => ({
        ...consultation,
        specialty_data: consultation.specialty_data as ConsultationNotes | null,
        appointment: consultation.appointment ? {
          date: consultation.appointment.date,
          time: consultation.appointment.time,
          doctor_name: 'Previous Doctor',
          department_name: 'Previous Department'
        } : null
      }));

      // Transform department info data
      const departmentInfo = departmentInfoResult.data?.clinic_departments?.department_types ? {
        name: departmentInfoResult.data.clinic_departments.department_types.name,
        description: undefined,
        clinic_departments: departmentInfoResult.data.clinic_departments
      } : null;

      return {
        appointment: appointmentData,
        existingConsultation: existingConsultationResult.data,
        clinicDetails: clinicDetailsResult.data,
        previousConsultations,
        recentPrescriptions: recentPrescriptionsResult.data || [],
        doctorDetails: doctorDetailsResult.data,
        departmentInfo
      };
    },
    enabled: !!appointmentId && !!activeClinic?.clinic_id,
  });

  return {
    appointment: consultationDataQuery.data?.appointment,
    appointmentLoading: consultationDataQuery.isLoading,
    previousConsultations: consultationDataQuery.data?.previousConsultations || [],
    recentPrescriptions: consultationDataQuery.data?.recentPrescriptions || [],
    clinicDetails: consultationDataQuery.data?.clinicDetails,
    doctorDetails: consultationDataQuery.data?.doctorDetails,
    existingConsultation: consultationDataQuery.data?.existingConsultation,
    departmentInfo: consultationDataQuery.data?.departmentInfo,
    // Additional loading states for better UX
    existingConsultationLoading: consultationDataQuery.isLoading,
    departmentInfoLoading: consultationDataQuery.isLoading,
  };
}; 