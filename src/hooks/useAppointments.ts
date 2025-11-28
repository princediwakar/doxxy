// src/hooks/useAppointments.ts
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { parseISO, isToday, isFuture, isPast } from 'date-fns';
import { toast } from 'sonner';
import { usePayments } from './usePayments';
import type {
  AppointmentWithDetails,
  AppointmentFilter,
  AppointmentStatusUpdate
} from "@/types/appointments";

const supabase = getSupabase();

// Enhanced sorting function to prioritize appointments properly
const sortAppointments = (appointments: AppointmentWithDetails[], filter: AppointmentFilter) => {
  return appointments.sort((a, b) => {
    const aDate = parseISO(a.date);
    const bDate = parseISO(b.date);
    
    if (filter === 'today') {
      const urgencyOrder = { 'Scheduled': 0, 'In Progress': 1, 'Completed': 2, 'Cancelled': 3 };
      const aUrgency = urgencyOrder[a.status] ?? 999;
      const bUrgency = urgencyOrder[b.status] ?? 999;
      
      if (aUrgency !== bUrgency) {
        return aUrgency - bUrgency;
      }
      return a.time.localeCompare(b.time);
    } else if (filter === 'upcoming') {
      if (aDate.getTime() !== bDate.getTime()) {
        return aDate.getTime() - bDate.getTime();
      }
      return a.time.localeCompare(b.time);
    } else {
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
  const { data, error } = await supabase
    .rpc('get_appointments_with_details_by_clinic', { clinic_id: clinicId });

  if (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }

  let filteredData = data || [];

  if (searchTerm.trim()) {
    const lowerSearchTerm = searchTerm.toLowerCase();
    filteredData = filteredData.filter(app =>
      app.patient_name.toLowerCase().includes(lowerSearchTerm) ||
      app.doctor_name.toLowerCase().includes(lowerSearchTerm) ||
      app.date.includes(lowerSearchTerm)
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

export type { AppointmentWithDetails, AppointmentFilter };

export const useAppointments = () => {
  const { activeClinic, activeClinicRole, user, hasDoctorProfile, loading: authLoading } = useAuth();
  
  // Changed: We only need canBookAppointment now
  const { canBookAppointment } = usePayments();
  
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

      if (error) return null;
      return data;
    },
    enabled: !!user?.id && !!activeClinic?.clinic_id && (activeClinicRole === 'doctor' || (activeClinicRole === 'superadmin' && hasDoctorProfile)),
  });

  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  useEffect(() => {
    if (currentUserDoctorProfile?.id && !selectedDoctorId && !hasAutoSelected) {
      setSelectedDoctorId(currentUserDoctorProfile.id);
      setHasAutoSelected(true);
    }
  }, [currentUserDoctorProfile, selectedDoctorId, hasAutoSelected]);

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

  const getFilteredAppointments = useCallback((appointmentList: AppointmentWithDetails[]) => {
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
      // Invalidate billing summary too, as a cancellation might increase the available balance
      queryClient.invalidateQueries({ queryKey: ['clinic-billing-summary'] });
      toast.success('Appointment cancelled successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel appointment');
    },
  });

  const updateAppointmentStatusMutation = useMutation({
    mutationFn: async ({ appointmentId, status }: AppointmentStatusUpdate) => {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', activeClinic?.clinics?.id] });
      // Invalidate billing summary as status changes affect balance
      queryClient.invalidateQueries({ queryKey: ['clinic-billing-summary'] });
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
      console.log('handleStartConsultation called with role:', activeClinicRole);

      // 1. Check if consultation already exists
      const { data: existingConsultation, error: consultationError } = await supabase
        .from('consultations')
        .select('id')
        .eq('appointment_id', appointmentId)
        .maybeSingle();

      if (existingConsultation && !consultationError) {
        await supabase
          .from('appointments')
          .update({ status: 'In Progress' })
          .eq('id', appointmentId);
        return;
      }

      // 2. Perform Credit Check
      // Only non-superadmins are restricted by credits
      if (activeClinicRole !== 'superadmin') {
        const hasCredits = await canBookAppointment(1);
        
        if (!hasCredits) {
          toast.error("Insufficient credits", {
            description: "You don't have enough credits to start this consultation. Please purchase more credits."
          });
          return;
        }
      }

      // 3. Create consultation record
      // Note: We do NOT explicitly deduct credit here.
      // The status change to "In Progress" in step 4 will automatically count as usage.

      // Fetch appointment details in a single query to avoid N+1
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .select('patient_id, doctor_id')
        .eq('id', appointmentId)
        .single();

      if (appointmentError) {
        console.error('Failed to fetch appointment details:', appointmentError);
        toast.error('Failed to fetch appointment details');
        return;
      }

      const { error: createConsultationError } = await supabase
        .from('consultations')
        .insert({
          appointment_id: appointmentId,
          clinic_id: activeClinic?.clinic_id || '',
          patient_id: appointmentData?.patient_id || '',
          doctor_id: appointmentData?.doctor_id || null,
          specialty_data: {},
          clinical_notes: {}
        });

      if (createConsultationError) {
        console.error('Failed to create consultation record:', createConsultationError);
        toast.error('Failed to create consultation record');
        return;
      }

      // 4. Update status to "In Progress"
      // This is what effectively "Deducts" the credit in our calculated system
      const { error: statusError } = await supabase
        .from('appointments')
        .update({ status: 'In Progress' })
        .eq('id', appointmentId);

      if (statusError) throw statusError;

      // Force refresh of both lists and billing to show updated balance immediately
      queryClient.invalidateQueries({ queryKey: ['appointments', activeClinic?.clinics?.id] });
      queryClient.invalidateQueries({ queryKey: ['clinic-billing-summary'] });

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
    appointments: filteredAppointments,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab: handleTabChange,
    selectedDoctorId,
    setSelectedDoctorId,
    currentPage,
    handlePageChange,
    getPaginatedAppointments,
    getTotalPages,
    itemsPerPage,
    handleCancelAppointment,
    handleStartConsultation,
    refreshAppointments,
    cancelLoading: cancelAppointmentMutation.isPending,
    updateStatusLoading: updateAppointmentStatusMutation.isPending,
    hasAutoSelected,
  };
};