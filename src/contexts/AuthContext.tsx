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
    // Skip check if we already know profile is complete for this user
    if (profileCheckRef.current === userId && needsProfileCompletion === false) {
      console.log("AuthContext: Profile already marked complete for user:", userId);
      return false;
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
        profileCheckRef.current = null;
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
      profileCheckRef.current = incomplete ? null : userId;
      return incomplete;
    } catch (error) {
      console.error("AuthContext: Exception in profile completion check:", error);
      setNeedsProfileCompletion(true);
      profileCheckRef.current = null;
      return true;
    }
  }, [needsProfileCompletion]);

  // Function to mark profile as complete (called after successful profile update)
  const markProfileComplete = useCallback(async () => {
    if (!user?.id) {
      console.warn("AuthContext: Cannot mark profile complete - no user ID");
      return;
    }
    
    console.log("AuthContext: Marking profile as complete for user:", user.id);
    setNeedsProfileCompletion(false);
    profileCheckRef.current = user.id; // Cache that this user's profile is complete
    console.log("AuthContext: Profile completion state updated, profile is now complete");
  }, [user?.id]);

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
      
      // First, get clinic memberships
      const { data: memberData, error: memberError } = await supabase.rpc('get_user_clinic_memberships', {
        user_id: userFromSession.id
      });
      
      console.log("fetchUserAndClinicData: RPC result", { memberData, memberError });

      if (memberError) {
        console.error("fetchUserAndClinicData: Error fetching clinic members:", memberError);
        throw memberError;
      }

      if (!memberData || memberData.length === 0) {
        setUserClinics([]);
        setActiveClinicState(null);
        setProfileName(null);
        setHasDoctorProfile(undefined);
        localStorage.removeItem('activeClinicId');
        console.log("AuthContext: User is not a member of any clinics.");
        return;
      }

      // Then, fetch full clinic details for each membership
      const clinicPromises = memberData.map(async (member) => {
        const { data: clinicData, error: clinicError } = await supabase
          .from('clinics')
          .select('*')
          .eq('id', member.clinic_id)
          .single();

        if (clinicError) {
          console.error("Error fetching clinic details:", clinicError);
          return null;
        }

        return {
          ...member,
          clinics: clinicData
        } as ClinicMemberWithClinic;
      });

      const resolvedClinics = await Promise.all(clinicPromises);
      fetchedClinics = resolvedClinics.filter((clinic): clinic is ClinicMemberWithClinic => clinic !== null);

      // Set user clinics
      setUserClinics(fetchedClinics);

      // Handle active clinic selection
      const storedClinicId = localStorage.getItem('activeClinicId');
      if (storedClinicId) {
        initialActiveClinic = fetchedClinics.find(clinic => clinic.clinic_id === storedClinicId) || null;
      }

      // If no stored clinic or stored clinic not found, use first clinic
      if (!initialActiveClinic && fetchedClinics.length > 0) {
        initialActiveClinic = fetchedClinics[0];
        localStorage.setItem('activeClinicId', fetchedClinics[0].clinic_id);
      }

      if (initialActiveClinic) {
        setActiveClinicState(initialActiveClinic);
        setProfileName(initialActiveClinic.clinics?.name || null);
        
        // Check doctor profile for superadmins
        if (userFromSession.id && initialActiveClinic.role === 'superadmin') {
          await checkDoctorProfile(userFromSession.id, initialActiveClinic.clinic_id);
        } else {
          setHasDoctorProfile(initialActiveClinic.role === 'doctor');
        }
      }

    } catch (error) {
      console.error("fetchUserAndClinicData: Error:", error);
      // Handle error gracefully
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
    }
  }, [checkProfileCompletion, checkDoctorProfile]);

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
    let timeoutId: NodeJS.Timeout;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && session?.user) {
        // Clear any existing timeout
        if (timeoutId) clearTimeout(timeoutId);
        
        // Only refresh if the page has been hidden for more than 5 minutes
        timeoutId = setTimeout(() => {
          const lastFetchTime = localStorage.getItem('lastFetchTime');
          const now = Date.now();
          if (!lastFetchTime || now - parseInt(lastFetchTime) > 5 * 60 * 1000) {
            console.log("AuthContext: Window became visible after 5+ minutes, re-fetching user clinic data.");
            localStorage.setItem('lastFetchTime', now.toString());
            fetchUserAndClinicData(session.user);
          }
        }, 1000); // 1 second debounce
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timeoutId) clearTimeout(timeoutId);
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