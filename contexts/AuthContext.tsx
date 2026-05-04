/* eslint-disable react-refresh/only-export-components */
// File: contexts/AuthContext.tsx
"use client";
import { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo, ReactNode } from "react";
import { getSupabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { useClinicData, ClinicMemberWithClinic } from "@/hooks/useClinicData";
import { logger } from "@/lib/logger";

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
  doctorId: string | null;
  setUserFromServer: (serverUser: User | null) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const initialLoading = false;
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
    logger.log("Signed out, cleared state and local storage.");
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

  // ------------------------------------------------------------------
  // STALE CLOSURE FIX:
  // We use a ref to hold the latest version of fetchUserAndClinicData.
  // This ensures the auth listener always calls the most recent function
  // without needing to be removed/re-added constantly.
  // ------------------------------------------------------------------
  const fetchUserAndClinicDataRef = useRef(fetchUserAndClinicData);
  useEffect(() => {
    fetchUserAndClinicDataRef.current = fetchUserAndClinicData;
  }, [fetchUserAndClinicData]);

  // Server-to-client bridge: accept user from server layout / proxy
  const setUserFromServer = useCallback((serverUser: User | null) => {
    if (serverUser) {
      setUser(serverUser);
      fetchUserAndClinicDataRef.current(serverUser);
    }
  }, []);

  const markProfileComplete = useCallback(async () => {
    const updatedUser = await profileCompletion.markProfileComplete(user);
    if (updatedUser) {
      setUser(updatedUser);
    }
  }, [user, profileCompletion]);

  // Main authentication effect — onAuthStateChange listener for real-time auth events.
  // Server layout already verified auth; this listener picks up the current session
  // from Supabase on mount (fires initial state synchronously on subscribe).
  useEffect(() => {
    let mounted = true;
    let currentUserId: string | null = null;

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        logger.log(`AuthContext: Auth state changed: ${_event}`, {
          hasSession: !!newSession,
          currentClinicLoading: clinicData.clinicLoading
        });

        if (!mounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
          // Check if this is an invitation sign-in and store invitation data
          if (newSession?.user && newSession.user.user_metadata?.invitation_token) {
            logger.log("AuthContext: Detected invitation sign-in, storing invitation data:", {
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

            logger.log("AuthContext: Invitation data stored in localStorage");
          }

          // Fetch clinic data when user signs in or session refreshes
          if (newSession?.user && (newSession.user.id !== currentUserId || clinicData.userClinics.length === 0)) {
            logger.log("AuthContext: User changed or no clinic data, fetching data");
            currentUserId = newSession.user.id;
            await fetchUserAndClinicDataRef.current(newSession.user);
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
      if (!document.hidden && mounted) {
        logger.log("AuthContext: Page became visible, refreshing session");
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user && session.user.id !== currentUserId) {
            logger.log("AuthContext: User changed after page visibility, refetching data");
            currentUserId = session.user.id;
            fetchUserAndClinicDataRef.current(session.user);
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      authListener.subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    doctorId: clinicData.doctorId,
    setUserFromServer,
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
    clinicData.doctorId,
    setUserFromServer,
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