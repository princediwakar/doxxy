import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from "@/integrations/supabase/types";
import { parseISO, isToday, isFuture, isPast } from 'date-fns';
import { toast } from 'sonner';
import { usePayments } from './usePayments';

const supabase = getSupabase();

export type AppointmentWithDetails = Database['public']['Functions']['get_appointments_with_details_by_clinic']['Returns'][0];
export type AppointmentFilter = 'today' | 'upcoming' | 'past';

// Enhanced sorting function to prioritize appointments properly
const sortAppointments = (appointments: AppointmentWithDetails[], filter: AppointmentFilter) => {
  return appointments.sort((a, b) => {
    const aDate = parseISO(a.date);
    const bDate = parseISO(b.date);
    
    if (filter === 'today') {
      // For today's appointments, prioritize by urgency and time
      const urgencyOrder = { 'Scheduled': 0, 'In Progress': 1, 'Completed': 2, 'Cancelled': 3 };
      const aUrgency = urgencyOrder[a.status] ?? 999;
      const bUrgency = urgencyOrder[b.status] ?? 999;
      
      if (aUrgency !== bUrgency) {
        return aUrgency - bUrgency;
      }
      
      // If same urgency, sort by time
      return a.time.localeCompare(b.time);
    } else if (filter === 'upcoming') {
      // For upcoming appointments, sort by date then time
      if (aDate.getTime() !== bDate.getTime()) {
        return aDate.getTime() - bDate.getTime();
      }
      return a.time.localeCompare(b.time);
    } else {
      // For past appointments, show most recent first
      if (aDate.getTime() !== bDate.getTime()) {
        return bDate.getTime() - aDate.getTime();
      }
      return b.time.localeCompare(a.time);
    }
  });
};

const fetchAppointments = async (clinicId: string | undefined, searchTerm: string) => {
  if (!clinicId) {
    console.warn("No clinicId provided to fetchAppointments.");
    return { all: [], today: [], upcoming: [], past: [], totalCount: 0 };
  }
  // Using the RPC to get appointments with patient and doctor names
  const { data, error } = await supabase
    .rpc('get_appointments_with_details_by_clinic', { clinic_id: clinicId });

  if (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }

  console.log('Appointments data from RPC:', data);

  // Check for duplicate appointment IDs
  if (data) {
    const appointmentIds = data.map(app => app.id);
    const uniqueIds = [...new Set(appointmentIds)];
    if (appointmentIds.length !== uniqueIds.length) {
      console.warn('Duplicate appointments detected in RPC response:', {
        total: appointmentIds.length,
        unique: uniqueIds.length,
        duplicates: appointmentIds.filter((id, index) => appointmentIds.indexOf(id) !== index)
      });
    }
  }

  let filteredData = data || [];

  if (searchTerm.trim()) {
    const lowerSearchTerm = searchTerm.toLowerCase();
    filteredData = filteredData.filter(app =>
      app.patient_name.toLowerCase().includes(lowerSearchTerm) ||
      app.doctor_name.toLowerCase().includes(lowerSearchTerm) ||
      app.date.includes(lowerSearchTerm) // Simple date search
    );
  }

  const todayAppointments = filteredData.filter(app => isToday(parseISO(app.date)));
  const upcomingAppointments = filteredData.filter(app => isFuture(parseISO(app.date)));
  const pastAppointments = filteredData.filter(app => isPast(parseISO(app.date)) && !isToday(parseISO(app.date)));

  return {
    all: filteredData,
    today: sortAppointments(todayAppointments, 'today'),
    upcoming: sortAppointments(upcomingAppointments, 'upcoming'),
    past: sortAppointments(pastAppointments, 'past'),
    totalCount: filteredData.length
  };
};

