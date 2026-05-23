import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuthenticatedUser, getUserClinics, getProfileName, getActiveClinic, isProfileComplete } from '@/lib/auth-server';
import LayoutServer from '@/components/LayoutServer';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

const SKIP_PROFILE_CHECK = new Set(['/complete-profile', '/create-clinic']);

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser();

  const [clinics, profileName, activeClinic, profileComplete] = await Promise.all([
    getUserClinics(user.id),
    getProfileName(user.id),
    getActiveClinic(user.id),
    isProfileComplete(user.id),
  ]);

  // Profile completion and clinic membership checks moved here from middleware.
  // Middleware only verifies auth — these DB calls benefit from React cache(),
  // the Node.js runtime, and don't block streaming.
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  if (!SKIP_PROFILE_CHECK.has(pathname)) {
    if (!profileComplete) {
      redirect('/complete-profile');
    }
    if (clinics.length === 0) {
      redirect('/create-clinic');
    }
  }

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
