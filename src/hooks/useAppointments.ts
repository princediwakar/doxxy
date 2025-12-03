// src/hooks/useAppointments.ts
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { parseISO, isToday, isFuture, isPast, format } from 'date-fns';
import { toast } from 'sonner';
import { usePayments } from './usePayments';
import { 
  AppointmentWithDetails, 
  AppointmentFilter, 
  APPOINTMENT_STATUS,
  UseAppointmentsReturn
} from "@/types/appointments";

const supabase = getSupabase();
const ITEMS_PER_PAGE = 10;

const getTimestamp = (dateStr: string) => new Date(dateStr).getTime();

const sortList = (list: AppointmentWithDetails[], filter: AppointmentFilter): AppointmentWithDetails[] => {
  return [...list].sort((a, b) => {
    const timeA = getTimestamp(a.date);
    const timeB = getTimestamp(b.date);

    // Today: Urgency first
    if (filter === 'today') {
      const urgencyOrder: Record<string, number> = { 
        [APPOINTMENT_STATUS.SCHEDULED]: 0, 
        [APPOINTMENT_STATUS.IN_PROGRESS]: 1, 
        [APPOINTMENT_STATUS.COMPLETED]: 2, 
        [APPOINTMENT_STATUS.CANCELLED]: 3 
      };
      
      const urgencyA = urgencyOrder[a.status] ?? 99;
      const urgencyB = urgencyOrder[b.status] ?? 99;
      
      if (urgencyA !== urgencyB) return urgencyA - urgencyB;
      return a.time.localeCompare(b.time);
    } 
    
    // Upcoming: Soonest first
    if (filter === 'upcoming') {
      if (timeA !== timeB) return timeA - timeB;
      return a.time.localeCompare(b.time);
    } 
    
    // Past: Recent first
    if (filter === 'past') {
      if (timeA !== timeB) return timeB - timeA;
      return b.time.localeCompare(a.time);
    }

    // All/Default: Recent first (Good for search results)
    if (timeA !== timeB) return timeB - timeA;
    return b.time.localeCompare(a.time);
  });
};

const fetchAppointments = async (clinicId: string | undefined, searchTerm: string) => {
  if (!clinicId) return { all: [], today: [], upcoming: [], past: [], totalCount: 0 };

  const { data, error } = await supabase
    .rpc('get_appointments_with_details_by_clinic', { clinic_id: clinicId });

  if (error) throw error;

  let filteredData = data || [];

  if (searchTerm.trim()) {
    const lowerTerm = searchTerm.toLowerCase();
    filteredData = filteredData.filter(app => {
      const readableDate = format(parseISO(app.date), 'yyyy-MM-dd').toLowerCase();
      
      return (
        app.patient_name.toLowerCase().includes(lowerTerm) ||
        app.doctor_name.toLowerCase().includes(lowerTerm) ||
        readableDate.includes(lowerTerm)
      );
    });
  }

  const today: AppointmentWithDetails[] = [];
  const upcoming: AppointmentWithDetails[] = [];
  const past: AppointmentWithDetails[] = [];

  filteredData.forEach(app => {
    const dateObj = parseISO(app.date);
    if (isToday(dateObj)) today.push(app);
    else if (isFuture(dateObj)) upcoming.push(app);
    else if (isPast(dateObj)) past.push(app);
  });

  return {
    // Sort 'all' so search results look organized (Newest first)
    all: sortList(filteredData, 'all'), 
    today: sortList(today, 'today'),
    upcoming: sortList(upcoming, 'upcoming'),
    past: sortList(past, 'past'),
    totalCount: filteredData.length
  };
};

