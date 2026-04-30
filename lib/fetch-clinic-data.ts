import { logger } from "@/lib/logger";
import { getSupabase } from "@/integrations/supabase/client";
import type { ClinicMemberWithClinic } from "@/hooks/useClinicData";

const supabase = getSupabase();

interface FetchClinicDataDeps {
  setClinicLoading: (loading: boolean) => void;
  setUserClinics: (clinics: ClinicMemberWithClinic[]) => void;
  setActiveClinicState: (clinic: ClinicMemberWithClinic | null) => void;
  setHasDoctorProfile: (has: boolean | undefined) => void;
  isFetchingRef: React.MutableRefObject<boolean>;
  checkDoctorProfile: (userId: string, clinicId: string | null) => Promise<boolean>;
}

export async function fetchClinicData(
  userFromSession: { id: string } | null,
  checkProfileCompletion: (userId: string) => Promise<boolean>,
  deps: FetchClinicDataDeps,
  retryCount = 0,
): Promise<void> {
  const {
    setClinicLoading,
    setUserClinics,
    setActiveClinicState,
    setHasDoctorProfile,
    isFetchingRef,
    checkDoctorProfile,
  } = deps;

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

    const clinicIds = memberData.map(member => member.clinic_id);

    const { data: allClinics, error: clinicsError } = await supabase
      .from('clinics')
      .select('*')
      .in('id', clinicIds);

    if (clinicsError) {
      logger.error("Error fetching clinic details:", clinicsError);
      throw new Error(`Clinics fetch error: ${clinicsError.message}`);
    }

    const clinicMap = new Map(allClinics?.map(clinic => [clinic.id, clinic]) || []);

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
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchClinicData(userFromSession, checkProfileCompletion, deps, retryCount + 1);
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
}
