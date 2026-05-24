// app/(onboarding)/OnboardingWrapper.tsx
'use client';

import type { AppUser, ClinicMemberWithClinic } from '@/types/core';
import { AppStateProvider } from '@/contexts/AppStateContext';

export function OnboardingWrapper({
  children,
  serverUser,
  serverClinics,
  serverProfileName,
  serverActiveClinicId,
}: {
  children: React.ReactNode;
  serverUser: AppUser | null;
  serverClinics: ClinicMemberWithClinic[];
  serverProfileName: string | null;
  serverActiveClinicId: string | null;
}) {
  return (
    <AppStateProvider
      serverUser={serverUser}
      serverClinics={serverClinics}
      serverProfileName={serverProfileName}
      serverActiveClinicId={serverActiveClinicId}
    >
      {children}
    </AppStateProvider>
  );
}
