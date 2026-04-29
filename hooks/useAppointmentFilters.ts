"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { AppointmentFilter } from "@/types/appointments";

const supabase = getSupabase();

export function useAppointmentFilters() {
  const { activeClinic, activeClinicRole, user, hasDoctorProfile } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [activeTab, setActiveTab] = useState<AppointmentFilter>("today");
  const [currentPage, setCurrentPage] = useState<Record<AppointmentFilter, number>>({
    today: 1, upcoming: 1, past: 1, all: 1,
  });
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  const { data: currentUserDoctorProfile } = useQuery({
    queryKey: ["appointmentFilterCurrentDoctor", activeClinic?.clinic_id, user?.id],
    queryFn: async () => {
      if (!user?.id || !activeClinic?.clinic_id) return null;
      const { data, error } = await supabase
        .from("doctors")
        .select("id")
        .eq("user_id", user.id)
        .eq("clinic_id", activeClinic.clinic_id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled:
      !!user?.id &&
      !!activeClinic?.clinic_id &&
      (activeClinicRole === "doctor" ||
        (activeClinicRole === "superadmin" && hasDoctorProfile)),
  });

  useEffect(() => {
    if (currentUserDoctorProfile?.id && !selectedDoctorId && !hasAutoSelected) {
      setSelectedDoctorId(currentUserDoctorProfile.id);
      setHasAutoSelected(true);
    }
  }, [currentUserDoctorProfile, selectedDoctorId, hasAutoSelected]);

  const handlePageChange = (tab: AppointmentFilter, page: number) => {
    setCurrentPage((prev) => ({ ...prev, [tab]: page }));
  };

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearch,
    activeTab,
    setActiveTab,
    selectedDoctorId,
    setSelectedDoctorId,
    currentPage,
    handlePageChange,
    hasAutoSelected,
  };
}
