import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo, useRef } from "react";
import { getSupabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";
import { useNavigate } from 'react-router-dom';

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
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [clinicLoading, setClinicLoading] = useState(false);
  const [userClinics, setUserClinics] = useState<ClinicMemberWithClinic[]>([]);
  const [activeClinic, setActiveClinicState] = useState<ClinicMemberWithClinic | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
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
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name, phone')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error("AuthContext: Error checking profile completion:", profileError);
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

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setUserClinics([]);
    setActiveClinicState(null);
    setProfileName(null);
    setNeedsProfileCompletion(false);
    profileCheckRef.current = null;
    localStorage.removeItem('activeClinicId');
    console.log("AuthContext: Signed out, cleared state and local storage.");
  };

  const setActiveClinicId = useCallback((clinicId: string | null) => {
    if (clinicId === null) {
      setActiveClinicState(null);
      setProfileName(null);
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
        } else {
          setProfileName(null);
          localStorage.removeItem('activeClinicId');
          console.log("AuthContext: Clinic ID not found in userClinics, cleared local storage.");
        }
        return currentUserClinics;
      });
    }
  }, []);

  const fetchUserAndClinicData = useCallback(async (userFromSession: User | null) => {
    console.log("fetchUserAndClinicData: Starting with user:", userFromSession?.id);
    
    if (!userFromSession) {
      setUserClinics([]);
      setActiveClinicState(null);
      setProfileName(null);
      setNeedsProfileCompletion(false);
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
      console.log("fetchUserAndClinicData: Starting clinic membership query");
      // Use the safe RPC function to avoid RLS recursion between clinic_members and clinics
      const { data: memberData, error: memberError } = await supabase
        .rpc('get_user_clinic_memberships', { user_id: userFromSession.id });

      if (memberError) {
        console.error("fetchUserAndClinicData: Error fetching clinic members:", memberError);
        // Instead of throwing, handle gracefully by setting empty state
        setUserClinics([]);
        setActiveClinicState(null);
        setProfileName(null);
        localStorage.removeItem('activeClinicId');
        return;
      }

      console.log("fetchUserAndClinicData: Fetched user clinic data:", memberData);

      if (!memberData || memberData.length === 0) {
        setUserClinics([]);
        setActiveClinicState(null);
        setProfileName(null);
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
          address: null, // Not fetched by function
          email: null, // Not fetched by function  
          phone: null, // Not fetched by function
          website: null // Not fetched by function
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
      localStorage.removeItem('activeClinicId');
    } finally {
      console.log("fetchUserAndClinicData: Finally block executed, setting clinicLoading to false");
      setClinicLoading(false);
      isFetchingRef.current = false;
    }
  }, [checkProfileCompletion]);

  useEffect(() => {
    let mounted = true;
    let initialLoadComplete = false;
    let currentUserId: string | null = null;

    // Safety timeout to ensure initialLoading doesn't stay true forever
    const safetyTimeout = setTimeout(() => {
      if (mounted && !initialLoadComplete) {
        console.warn("AuthContext: Safety timeout triggered, forcing initial load complete");
        setInitialLoading(false);
        initialLoadComplete = true;
      }
    }, 10000); // 10 second timeout

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log("AuthContext: Auth state changed:", event);
      
      // Don't handle any auth state changes until initial load is complete
      if (!initialLoadComplete) {
        console.log("AuthContext: Skipping auth state change until initial load complete:", event);
        return;
      }

      const newUserId = session?.user?.id ?? null;
      
      // Only trigger full data refetch for specific events that indicate real user changes
      const isRealUserChange = currentUserId !== newUserId;
      const isInitialSignIn = event === 'SIGNED_IN' && currentUserId === null;
      const isSignOut = event === 'SIGNED_OUT';
      const shouldRefetchData = isRealUserChange || isInitialSignIn || isSignOut;
      
      console.log("AuthContext: User change detection:", {
        event,
        currentUserId,
        newUserId,
        isRealUserChange,
        isInitialSignIn,
        isSignOut,
        shouldRefetchData
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      currentUserId = newUserId;

              if (shouldRefetchData) {
          if (session?.user) {
            // Only refetch if we don't have clinic data or user actually changed
            if ((userClinics.length === 0 || isRealUserChange) && !isFetchingRef.current) {
              await fetchUserAndClinicData(session.user);
            } else {
              console.log("AuthContext: User clinic data already loaded or fetch in progress, skipping refetch");
            }
          } else {
          setUserClinics([]);
          setActiveClinicState(null);
          setProfileName(null);
          setNeedsProfileCompletion(false);
          profileCheckRef.current = null;
          localStorage.removeItem('activeClinicId');
          console.log("AuthContext: No user session, cleared state.");
        }
      } else {
        console.log("AuthContext: Token refresh detected, skipping data refetch");
      }
    });

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
          // Sync profiles table with Auth metadata (only fill empty fields, don't overwrite user data)
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('id, name, email')
              .eq('id', session.user.id)
              .maybeSingle();
            
            const authName = session.user.user_metadata?.name || '';
            const authEmail = session.user.email || '';
            
            if (!profile) {
              // Create missing profile row
              console.log("AuthContext: Creating new profile with auth metadata");
              await supabase.from('profiles').insert({ id: session.user.id, name: authName, email: authEmail });
            } else {
              // Only update profile fields that are currently empty (don't overwrite user data)
              const updates: { name?: string; email?: string } = {};
              if (!profile.name && authName) {
                updates.name = authName;
              }
              if (!profile.email && authEmail) {
                updates.email = authEmail;
              }
              
              if (Object.keys(updates).length > 0) {
                console.log("AuthContext: Updating empty profile fields:", updates);
                await supabase.from('profiles').update(updates).eq('id', session.user.id);
              } else {
                console.log("AuthContext: Profile already has data, skipping sync to preserve user input");
              }
            }
          } catch (profileError) {
            console.error("AuthContext: Error syncing profile:", profileError);
          }
          
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
          initialLoadComplete = true; // Allow auth state changes to be handled now
          clearTimeout(safetyTimeout); // Clear the safety timeout
        }
      }
    };

    getInitialSession();

    // Handle page visibility changes to prevent unnecessary auth checks
    let visibilityTimeout: NodeJS.Timeout | null = null;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && mounted && initialLoadComplete) {
        // Debounce rapid visibility changes
        if (visibilityTimeout) {
          clearTimeout(visibilityTimeout);
        }
        
        visibilityTimeout = setTimeout(() => {
          console.log("AuthContext: Tab became visible, checking session validity");
          // Only refresh if we don't have a current session
          if (!session) {
            supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
              if (currentSession && currentSession.user?.id !== currentUserId) {
                console.log("AuthContext: Found new session after tab focus");
                // Let the auth state change handler deal with it
              }
            });
          } else {
            console.log("AuthContext: Tab visible but session exists, no action needed");
          }
        }, 100); // Debounce for 100ms
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      if (visibilityTimeout) {
        clearTimeout(visibilityTimeout);
      }
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const authContextValue = useMemo(() => ({
    session,
    user,
    loading: initialLoading || clinicLoading,
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
  }), [session, user, initialLoading, clinicLoading, userClinics, activeClinic, setActiveClinicId, activeClinicRole, profileName, needsProfileCompletion, checkProfileCompletion, markProfileComplete]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};