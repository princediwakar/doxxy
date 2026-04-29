"use client";
import { useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { parseISO, isToday, isFuture, isPast, format } from "date-fns";
import { queryKeys } from "@/lib/query-keys";
import { usePayments } from "./usePayments";
import { useAppointmentFilters } from "./useAppointmentFilters";
import { useAppointmentActions } from "./useAppointmentActions";
import {
  AppointmentWithDetails,
  AppointmentFilter,
  APPOINTMENT_STATUS,
  UseAppointmentsReturn,
} from "@/types/appointments";

const supabase = getSupabase();
const ITEMS_PER_PAGE = 10;

const getTimestamp = (dateStr: string) => new Date(dateStr).getTime();

const sortList = (list: AppointmentWithDetails[], filter: AppointmentFilter): AppointmentWithDetails[] => {
  return [...list].sort((a, b) => {
    const timeA = getTimestamp(a.date);
    const timeB = getTimestamp(b.date);

    if (filter === "today") {
      const urgencyOrder: Record<string, number> = {
        [APPOINTMENT_STATUS.SCHEDULED]: 0,
        [APPOINTMENT_STATUS.IN_PROGRESS]: 1,
        [APPOINTMENT_STATUS.COMPLETED]: 2,
        [APPOINTMENT_STATUS.CANCELLED]: 3,
      };
      const urgencyA = urgencyOrder[a.status] ?? 99;
      const urgencyB = urgencyOrder[b.status] ?? 99;
      if (urgencyA !== urgencyB) return urgencyA - urgencyB;
      return a.time.localeCompare(b.time);
    }

    if (filter === "upcoming") {
      if (timeA !== timeB) return timeA - timeB;
      return a.time.localeCompare(b.time);
    }

    if (filter === "past") {
      if (timeA !== timeB) return timeB - timeA;
      return b.time.localeCompare(a.time);
    }

    if (timeA !== timeB) return timeB - timeA;
    return b.time.localeCompare(a.time);
  });
};

const fetchAppointments = async (clinicId: string | undefined, searchTerm: string) => {
  if (!clinicId) return { all: [], today: [], upcoming: [], past: [], totalCount: 0 };

  const { data, error } = await supabase
    .rpc("get_appointments_with_details_by_clinic", { clinic_id: clinicId });

  if (error) throw error;

  let filteredData = data || [];

  if (searchTerm.trim()) {
    const lowerTerm = searchTerm.toLowerCase();
    filteredData = filteredData.filter((app: AppointmentWithDetails) => {
      const readableDate = format(parseISO(app.date), "yyyy-MM-dd").toLowerCase();
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

  filteredData.forEach((app: AppointmentWithDetails) => {
    const dateObj = parseISO(app.date);
    if (isToday(dateObj)) today.push(app);
    else if (isFuture(dateObj)) upcoming.push(app);
    else if (isPast(dateObj)) past.push(app);
  });

  return {
    all: sortList(filteredData, "all"),
    today: sortList(today, "today"),
    upcoming: sortList(upcoming, "upcoming"),
    past: sortList(past, "past"),
    totalCount: filteredData.length,
  };
};

export const useAppointments = (): UseAppointmentsReturn => {
  const { activeClinic, loading: authLoading } = useAuth();
  const { canBookAppointment } = usePayments();
  const queryClient = useQueryClient();

  const {
    searchTerm, setSearchTerm, debouncedSearch,
    activeTab, setActiveTab,
    selectedDoctorId, setSelectedDoctorId,
    currentPage, handlePageChange, hasAutoSelected,
  } = useAppointmentFilters();

  const {
    cancelAppointmentMutation,
    checkInAppointmentMutation,
    handleStartConsultation: startConsultation,
  } = useAppointmentActions();

  const { data, isLoading, error } = useQuery({
    queryKey: [...queryKeys.appointments.byClinic(activeClinic?.clinic_id ?? ""), debouncedSearch],
    queryFn: () => fetchAppointments(activeClinic?.clinic_id, debouncedSearch),
    enabled: !!activeClinic?.clinic_id && !authLoading,
    placeholderData: (previousData) => previousData,
  });

  const rawAppointments = useMemo(
    () => data || { all: [], today: [], upcoming: [], past: [], totalCount: 0 },
    [data]
  );

  const filterByDoctor = useCallback(
    (list: AppointmentWithDetails[]) => {
      if (!selectedDoctorId) return list;
      return list.filter((app) => app.doctor_id === selectedDoctorId);
    },
    [selectedDoctorId]
  );

  const filteredAppointments = useMemo(
    () => ({
      today: filterByDoctor(rawAppointments.today),
      upcoming: filterByDoctor(rawAppointments.upcoming),
      past: filterByDoctor(rawAppointments.past),
      all: filterByDoctor(rawAppointments.all),
      totalCount: rawAppointments.totalCount,
    }),
    [rawAppointments, filterByDoctor]
  );

  const getPaginatedAppointments = (list: AppointmentWithDetails[], page: number) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return list.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const getTotalPages = (list: AppointmentWithDetails[]) => Math.ceil(list.length / ITEMS_PER_PAGE);

  const handleStartConsultation = async (appointmentId: string): Promise<boolean> => {
    return startConsultation(appointmentId, canBookAppointment);
  };

  return {
    appointments: filteredAppointments,
    isLoading,
    error: error as Error | null,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    selectedDoctorId,
    setSelectedDoctorId,
    currentPage,
    handlePageChange,
    getPaginatedAppointments,
    getTotalPages,
    itemsPerPage: ITEMS_PER_PAGE,
    handleCancelAppointment: (id: string) => cancelAppointmentMutation.mutate(id),
    handleStartConsultation,
    handleCheckIn: (id: string) => checkInAppointmentMutation.mutate(id),
    checkInLoading: checkInAppointmentMutation.isPending,
    refreshAppointments: () => queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all }),
    cancelLoading: cancelAppointmentMutation.isPending,
    updateStatusLoading: false,
    hasAutoSelected,
  };
};
