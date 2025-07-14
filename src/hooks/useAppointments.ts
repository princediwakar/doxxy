import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from "@/integrations/supabase/types";
import { parseISO, isToday, isFuture, isPast } from 'date-fns';
import { toast } from 'sonner';

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
  const { user, activeClinic, activeClinicRole, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<AppointmentFilter>('today');
  const [currentPage, setCurrentPage] = useState<Record<AppointmentFilter, number>>({
    today: 1,
    upcoming: 1,
    past: 1
  });

  const itemsPerPage = 10;

  // Fetch appointments data
  const { data, isLoading, error } = useQuery({
    queryKey: ['appointments', activeClinic?.clinics?.id, searchTerm],
    queryFn: () => fetchAppointments(activeClinic!.clinics?.id, searchTerm),
    enabled: !!activeClinic?.clinics?.id && !authLoading,
    retry: 1,
  });

  const appointments = useMemo(() => 
    data || { all: [], today: [], upcoming: [], past: [], totalCount: 0 }, 
    [data]
  );

  // Filter appointments for doctors if necessary
  const getFilteredAppointments = useCallback((appointmentList: AppointmentWithDetails[]) => {
    return activeClinicRole === 'doctor'
      ? appointmentList.filter(app => app.doctor_id === user?.id)
      : appointmentList;
  }, [activeClinicRole, user?.id]);

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

  const handleStartConsultation = (appointmentId: string) => {
    updateAppointmentStatusMutation.mutate({ appointmentId, status: 'In Progress' });
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