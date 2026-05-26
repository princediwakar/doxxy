// Path: app/(onboarding)/layout.tsx
import { redirect } from 'next/navigation';
import { getAuthenticatedUser, getUserClinics, getProfileName, getActiveClinic, isProfileComplete } from '@/lib/auth-server';
import { OnboardingWrapper } from './OnboardingWrapper';

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser();

  const [clinics, profileName, activeClinic, profileComplete] = await Promise.all([
    getUserClinics(user.id),
    getProfileName(user.id),
    getActiveClinic(user.id),
    isProfileComplete(user.id),
  ]);

  if (profileComplete && clinics.length > 0) {
    redirect('/schedule');
  }

  return (
    <OnboardingWrapper
      serverUser={user}
      serverClinics={clinics}
      serverProfileName={profileName}
      serverActiveClinicId={activeClinic?.clinic_id ?? null}
    >
      <main>{children}</main>
    </OnboardingWrapper>
  );
}
