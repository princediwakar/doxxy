"use client";
import { logger } from "@/lib/logger";

import { useState, useCallback, useRef, useEffect } from "react";
import { getSupabase } from "@/integrations/supabase/client";
import { User, RealtimeChannel } from "@supabase/supabase-js";
import type { DbClinic, UserRole } from "@/types/core";
import { fetchClinicData } from "@/lib/fetch-clinic-data";

const supabase = getSupabase();

export type ClinicMemberWithClinic = {
  id: string;
  user_id: string;
  clinic_id: string;
  role: UserRole;
  department_id: string | null;
  created_at: string;
  clinics: DbClinic | null;
  clinic_name?: string;
  joined_at?: string;
};

export const useClinicData = () => {
  const [clinicLoading, setClinicLoading] = useState(false);
  const [userClinics, setUserClinics] = useState<ClinicMemberWithClinic[]>([]);
  const [activeClinic, setActiveClinicState] = useState<ClinicMemberWithClinic | null>(null);
  const [hasDoctorProfile, setHasDoctorProfile] = useState<boolean | undefined>(undefined);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const isFetchingRef = useRef(false);
  const subscriptionRef = useRef<RealtimeChannel | null>(null);
  const currentUserRef = useRef<User | null>(null);

  const activeClinicRole = activeClinic ? activeClinic.role : null;

  const checkDoctorProfile = useCallback(async (userId: string, clinicId: string | null): Promise<boolean> => {
    if (!clinicId) {
      setHasDoctorProfile(false);
      setDoctorId(null);
      return false;
    }

    try {
      if (process.env.NODE_ENV === "development") logger.log("Checking doctor profile for user:", userId, "in clinic:", clinicId);

      const { data: doctorProfile, error } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', userId)
        .eq('clinic_id', clinicId)
        .maybeSingle();

      if (error) {
        logger.error("Error checking doctor profile:", error);
        setHasDoctorProfile(false);
        setDoctorId(null);
        return false;
      }

      const profileExists = !!doctorProfile;
      if (process.env.NODE_ENV === "development") logger.log("Doctor profile check result:", profileExists);
      setHasDoctorProfile(profileExists);
      setDoctorId(doctorProfile?.id ?? null);
      return profileExists;
    } catch (error) {
      logger.error("Exception in doctor profile check:", error);
      setHasDoctorProfile(false);
      setDoctorId(null);
      return false;
    }
  }, []);

  const setActiveClinicId = useCallback((clinicId: string | null, user: User | null) => {
    if (clinicId === null) {
      setActiveClinicState(null);
      setHasDoctorProfile(undefined);
      setDoctorId(null);
      localStorage.removeItem('activeClinicId');
      if (process.env.NODE_ENV === "development") logger.log("Cleared active clinic.");
    } else {
      setUserClinics(currentUserClinics => {
        const selectedClinic = currentUserClinics.find(clinic => clinic.clinic_id === clinicId);
        if (selectedClinic) {
          setActiveClinicState(selectedClinic);
          localStorage.setItem('activeClinicId', selectedClinic.clinic_id);
          if (process.env.NODE_ENV === "development") logger.log("Set active clinic:", selectedClinic.clinics?.name);

          if (user?.id && (selectedClinic.role === 'superadmin' || selectedClinic.role === 'doctor')) {
            checkDoctorProfile(user.id, selectedClinic.clinic_id);
          } else {
            setHasDoctorProfile(false);
            setDoctorId(null);
          }
        } else {
          setHasDoctorProfile(undefined);
          localStorage.removeItem('activeClinicId');
          if (process.env.NODE_ENV === "development") logger.log("Clinic ID not found in userClinics, cleared local storage.");
        }
        return currentUserClinics;
      });
    }
  }, [checkDoctorProfile]);

  const fetchUserAndClinicData = useCallback(async (
    userFromSession: User | null,
    checkProfileCompletion: (userId: string) => Promise<boolean>,
    _retryCount = 0
  ) => {
    await fetchClinicData(userFromSession, checkProfileCompletion, {
      setClinicLoading,
      setUserClinics,
      setActiveClinicState,
      setHasDoctorProfile,
      isFetchingRef,
      checkDoctorProfile,
    });
  }, [checkDoctorProfile]);

  const clearClinicData = useCallback(() => {
    setUserClinics([]);
    setActiveClinicState(null);
    setHasDoctorProfile(undefined);
    localStorage.removeItem('activeClinicId');
    isFetchingRef.current = false;

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
  }, []);

  const setupRealtimeSubscription = useCallback((user: User | null) => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (!user) return;

    if (process.env.NODE_ENV === "development") logger.log('Setting up real-time subscription for user clinic membership changes');

    subscriptionRef.current = supabase
      .channel('clinic-membership-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'clinic_members',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        if (process.env.NODE_ENV === "development") logger.log('Real-time: New clinic membership created:', payload);
        if (currentUserRef.current) {
          fetchUserAndClinicData(currentUserRef.current, async () => true, 0);
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'clinic_members',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        if (process.env.NODE_ENV === "development") logger.log('Real-time: Clinic membership updated:', payload);
        if (currentUserRef.current) {
          fetchUserAndClinicData(currentUserRef.current, async () => true, 0);
        }
      })
      .subscribe((status) => {
        if (process.env.NODE_ENV === "development") logger.log('Real-time subscription status:', status);
      });
  }, [fetchUserAndClinicData]);

  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  return {
    clinicLoading,
    userClinics,
    activeClinic,
    activeClinicRole,
    hasDoctorProfile,
    doctorId,
    setActiveClinicId,
    fetchUserAndClinicData,
    checkDoctorProfile,
    clearClinicData,
    setupRealtimeSubscription,
    currentUserRef,
  };
};