export const useAppointments = () => {
  const { activeClinic, activeClinicRole, user, hasDoctorProfile, loading: authLoading } = useAuth();
  const { deductCreditsForAppointment } = usePayments();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<AppointmentFilter>('today');
  const [currentPage, setCurrentPage] = useState<Record<AppointmentFilter, number>>({
    today: 1,
    upcoming: 1,
    past: 1
  });
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  const itemsPerPage = 10;

  // Fetch current user's doctor profile for auto-selection
  const { data: currentUserDoctorProfile } = useQuery({
    queryKey: ['currentUserDoctorProfile', activeClinic?.clinic_id, user?.id],
    queryFn: async () => {
      if (!user?.id || !activeClinic?.clinic_id) return null;

      const { data, error } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .eq('clinic_id', activeClinic.clinic_id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching current user doctor profile:', error);
        return null;
      }

      return data;
    },
    enabled: !!user?.id && !!activeClinic?.clinic_id && (activeClinicRole === 'doctor' || (activeClinicRole === 'superadmin' && hasDoctorProfile)),
  });

  // Auto-select current user's doctor profile when appropriate
  useEffect(() => {
    // Only auto-select if:
    // 1. User has a doctor profile (doctor role or superadmin with doctor profile)
    // 2. We have the doctor profile data
    // 3. No doctor is currently selected
    if (currentUserDoctorProfile?.id && !selectedDoctorId) {
      console.log('Auto-selecting current user doctor profile:', currentUserDoctorProfile.id);
      setSelectedDoctorId(currentUserDoctorProfile.id);
    }
  }, [currentUserDoctorProfile, selectedDoctorId]);

  // Fetch appointments data
  const { data, isLoading, error } = useQuery({
    queryKey: ['appointments', activeClinic?.clinics?.id, searchTerm],
    queryFn: () => fetchAppointments(activeClinic?.clinics?.id || '', searchTerm),
    enabled: !!activeClinic?.clinics?.id && !authLoading,
    retry: 1,
  });

  const appointments = useMemo(() => 
    data || { all: [], today: [], upcoming: [], past: [], totalCount: 0 }, 
    [data]
  );

  // Filter appointments based on selected doctor
  const getFilteredAppointments = useCallback((appointmentList: AppointmentWithDetails[]) => {
    // Apply doctor filter if selected
    if (selectedDoctorId) {
      return appointmentList.filter(app => app.doctor_id === selectedDoctorId);
    }
    return appointmentList;
  }, [selectedDoctorId]);

  const filteredAppointments = useMemo(() => ({
    today: getFilteredAppointments(appointments.today),
    upcoming: getFilteredAppointments(appointments.upcoming),
    past: getFilteredAppointments(appointments.past),
    all: getFilteredAppointments(appointments.all)
  }), [appointments, getFilteredAppointments]);

  // Pagination logic
  const getPaginatedAppointments = (appointmentList: AppointmentWithDetails[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    return appointmentList.slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = (appointmentList: AppointmentWithDetails[]) => {
    return Math.ceil(appointmentList.length / itemsPerPage);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as AppointmentFilter);
  };

  const handlePageChange = (tab: AppointmentFilter, page: number) => {
    setCurrentPage(prev => ({ ...prev, [tab]: page }));
  };

  // Cancel appointment mutation
  const cancelAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'Cancelled' })
        .eq('id', appointmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', activeClinic?.clinics?.id] });
      toast.success('Appointment cancelled successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel appointment');
    },
  });

  // Update appointment status mutation
  const updateAppointmentStatusMutation = useMutation({
    mutationFn: async ({ appointmentId, status }: { appointmentId: string; status: Database['public']['Enums']['appointment_status'] }) => {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', activeClinic?.clinics?.id] });
      toast.success('Appointment status updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update appointment status');
    },
  });

  const handleCancelAppointment = (appointmentId: string) => {
    cancelAppointmentMutation.mutate(appointmentId);
  };

  const handleStartConsultation = async (appointmentId: string) => {
    try {
      console.log('handleStartConsultation called with role:', activeClinicRole, 'clinic:', activeClinic?.clinic_id);

      // First check if consultation already exists
      const { data: existingConsultation, error: consultationError } = await supabase
        .from('consultations')
        .select('id')
        .eq('appointment_id', appointmentId)
        .maybeSingle();

      // If consultation already exists, just navigate to consultation page
      if (existingConsultation && !consultationError) {
        // Update appointment status to "In Progress" without showing success toast
        await supabase
          .from('appointments')
          .update({ status: 'In Progress' })
          .eq('id', appointmentId);
        return;
      }

      // For non-superadmin users, check credits and deduct one credit
      if (activeClinicRole !== 'superadmin') {
        console.log('Performing credit check and deduction for role:', activeClinicRole);

        // Check if clinic has sufficient credits - use direct query only
        if (!activeClinic?.clinic_id) {
          toast.error("Clinic ID not found", {
            description: "Unable to verify credits. Please try again or contact support."
          });
          return;
        }

        const { data: clinicCredits, error: creditsError } = await supabase
          .from('clinic_credits')
          .select('credit_balance')
          .eq('clinic_id', activeClinic.clinic_id)
          .maybeSingle();

        console.log('Direct clinic_credits query result:', { clinicCredits, creditsError, clinicId: activeClinic?.clinic_id });

        if (creditsError) {
          console.warn('Failed to fetch clinic credits:', creditsError);
          toast.error("Payment system error", {
            description: "Unable to verify credits. Please try again or contact support."
          });
          return;
        }

        if (!clinicCredits || (clinicCredits.credit_balance || 0) < 1) {
          console.log('Insufficient credits:', clinicCredits?.credit_balance);
          toast.error("Insufficient credits", {
            description: "You don't have enough credits to start this consultation. Please purchase more credits."
          });
          return;
        }

        console.log('Direct query shows sufficient credits:', clinicCredits?.credit_balance);

        // Deduct one credit for this consultation
        await deductCreditsForAppointment.mutateAsync({
          appointmentId,
          creditsToDeduct: 1
        });
      } else {
        console.log('Skipping credit check and deduction for superadmin');
      }

      // Create consultation record
      const { error: createConsultationError } = await supabase
        .from('consultations')
        .insert({
          appointment_id: appointmentId,
          clinic_id: activeClinic?.clinic_id || '',
          patient_id: (await supabase.from('appointments').select('patient_id').eq('id', appointmentId).single()).data?.patient_id || '',
          doctor_id: (await supabase.from('appointments').select('doctor_id').eq('id', appointmentId).single()).data?.doctor_id || null,
          specialty_data: {},
          clinical_notes: {}
        });

      if (createConsultationError) {
        console.error('Failed to create consultation record:', createConsultationError);
        toast.error('Failed to create consultation record');
        return;
      }

      // Update appointment status to "In Progress" without showing success toast
      await supabase
        .from('appointments')
        .update({ status: 'In Progress' })
        .eq('id', appointmentId);

    } catch (error) {
      console.error('Failed to start consultation:', error);
      toast.error('Failed to start consultation', {
        description: 'Please try again or contact support if the issue persists.'
      });
    }
  };

  const refreshAppointments = () => {
    queryClient.invalidateQueries({ queryKey: ['appointments', activeClinic?.clinics?.id] });
  };

  return {
    // Data
    appointments: filteredAppointments,
    isLoading,
    error,

    // Search and filtering
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab: handleTabChange,

    // Doctor selection
    selectedDoctorId,
    setSelectedDoctorId,

    // Pagination
    currentPage,
    handlePageChange,
    getPaginatedAppointments,
    getTotalPages,
    itemsPerPage,

    // Actions
    handleCancelAppointment,
    handleStartConsultation,
    refreshAppointments,

    // Loading states
    cancelLoading: cancelAppointmentMutation.isPending,
    updateStatusLoading: updateAppointmentStatusMutation.isPending,
  };
}; 