// Path: app/(onboarding)/layout.tsx
import Image from 'next/image';
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
      <div className="min-h-screen bg-background flex flex-col">
        <header className="w-full p-6 flex items-center border-b border-border">
          <Image src="/logo.svg" alt="Doxxy" width={100} height={32} className="h-8 w-auto" />
        </header>
        <main className="flex-1 w-full flex flex-col">
          {children}
        </main>
      </div>
    </OnboardingWrapper>
  );
}
