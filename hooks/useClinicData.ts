"use client";
import { logger } from "@/lib/logger";

import { useState, useCallback, useRef, useEffect } from "react";
import { getSupabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { RealtimeChannel } from "@supabase/supabase-js";
import type { DbClinic, UserRole } from "@/types/core";

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
  const isFetchingRef = useRef(false);
  const subscriptionRef = useRef<RealtimeChannel | null>(null);
  const currentUserRef = useRef<User | null>(null);

  const activeClinicRole = activeClinic ? activeClinic.role : null;

  // Function to check if user has doctor profile in active clinic
  const checkDoctorProfile = useCallback(async (userId: string, clinicId: string | null): Promise<boolean> => {
    if (!clinicId) {
      setHasDoctorProfile(false);
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
        return false;
      }

      const hasDoctorProfile = !!doctorProfile;
      if (process.env.NODE_ENV === "development") logger.log("Doctor profile check result:", hasDoctorProfile);
      setHasDoctorProfile(hasDoctorProfile);
      return hasDoctorProfile;
    } catch (error) {
      logger.error("Exception in doctor profile check:", error);
      setHasDoctorProfile(false);
      return false;
    }
  }, []);

  const setActiveClinicId = useCallback((clinicId: string | null, user: User | null) => {
    if (clinicId === null) {
      setActiveClinicState(null);
      setHasDoctorProfile(undefined);
      localStorage.removeItem('activeClinicId');
      if (process.env.NODE_ENV === "development") logger.log("Cleared active clinic.");
    } else {
      setUserClinics(currentUserClinics => {
        const selectedClinic = currentUserClinics.find(clinic => clinic.clinic_id === clinicId);
        if (selectedClinic) {
          setActiveClinicState(selectedClinic);
          localStorage.setItem('activeClinicId', selectedClinic.clinic_id);
          if (process.env.NODE_ENV === "development") logger.log("Set active clinic:", selectedClinic.clinics?.name);
          
          // Check doctor profile for superadmins when clinic changes
          if (user?.id && selectedClinic.role === 'superadmin') {
            checkDoctorProfile(user.id, selectedClinic.clinic_id);
          } else {
            setHasDoctorProfile(selectedClinic.role === 'doctor');
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
    retryCount = 0
  ) => {
    if (process.env.NODE_ENV === "development") logger.log("fetchUserAndClinicData: Starting with user:", userFromSession?.id);
    
    if (!userFromSession) {
      setUserClinics([]);
      setActiveClinicState(null);
      setHasDoctorProfile(undefined);
      localStorage.removeItem('activeClinicId');
      if (process.env.NODE_ENV === "development") logger.log("No user, cleared clinics and active clinic.");
      isFetchingRef.current = false;
      return;
    }

    await checkProfileCompletion(userFromSession.id);

    if (isFetchingRef.current) {
      if (process.env.NODE_ENV === "development") logger.log("Already fetching user clinic data, skipping duplicate call.");
      return;
    }

    setClinicLoading(true);
    isFetchingRef.current = true;
    let fetchedClinics: ClinicMemberWithClinic[] = [];
    let initialActiveClinic: ClinicMemberWithClinic | null = null;

    try {
      if (process.env.NODE_ENV === "development") logger.log("fetchUserAndClinicData: Fetching user clinic memberships using RPC");
      const { data: memberData, error: memberError } = await supabase.rpc('get_user_clinic_memberships', {
        user_id: userFromSession.id
      });

      if (memberError) {
        logger.error("fetchUserAndClinicData: Error fetching clinic members:", memberError);
        throw new Error(`RPC error: ${memberError.message}`);
      }

      if (!memberData || memberData.length === 0) {
        if (process.env.NODE_ENV === "development") logger.log("User is not a member of any clinics.");
        setUserClinics([]);
        setActiveClinicState(null);
        setHasDoctorProfile(undefined);
        localStorage.removeItem('activeClinicId');
        return;
      }

      // Get all clinic IDs to fetch in a single query
      const clinicIds = memberData.map(member => member.clinic_id);

      // Fetch all clinics in a single query
      const { data: allClinics, error: clinicsError } = await supabase
        .from('clinics')
        .select('*')
        .in('id', clinicIds);

      if (clinicsError) {
        logger.error("Error fetching clinic details:", clinicsError);
        throw new Error(`Clinics fetch error: ${clinicsError.message}`);
      }

      // Create a map for quick lookup
      const clinicMap = new Map(allClinics?.map(clinic => [clinic.id, clinic]) || []);

      // Build the clinic memberships with clinic data
      fetchedClinics = memberData.map(member => {
        const clinicData = clinicMap.get(member.clinic_id);
        if (!clinicData) {
          logger.error(`Clinic data not found for clinic ID: ${member.clinic_id}`);
          return null;
        }

        return {
          ...member,
          clinics: clinicData,
          clinic_name: clinicData.name,
          joined_at: member.joined_at
        } as ClinicMemberWithClinic;
      }).filter((clinic): clinic is ClinicMemberWithClinic => clinic !== null);

      if (fetchedClinics.length === 0) {
        logger.warn("No valid clinics found after filtering.");
        setUserClinics([]);
        setActiveClinicState(null);
        setHasDoctorProfile(undefined);
        localStorage.removeItem('activeClinicId');
        return;
      }

      setUserClinics(fetchedClinics);

      const storedClinicId = localStorage.getItem('activeClinicId');
      if (storedClinicId) {
        initialActiveClinic = fetchedClinics.find(clinic => clinic.clinic_id === storedClinicId) || null;
      }

      if (!initialActiveClinic && fetchedClinics.length > 0) {
        initialActiveClinic = fetchedClinics[0];
        localStorage.setItem('activeClinicId', fetchedClinics[0].clinic_id);
      }

      if (initialActiveClinic) {
        setActiveClinicState(initialActiveClinic);
        
        if (userFromSession.id && initialActiveClinic.role === 'superadmin') {
          await checkDoctorProfile(userFromSession.id, initialActiveClinic.clinic_id);
        } else {
          setHasDoctorProfile(initialActiveClinic.role === 'doctor');
        }
      }
    } catch (error) {
      logger.error("fetchUserAndClinicData: Error:", error);
      if (retryCount < 2) {
        if (process.env.NODE_ENV === "development") logger.log(`Retrying fetchUserAndClinicData (attempt ${retryCount + 2})`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
        await fetchUserAndClinicData(userFromSession, checkProfileCompletion, retryCount + 1);
      } else {
        logger.error("Max retries reached, clearing clinic data.");
        setUserClinics([]);
        setActiveClinicState(null);
        setHasDoctorProfile(undefined);
        localStorage.removeItem('activeClinicId');
      }
    } finally {
      setClinicLoading(false);
      isFetchingRef.current = false;
      if (process.env.NODE_ENV === "development") {
        logger.log("fetchUserAndClinicData: Completed with state:", {
          userClinicsLength: fetchedClinics.length,
          activeClinic: !!initialActiveClinic
        });
      }
    }
  }, [checkDoctorProfile]);

  const clearClinicData = useCallback(() => {
    setUserClinics([]);
    setActiveClinicState(null);
    setHasDoctorProfile(undefined);
    localStorage.removeItem('activeClinicId');
    isFetchingRef.current = false;
    
    // Clean up subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
  }, []);

  // Real-time subscription for clinic membership changes
  const setupRealtimeSubscription = useCallback((user: User | null) => {
    // Clean up existing subscription
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
        // Refresh clinic data when new membership is created
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
        // Refresh clinic data when membership is updated
        if (currentUserRef.current) {
          fetchUserAndClinicData(currentUserRef.current, async () => true, 0);
        }
      })
      .subscribe((status) => {
        if (process.env.NODE_ENV === "development") logger.log('Real-time subscription status:', status);
      });
  }, [fetchUserAndClinicData]);

  // Set up subscription when user changes
  useEffect(() => {
    return () => {
      // Clean up subscription on unmount
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  return {
    // State
    clinicLoading,
    userClinics,
    activeClinic,
    activeClinicRole,
    hasDoctorProfile,
    
    // Actions
    setActiveClinicId,
    fetchUserAndClinicData,
    checkDoctorProfile,
    clearClinicData,
    setUserClinics,
    setActiveClinicState,
    setHasDoctorProfile,
    setupRealtimeSubscription,
    
    // Refs for external access
    currentUserRef,
  };
}; 