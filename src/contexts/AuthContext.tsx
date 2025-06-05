import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";

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

  const activeClinicRole = activeClinic ? activeClinic.role : null;

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setUserClinics([]);
    setActiveClinicState(null);
    setProfileName(null);
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
      const selectedClinic = userClinics.find(clinic => clinic.clinic_id === clinicId);
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
    }
  }, [userClinics]);

  const fetchUserAndClinicData = useCallback(async (userFromSession: User | null) => {
    if (!userFromSession) {
      setUserClinics([]);
      setActiveClinicState(null);
      setProfileName(null);
      localStorage.removeItem('activeClinicId');
      console.log("AuthContext: No user, cleared clinics and active clinic.");
      setNeedsProfileCompletion(false);
      return;
    }

    // Always check profile completion for the user, regardless of clinic membership
    const checkProfileCompletion = async () => {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name, phone')
        .eq('id', userFromSession.id)
        .maybeSingle();
      if (!profileError && profile) {
        setNeedsProfileCompletion(!profile.name || !profile.phone);
      } else {
        setNeedsProfileCompletion(true);
      }
    };
    await checkProfileCompletion();

    // Avoid refetching if user ID hasn't changed (compare user state with userFromSession parameter)
    if (user && user.id === userFromSession.id && userClinics.length > 0) {
      console.log("AuthContext: User unchanged, skipping fetchUserAndClinicData.");
      return;
    }

    setClinicLoading(true);
    try {
      // Step 1: Fetch clinic memberships (just IDs needed initially)
      const { data: memberData, error: memberError } = await supabase
        .from('clinic_members')
        .select('id, created_at, user_id, clinic_id, role, department_id') // Select all fields required for ClinicMember type
        .eq('user_id', userFromSession.id); // Use the parameter name

      if (memberError) throw memberError;

      const clinicIds = memberData?.map(member => member.clinic_id) || [];
      console.log("fetchUserAndClinicData: Fetched user clinic IDs:", clinicIds);

      if (clinicIds.length === 0) {
        setUserClinics([]);
        setActiveClinicState(null);
        setProfileName(null);
        localStorage.removeItem('activeClinicId');
        console.log("AuthContext: User is not a member of any clinics.");
        return; // Exit if no clinics found
      }

      // Step 2: Fetch clinic details for the found IDs
      const { data: clinicsData, error: clinicsError } = await supabase
        .from('clinics')
        .select('*')
        .in('id', clinicIds);

      if (clinicsError) throw clinicsError;

      console.log("fetchUserAndClinicData: Fetched clinic details:", clinicsData);

      // Combine member data with clinic details
      const fetchedClinics: ClinicMemberWithClinic[] = (memberData || []).map(member => ({
        ...member,
        clinics: (clinicsData || []).find(clinic => clinic.id === member.clinic_id) || null,
      }));

      setUserClinics(fetchedClinics);
      console.log("fetchUserAndClinicData: Combined user clinics data:", fetchedClinics);

      const savedActiveClinicId = localStorage.getItem('activeClinicId');
      console.log("fetchUserAndClinicData: Saved active clinic ID:", savedActiveClinicId);

      let initialActiveClinic: ClinicMemberWithClinic | null = null;
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
      }

    } catch (error) {
      console.error("fetchUserAndClinicData: Error:", error);
      setUserClinics([]);
      setActiveClinicState(null);
      setProfileName(null);
      localStorage.removeItem('activeClinicId');
    } finally {
      setClinicLoading(false);
      console.log("fetchUserAndClinicData completed.", {
        user: userFromSession?.id, // Use the parameter name
        userClinicsCount: userClinics.length, // Note: This might log stale count before state update
        finalActiveClinicName: activeClinic?.clinics?.name, // Note: This might log stale activeClinic name
      });
    }
  }, [user, userClinics, activeClinic]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("AuthContext: Auth state changed:", event);
      setSession(session);
      setUser(session?.user ?? null);
      setInitialLoading(false);

      if (session?.user) {
        fetchUserAndClinicData(session.user);
      } else {
        setUserClinics([]);
        setActiveClinicState(null);
        setProfileName(null);
        localStorage.removeItem('activeClinicId');
        console.log("AuthContext: No user session, cleared state.");
      }
    });

    const getInitialSession = async () => {
      try {
        setInitialLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Sync profiles table with Auth metadata
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, name, email')
            .eq('id', session.user.id)
            .maybeSingle();
          const authName = session.user.user_metadata?.name || session.user.name || '';
          const authEmail = session.user.email || '';
          if (!profile) {
            // Create missing profile row
            await supabase.from('profiles').insert({ id: session.user.id, name: authName, email: authEmail });
          } else {
            // Update if name/email differ
            if (profile.name !== authName || profile.email !== authEmail) {
              await supabase.from('profiles').update({ name: authName, email: authEmail }).eq('id', session.user.id);
            }
          }
          await fetchUserAndClinicData(session.user);
        } else {
          setUserClinics([]);
          setActiveClinicState(null);
          setProfileName(null);
          localStorage.removeItem('activeClinicId');
        }
      } catch (error) {
        console.error("AuthContext: Error getting initial session:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    getInitialSession();

    return () => subscription.unsubscribe();
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
  }), [session, user, initialLoading, clinicLoading, userClinics, activeClinic, setActiveClinicId, activeClinicRole, fetchUserAndClinicData, profileName, needsProfileCompletion]);

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