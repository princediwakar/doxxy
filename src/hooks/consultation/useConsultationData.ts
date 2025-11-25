import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/integrations/supabase/client';

export const useConsultationData = (appointmentId: string | undefined) => {
  const { activeClinic } = useAuth();
  const supabase = getSupabase();

  // Fetch appointment data with department information
  const appointmentQuery = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: async () => {
      if (!appointmentId || !activeClinic?.clinic_id) return null;
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(*),
          doctor:doctors(user_id, name)
        `)
        .eq('id', appointmentId)
        .eq('clinic_id', activeClinic.clinic_id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!appointmentId && !!activeClinic?.clinic_id,
  });

  // Fetch patient's previous consultations for medical history
  const previousConsultationsQuery = useQuery({
    queryKey: ['patient-consultations', appointmentQuery.data?.patient?.id],
    queryFn: async () => {
      if (!appointmentQuery.data?.patient?.id || !activeClinic?.clinic_id) return [];
      
      let query = supabase
        .from('consultations')
        .select(`
          *,
          appointment:appointments(date, time)
        `)
        .eq('patient_id', appointmentQuery.data.patient.id)
        .eq('clinic_id', activeClinic.clinic_id);

      // Only exclude current consultation if appointmentId is defined
      if (appointmentId) {
        query = query.neq('appointment_id', appointmentId);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!appointmentQuery.data?.patient?.id && !!activeClinic?.clinic_id,
  });

  // Fetch patient's recent prescriptions
  const recentPrescriptionsQuery = useQuery({
    queryKey: ['patient-prescriptions', appointmentQuery.data?.patient?.id],
    queryFn: async () => {
      if (!appointmentQuery.data?.patient?.id || !activeClinic?.clinic_id) return [];
      
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', appointmentQuery.data.patient.id)
        .eq('clinic_id', activeClinic.clinic_id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data || [];
    },
    enabled: !!appointmentQuery.data?.patient?.id && !!activeClinic?.clinic_id,
  });
  
  // Fetch clinic details
  const clinicDetailsQuery = useQuery({
    queryKey: ['clinic', activeClinic?.clinics?.id],
    queryFn: async () => {
      if (!activeClinic?.clinics?.id) return null;
      
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', activeClinic.clinics?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!activeClinic?.clinics?.id,
  });

  // Fetch doctor details
  const doctorDetailsQuery = useQuery({
    queryKey: ['doctor', appointmentQuery.data?.doctor?.user_id],
    queryFn: async () => {
      if (!appointmentQuery.data?.doctor?.user_id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', appointmentQuery.data.doctor.user_id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!appointmentQuery.data?.doctor?.user_id,
  });

  // Fetch existing consultation data
  const existingConsultationQuery = useQuery({
    queryKey: ['consultation', appointmentId],
    queryFn: async () => {
      if (!appointmentId || !activeClinic?.clinic_id) return null;
      
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('appointment_id', appointmentId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!appointmentId && !!activeClinic?.clinic_id,
  });

  // Fetch department information separately
  const departmentInfoQuery = useQuery({
    queryKey: ['doctorDepartment', appointmentQuery.data?.doctor?.user_id, activeClinic?.clinic_id],
    queryFn: async () => {
      if (!appointmentQuery.data?.doctor?.user_id || !activeClinic?.clinic_id) return null;

      const { data, error } = await supabase
        .from('clinic_members')
        .select(`
          department_id,
          clinic_departments(
            department_types(name)
          )
        `)
        .eq('user_id', appointmentQuery.data.doctor.user_id)
        .eq('clinic_id', activeClinic.clinic_id)
        .single();

      if (error) {
        console.log('No department found for doctor:', error);
        return null;
      }
      return data;
    },
    enabled: !!appointmentQuery.data?.doctor?.user_id && !!activeClinic?.clinic_id,
  });

  return {
    appointment: appointmentQuery.data,
    appointmentLoading: appointmentQuery.isLoading,
    previousConsultations: previousConsultationsQuery.data,
    recentPrescriptions: recentPrescriptionsQuery.data,
    clinicDetails: clinicDetailsQuery.data,
    doctorDetails: doctorDetailsQuery.data,
    existingConsultation: existingConsultationQuery.data,
    departmentInfo: departmentInfoQuery.data,
    // Additional loading states for better UX
    existingConsultationLoading: existingConsultationQuery.isLoading,
    departmentInfoLoading: departmentInfoQuery.isLoading,
  };
}; 