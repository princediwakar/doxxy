import { getAuthenticatedUser, getActiveClinic } from "@/lib/auth-server";
import { getDoctorProfile, getUserProfile } from "@/lib/data/profile";
import ProfilePageClient from "@/components/profile/ProfilePageClient";

export default async function ProfilePage() {
  const user = await getAuthenticatedUser();
  const clinic = await getActiveClinic(user.id);

  const [doctorProfile, userProfile] = await Promise.all([
    clinic ? getDoctorProfile(user.id, clinic.clinic_id) : null,
    getUserProfile(user.id),
  ]);

  return (
    <ProfilePageClient
      user={user}
      activeClinicId={clinic?.clinic_id ?? ""}
      activeClinicRole={clinic?.role ?? "staff"}
      activeClinicName={clinic?.clinic_name ?? "Unknown Clinic"}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      doctorProfile={doctorProfile as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userProfile={userProfile as any}
    />
  );
}