export const useAppointments = (): UseAppointmentsReturn => {
  const { activeClinic, activeClinicRole, user, hasDoctorProfile, loading: authLoading } = useAuth();
  const { canBookAppointment } = usePayments();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); 

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [activeTab, setActiveTab] = useState<AppointmentFilter>('today');
  // Initialize 'all' for search pagination
  const [currentPage, setCurrentPage] = useState<Record<AppointmentFilter, number>>({
    today: 1, upcoming: 1, past: 1, all: 1
  });
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

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
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!activeClinic?.clinic_id && (activeClinicRole === 'doctor' || (activeClinicRole === 'superadmin' && hasDoctorProfile)),
  });

  useEffect(() => {
    if (currentUserDoctorProfile?.id && !selectedDoctorId && !hasAutoSelected) {
      setSelectedDoctorId(currentUserDoctorProfile.id);
      setHasAutoSelected(true);
    }
  }, [currentUserDoctorProfile, selectedDoctorId, hasAutoSelected]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['appointments', activeClinic?.clinic_id, debouncedSearch],
    queryFn: () => fetchAppointments(activeClinic?.clinic_id, debouncedSearch),
    enabled: !!activeClinic?.clinic_id && !authLoading,
    placeholderData: (previousData) => previousData,
  });

  const rawAppointments = useMemo(() => 
    data || { all: [], today: [], upcoming: [], past: [], totalCount: 0 }, 
    [data]
  );

  const filterByDoctor = useCallback((list: AppointmentWithDetails[]) => {
    if (!selectedDoctorId) return list;
    return list.filter(app => app.doctor_id === selectedDoctorId);
  }, [selectedDoctorId]);

  const filteredAppointments = useMemo(() => ({
    today: filterByDoctor(rawAppointments.today),
    upcoming: filterByDoctor(rawAppointments.upcoming),
    past: filterByDoctor(rawAppointments.past),
    all: filterByDoctor(rawAppointments.all),
    totalCount: rawAppointments.totalCount
  }), [rawAppointments, filterByDoctor]);

  const getPaginatedAppointments = (list: AppointmentWithDetails[], page: number) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return list.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const getTotalPages = (list: AppointmentWithDetails[]) => Math.ceil(list.length / ITEMS_PER_PAGE);

  const handlePageChange = (tab: AppointmentFilter, page: number) => {
    setCurrentPage(prev => ({ ...prev, [tab]: page }));
  };

  const handleTabChange = (tab: AppointmentFilter) => setActiveTab(tab);

  const cancelAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      const { error } = await supabase
        .from('appointments')
        .update({ status: APPOINTMENT_STATUS.CANCELLED })
        .eq('id', appointmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['clinic-billing-summary'] });
      toast.success('Appointment cancelled');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleStartConsultation = async (appointmentId: string): Promise<boolean> => {
    try {
      if (!appointmentId) throw new Error('Invalid appointment ID');
      if (!activeClinic?.clinic_id) throw new Error('Clinic ID not found');

      const { data: existing, error: checkError } = await supabase
        .from('consultations')
        .select('id')
        .eq('appointment_id', appointmentId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        const { error: updateError } = await supabase
          .from('appointments')
          .update({ status: APPOINTMENT_STATUS.IN_PROGRESS })
          .eq('id', appointmentId);
        if (updateError) throw updateError;
        return true;
      }

      if (activeClinicRole !== 'superadmin') {
        const hasCredits = await canBookAppointment(1);
        if (!hasCredits) {
          throw new Error("Insufficient credits. Please purchase more.");
        }
      }

      const { data: appData, error: appError } = await supabase
        .from('appointments')
        .select('patient_id, doctor_id')
        .eq('id', appointmentId)
        .single();

      if (appError) throw appError;

      const { error: insertError } = await supabase
        .from('consultations')
        .insert({
          appointment_id: appointmentId,
          clinic_id: activeClinic.clinic_id,
          patient_id: appData.patient_id,
          doctor_id: appData.doctor_id,
          specialty_data: {},
          clinical_notes: {}
        });

      if (insertError) throw insertError;

      const { error: statusError } = await supabase
        .from('appointments')
        .update({ status: APPOINTMENT_STATUS.IN_PROGRESS })
        .eq('id', appointmentId);

      if (statusError) throw statusError;

      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['clinic-billing-summary'] });
      return true;

    } catch (err: unknown) {
      console.error('Consultation Start Failed:', err);
      const message = err instanceof Error ? err.message : 'Failed to start consultation';
      toast.error(message);
      throw err;
    }
  };

  return {
    appointments: filteredAppointments,
    isLoading,
    error: error as Error | null,
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
    itemsPerPage: ITEMS_PER_PAGE,
    handleCancelAppointment: (id) => cancelAppointmentMutation.mutate(id),
    handleStartConsultation,
    refreshAppointments: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
    cancelLoading: cancelAppointmentMutation.isPending,
    updateStatusLoading: false,
    hasAutoSelected,
  };
};