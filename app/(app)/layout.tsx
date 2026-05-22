import type { Metadata } from 'next';
import { getAuthenticatedUser, getUserClinics, getProfileName, getActiveClinic } from '@/lib/auth-server';
import LayoutServer from '@/components/LayoutServer';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser();
  const [clinics, profileName, activeClinic] = await Promise.all([
    getUserClinics(user.id),
    getProfileName(user.id),
    getActiveClinic(user.id),
  ]);

  return (
    <LayoutServer
      serverUser={user}
      serverClinics={clinics}
      serverProfileName={profileName}
      serverActiveClinicId={activeClinic?.clinic_id ?? null}
    >
      {children}
    </LayoutServer>
  );
}
