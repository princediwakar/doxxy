import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo, useRef } from "react";
import { getSupabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";

const supabase = getSupabase();

type ClinicMember = Database['public']['Tables']['clinic_members']['Row'];
type ClinicMemberWithClinic = ClinicMember & {
  clinics: Database['public']['Tables']['clinics']['Row'] | null;
};

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  loading: boolean;
  initialLoading: boolean;
  clinicLoading: boolean;
  signOut: () => Promise<void>;
  userClinics: ClinicMemberWithClinic[];
  activeClinic: ClinicMemberWithClinic | null;
  setActiveClinicId: (clinicId: string | null) => void;
  activeClinicRole: string | null;
  fetchUserAndClinicData: (userFromSession: User | null) => Promise<void>;
  profileName: string | null;
  needsProfileCompletion: boolean;
  checkProfileCompletion: (userId: string) => Promise<boolean>;
  markProfileComplete: () => Promise<void>;
  hasDoctorProfile: boolean | undefined;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [clinicLoading, setClinicLoading] = useState(false);
  const [userClinics, setUserClinics] = useState<ClinicMemberWithClinic[]>([]);
  const [activeClinic, setActiveClinicState] = useState<ClinicMemberWithClinic | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const [hasDoctorProfile, setHasDoctorProfile] = useState<boolean | undefined>(undefined);
  const isFetchingRef = useRef(false);
  const profileCheckRef = useRef<string | null>(null);

  const activeClinicRole = activeClinic ? activeClinic.role : null;

  // Centralized profile completion check function
  const checkProfileCompletion = useCallback(async (userId: string): Promise<boolean> => {
    // Prevent duplicate checks for the same user
    if (profileCheckRef.current === userId) {
      return needsProfileCompletion;
    }

    try {
      console.log("AuthContext: Checking profile completion for user:", userId);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('name, phone')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error("AuthContext: Error checking profile completion:", error);
        setNeedsProfileCompletion(true);
        profileCheckRef.current = userId;
        return true;
      }

      const incomplete = !profile || !profile.name || !profile.phone;
      console.log("AuthContext: Profile completion check result:", {
        userId,
        hasProfile: !!profile,
        hasName: !!profile?.name,
        hasPhone: !!profile?.phone,
        needsCompletion: incomplete
      });

      setNeedsProfileCompletion(incomplete);
      profileCheckRef.current = userId;
      return incomplete;
    } catch (error) {
      console.error("AuthContext: Exception in profile completion check:", error);
      setNeedsProfileCompletion(true);
      profileCheckRef.current = userId;
      return true;
    }
  }, [needsProfileCompletion]);

  // Function to mark profile as complete (called after successful profile update)
  const markProfileComplete = useCallback(async () => {
    console.log("AuthContext: Marking profile as complete");
    setNeedsProfileCompletion(false);
    profileCheckRef.current = null; // Reset cache
    
    // Also trigger a fresh profile check to ensure consistency
    if (user?.id) {
      await checkProfileCompletion(user.id);
    }
  }, [user?.id, checkProfileCompletion]);

  // Function to check if user has doctor profile in active clinic
  const checkDoctorProfile = useCallback(async (userId: string, clinicId: string | null): Promise<boolean> => {
    if (!clinicId) {
      setHasDoctorProfile(false);
      return false;
    }

    try {
      console.log("AuthContext: Checking doctor profile for user:", userId, "in clinic:", clinicId);
      
      const { data: doctorProfile, error } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', userId)
        .eq('clinic_id', clinicId)
        .maybeSingle();

      if (error) {
        console.error("AuthContext: Error checking doctor profile:", error);
        setHasDoctorProfile(false);
        return false;
      }

      const hasDoctorProfile = !!doctorProfile;
      console.log("AuthContext: Doctor profile check result:", hasDoctorProfile);
      setHasDoctorProfile(hasDoctorProfile);
      return hasDoctorProfile;
    } catch (error) {
      console.error("AuthContext: Exception in doctor profile check:", error);
      setHasDoctorProfile(false);
      return false;
    }
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setUserClinics([]);
    setActiveClinicState(null);
    setProfileName(null);
    setNeedsProfileCompletion(false);
    setHasDoctorProfile(undefined);
    profileCheckRef.current = null;
    localStorage.removeItem('activeClinicId');
    console.log("AuthContext: Signed out, cleared state and local storage.");
  };

  const setActiveClinicId = useCallback((clinicId: string | null) => {
    if (clinicId === null) {
      setActiveClinicState(null);
      setProfileName(null);
      setHasDoctorProfile(undefined);
      localStorage.removeItem('activeClinicId');
      console.log("AuthContext: Cleared active clinic.");
    } else {
      setUserClinics(currentUserClinics => {
        const selectedClinic = currentUserClinics.find(clinic => clinic.clinic_id === clinicId);
        if (selectedClinic) {
          setActiveClinicState(selectedClinic);
          setProfileName(selectedClinic.clinics?.name || null);
          localStorage.setItem('activeClinicId', selectedClinic.clinic_id);
          console.log("AuthContext: Set active clinic:", selectedClinic.clinics?.name);
          
          // Check doctor profile for superadmins when clinic changes
          if (user?.id && selectedClinic.role === 'superadmin') {
            checkDoctorProfile(user.id, selectedClinic.clinic_id);
          } else {
            setHasDoctorProfile(selectedClinic.role === 'doctor');
          }
        } else {
          setProfileName(null);
          setHasDoctorProfile(undefined);
          localStorage.removeItem('activeClinicId');
          console.log("AuthContext: Clinic ID not found in userClinics, cleared local storage.");
        }
        return currentUserClinics;
      });
    }
  }, [user?.id, checkDoctorProfile]);

  const fetchUserAndClinicData = useCallback(async (userFromSession: User | null) => {
    console.log("fetchUserAndClinicData: Starting with user:", userFromSession?.id);
    
    if (!userFromSession) {
      setUserClinics([]);
      setActiveClinicState(null);
      setProfileName(null);
      setNeedsProfileCompletion(false);
      setHasDoctorProfile(undefined);
      profileCheckRef.current = null;
      localStorage.removeItem('activeClinicId');
      console.log("AuthContext: No user, cleared clinics and active clinic.");
      isFetchingRef.current = false;
      return;
    }

    // Always check profile completion for the user
    await checkProfileCompletion(userFromSession.id);

    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      console.log("AuthContext: Already fetching user clinic data, skipping duplicate call.");
      return;
    }

    console.log("fetchUserAndClinicData: Setting clinicLoading to true");
    setClinicLoading(true);
    isFetchingRef.current = true;
    let fetchedClinics: ClinicMemberWithClinic[] = [];
    let initialActiveClinic: ClinicMemberWithClinic | null = null;
    try {
      console.log("fetchUserAndClinicData: Fetching user clinic memberships using RPC");
      
      const { data: memberData, error: memberError } = await supabase.rpc('get_user_clinic_memberships', {
        user_id: userFromSession.id
      });
      
      console.log("fetchUserAndClinicData: RPC result", { memberData, memberError });

      if (memberError) {
        console.error("fetchUserAndClinicData: Error fetching clinic members:", memberError);
        // Instead of throwing, handle gracefully by setting empty state
        setUserClinics([]);
        setActiveClinicState(null);
        setProfileName(null);
        setHasDoctorProfile(undefined);
        localStorage.removeItem('activeClinicId');
        return;
      }

      console.log("fetchUserAndClinicData: Fetched user clinic data:", memberData);

      if (!memberData || memberData.length === 0) {
        setUserClinics([]);
        setActiveClinicState(null);
        setProfileName(null);
        setHasDoctorProfile(undefined);
        localStorage.removeItem('activeClinicId');
        console.log("AuthContext: User is not a member of any clinics.");
        return; // Exit if no clinics found
      }

      // Convert the function result to the expected format
      fetchedClinics = memberData.map(member => ({
        id: member.membership_id,
        created_at: new Date().toISOString(), // We don't have this from the function, use placeholder
        user_id: userFromSession.id,
        clinic_id: member.clinic_id,
        role: member.role,
        department_id: member.department_id,
        clinics: {
          id: member.clinic_id,
          name: member.clinic_name,
          created_by: member.clinic_created_by,
          created_at: new Date().toISOString(), // Placeholder
          address: member.clinic_address,
          email: member.clinic_email,
          phone: member.clinic_phone,
          website: member.clinic_website
        }
      }));

      setUserClinics(fetchedClinics);
      console.log("fetchUserAndClinicData: Set user clinics data:", fetchedClinics);

      const savedActiveClinicId = localStorage.getItem('activeClinicId');
      console.log("fetchUserAndClinicData: Saved active clinic ID:", savedActiveClinicId);

      if (savedActiveClinicId) {
        const foundSavedClinic = fetchedClinics.find(clinic => clinic.clinic_id === savedActiveClinicId);
        if (foundSavedClinic) {
          initialActiveClinic = foundSavedClinic;
          console.log("fetchUserAndClinicData: Restored active clinic:", foundSavedClinic.clinics?.name);
        } else {
          localStorage.removeItem('activeClinicId');
          console.log("fetchUserAndClinicData: Saved clinic not found in fetched clinics, cleared local storage.");
        }
      }

      if (!initialActiveClinic && fetchedClinics.length > 0) {
        initialActiveClinic = fetchedClinics[0];
        localStorage.setItem('activeClinicId', initialActiveClinic.clinic_id);
        console.log("fetchUserAndClinicData: Set first fetched clinic as active:", initialActiveClinic.clinics?.name);
      }

      setActiveClinicState(initialActiveClinic);
      console.log("fetchUserAndClinicData: Final active clinic set to:", initialActiveClinic?.clinics?.name || null);

      // Check doctor profile for the active clinic if user is superadmin
      if (initialActiveClinic && userFromSession.id) {
        if (initialActiveClinic.role === 'superadmin') {
          await checkDoctorProfile(userFromSession.id, initialActiveClinic.clinic_id);
        } else {
          setHasDoctorProfile(initialActiveClinic.role === 'doctor');
        }
      } else {
        setHasDoctorProfile(undefined);
      }

      // After setting clinics, fetch profile name
      console.log("fetchUserAndClinicData: Fetching profile name");
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', userFromSession.id)
          .maybeSingle();
        if (profileError) {
          console.error('AuthContext: Error fetching profile name:', profileError);
          setProfileName(null);
        } else {
          setProfileName(profile?.name || null);
          console.log("fetchUserAndClinicData: Set profile name:", profile?.name || null);
        }
      } catch (profileFetchError) {
        console.error('AuthContext: Exception fetching profile name:', profileFetchError);
        setProfileName(null);
      }

      console.log("fetchUserAndClinicData completed successfully.", {
        user: userFromSession?.id,
        fetchedClinicsCount: fetchedClinics?.length || 0,
        finalActiveClinicName: initialActiveClinic?.clinics?.name || 'none',
      });

    } catch (error) {
      console.error("fetchUserAndClinicData: Error:", error);
      setUserClinics([]);
      setActiveClinicState(null);
      setProfileName(null);
      setHasDoctorProfile(undefined);
      localStorage.removeItem('activeClinicId');
    } finally {
      console.log("fetchUserAndClinicData: Finally block executed, setting clinicLoading to false");
      console.log("fetchUserAndClinicData: Current state before setting clinicLoading to false:", {
        initialLoading,
        clinicLoading,
        userClinicsLength: userClinics.length,
        activeClinic: !!activeClinic
      });
      setClinicLoading(false);
      isFetchingRef.current = false;
      
      // Force debug log after state update
      setTimeout(() => {
        console.log("fetchUserAndClinicData: State after clinicLoading set to false:", {
          initialLoading,
          clinicLoading: false, // should be false now
          totalLoading: initialLoading || false
        });
      }, 100);
    }
  }, [checkProfileCompletion]);

  useEffect(() => {
    let mounted = true;
    let currentUserId: string | null = null;

    // Safety timeout to ensure initialLoading doesn't stay true forever
    const safetyTimeout = setTimeout(() => {
      if (mounted && !initialLoadComplete) {
        console.warn("AuthContext: Safety timeout triggered, forcing initial load complete");
        setInitialLoading(false);
        setInitialLoadComplete(true);
      }
    }, 10000); // 10 second timeout

    const getInitialSession = async () => {
      if (!mounted) return;
      
      try {
        console.log("AuthContext: Getting initial session");
        setInitialLoading(true);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("AuthContext: Error getting session:", error);
          if (mounted) {
            setSession(null);
            setUser(null);
            setUserClinics([]);
            setActiveClinicState(null);
            setProfileName(null);
            setNeedsProfileCompletion(false);
            setHasDoctorProfile(undefined);
            profileCheckRef.current = null;
            localStorage.removeItem('activeClinicId');
          }
          return;
        }
        
        if (!mounted) return;
        
        console.log("AuthContext: Initial session obtained:", !!session?.user);
        setSession(session);
        setUser(session?.user ?? null);
        currentUserId = session?.user?.id ?? null;

        if (session?.user) {
          console.log("AuthContext: Processing user session");
          
          if (mounted) {
            await fetchUserAndClinicData(session.user);
          }
        } else {
          if (mounted) {
            setUserClinics([]);
            setActiveClinicState(null);
            setProfileName(null);
            setNeedsProfileCompletion(false);
            profileCheckRef.current = null;
            localStorage.removeItem('activeClinicId');
          }
        }
      } catch (error) {
        console.error("AuthContext: Error getting initial session:", error);
      } finally {
        if (mounted) {
          console.log("AuthContext: Initial loading complete");
          setInitialLoading(false);
          setInitialLoadComplete(true); // Allow auth state changes to be handled now
          clearTimeout(safetyTimeout); // Clear the safety timeout
        }
      }
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        console.log(`AuthContext: Auth state changed: ${_event}`, { 
          hasSession: !!newSession, 
          initialLoadHandled: initialLoadComplete, 
          currentInitialLoading: initialLoading,
          currentClinicLoading: clinicLoading
        });
        
        if (!mounted) return;
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Only handle auth state changes after initial load is complete to prevent loops
        if (!initialLoadComplete) {
          console.log("AuthContext: Skipping auth state change handling until initial load complete");
          return;
        }
        
        if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
          // Only refetch data if the user changed or we don't have clinic data
          if (newSession?.user && (newSession.user.id !== currentUserId || userClinics.length === 0)) {
            console.log("AuthContext: User changed or no clinic data, fetching data");
            currentUserId = newSession.user.id;
            await fetchUserAndClinicData(newSession.user);
          }
        }
        
        if (_event === 'SIGNED_OUT') {
          currentUserId = null;
          await signOut();
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      authListener?.subscription.unsubscribe();
    };
  }, []); // Remove dependencies that cause infinite loops - fetchUserAndClinicData, signOut, userClinics, initialLoadComplete

  // Effect to re-fetch clinic data on window focus (for data consistency)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && session?.user) {
        console.log("AuthContext: Window became visible, re-fetching user clinic data.");
        fetchUserAndClinicData(session.user);
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session, fetchUserAndClinicData]);


  const value = useMemo(() => {
    const loading = initialLoading || clinicLoading;
    console.log("AuthContext: Creating context value with loading states:", {
      initialLoading,
      clinicLoading,
      loading,
      userClinicsLength: userClinics.length,
      hasActiveClinic: !!activeClinic,
      hasUser: !!user
    });
    
    return {
      session,
      user,
      loading,
      initialLoading,
      clinicLoading,
      signOut,
      userClinics,
      activeClinic,
      setActiveClinicId,
      activeClinicRole,
      fetchUserAndClinicData,
      profileName,
      needsProfileCompletion,
      checkProfileCompletion,
      markProfileComplete,
      hasDoctorProfile
    };
  }, [
    session, user, initialLoading, clinicLoading, signOut,
    userClinics, activeClinic, setActiveClinicId, activeClinicRole,
    profileName, needsProfileCompletion, checkProfileCompletion,
    markProfileComplete, hasDoctorProfile, fetchUserAndClinicData
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};