/* eslint-disable react-refresh/only-export-components */
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import { getSupabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { useClinicData, ClinicMemberWithClinic } from "@/hooks/useClinicData";

const supabase = getSupabase();

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
  const [profileName, setProfileName] = useState<string | null>(null);

  // Use optimized hooks
  const profileCompletion = useProfileCompletion();
  const clinicData = useClinicData();

  // Memoized profile name based on user data
  const memoizedProfileName = useMemo(() => {
    return user?.user_metadata?.name || user?.email || null;
  }, [user?.user_metadata?.name, user?.email]);

  // Update profile name when user changes
  useEffect(() => {
    setProfileName(memoizedProfileName);
  }, [memoizedProfileName]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfileName(null);
    profileCompletion.resetProfileCompletion();
    clinicData.clearClinicData();
    console.log("Signed out, cleared state and local storage.");
  }, [clinicData, profileCompletion]);

  const setActiveClinicId = useCallback((clinicId: string | null) => {
    clinicData.setActiveClinicId(clinicId, user);
    setProfileName(memoizedProfileName);
  }, [user, memoizedProfileName, clinicData]);

  const fetchUserAndClinicData = useCallback(async (userFromSession: User | null) => {
    // Update the current user ref for real-time subscription
    clinicData.currentUserRef.current = userFromSession;
    
    // Set up real-time subscription for clinic changes
    clinicData.setupRealtimeSubscription(userFromSession);
    
    await clinicData.fetchUserAndClinicData(userFromSession, profileCompletion.checkProfileCompletion);
  }, [clinicData, profileCompletion]);

  const markProfileComplete = useCallback(async () => {
    const updatedUser = await profileCompletion.markProfileComplete(user);
    if (updatedUser) {
      setUser(updatedUser);
    }
  }, [user, profileCompletion]);

  // Main authentication effect
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
            setProfileName(null);
            profileCompletion.resetProfileCompletion();
            clinicData.clearClinicData();
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

          // Check if this is an invitation sign-in from initial session
          if (session.user.user_metadata?.invitation_token) {
            console.log("AuthContext: Detected invitation sign-in from initial session, storing invitation data:", {
              invitation_token: session.user.user_metadata.invitation_token,
              clinic_id: session.user.user_metadata.clinic_id,
              role: session.user.user_metadata.role
            });

            // Store invitation data in localStorage for profile completion
            localStorage.setItem('invitation_token', session.user.user_metadata.invitation_token);
            localStorage.setItem('invitation_data', JSON.stringify({
              clinic_id: session.user.user_metadata.clinic_id,
              role: session.user.user_metadata.role,
              clinic_name: session.user.user_metadata.clinic_name,
              name: session.user.user_metadata.name
            }));

            console.log("AuthContext: Invitation data stored in localStorage from initial session");
          }

          if (mounted) {
            await fetchUserAndClinicData(session.user);
          }
        } else {
          if (mounted) {
            profileCompletion.resetProfileCompletion();
            clinicData.clearClinicData();
          }
        }
      } catch (error) {
        console.error("AuthContext: Error getting initial session:", error);
      } finally {
        if (mounted) {
          console.log("AuthContext: Initial loading complete");
          setInitialLoading(false);
          setInitialLoadComplete(true);
          clearTimeout(safetyTimeout);
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
          currentClinicLoading: clinicData.clinicLoading
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
          // Check if this is an invitation sign-in and store invitation data
          if (newSession?.user && newSession.user.user_metadata?.invitation_token) {
            console.log("AuthContext: Detected invitation sign-in, storing invitation data:", {
              invitation_token: newSession.user.user_metadata.invitation_token,
              clinic_id: newSession.user.user_metadata.clinic_id,
              role: newSession.user.user_metadata.role
            });

            // Store invitation data in localStorage for profile completion
            localStorage.setItem('invitation_token', newSession.user.user_metadata.invitation_token);
            localStorage.setItem('invitation_data', JSON.stringify({
              clinic_id: newSession.user.user_metadata.clinic_id,
              role: newSession.user.user_metadata.role,
              clinic_name: newSession.user.user_metadata.clinic_name,
              name: newSession.user.user_metadata.name
            }));

            console.log("AuthContext: Invitation data stored in localStorage");
          }

          // Only refetch data if the user changed or we don't have clinic data
          if (newSession?.user && (newSession.user.id !== currentUserId || clinicData.userClinics.length === 0)) {
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

    // Page visibility handling to refresh session when tab becomes active
    const handleVisibilityChange = () => {
      if (!document.hidden && mounted && initialLoadComplete) {
        console.log("AuthContext: Page became visible, refreshing session");
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user && session.user.id !== currentUserId) {
            console.log("AuthContext: User changed after page visibility, refetching data");
            currentUserId = session.user.id;
            fetchUserAndClinicData(session.user);
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      authListener.subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- Intentionally empty to prevent infinite loops

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    session,
    user,
    loading: initialLoading,
    initialLoading,
    clinicLoading: clinicData.clinicLoading,
    signOut,
    userClinics: clinicData.userClinics,
    activeClinic: clinicData.activeClinic,
    setActiveClinicId,
    activeClinicRole: clinicData.activeClinicRole,
    fetchUserAndClinicData,
    profileName,
    needsProfileCompletion: profileCompletion.needsProfileCompletion,
    checkProfileCompletion: profileCompletion.checkProfileCompletion,
    markProfileComplete,
    hasDoctorProfile: clinicData.hasDoctorProfile,
  }), [
    session,
    user,
    initialLoading,
    clinicData.clinicLoading,
    signOut,
    clinicData.userClinics,
    clinicData.activeClinic,
    setActiveClinicId,
    clinicData.activeClinicRole,
    fetchUserAndClinicData,
    profileName,
    profileCompletion.needsProfileCompletion,
    profileCompletion.checkProfileCompletion,
    markProfileComplete,
    clinicData.hasDoctorProfile,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};