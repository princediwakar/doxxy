import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getAuthenticatedUser, getUserClinics, getProfileName, getActiveClinic, isProfileComplete, isDoctorOnboardingComplete, validateClinicAccess } from '@/lib/auth-server';
import LayoutServer from '@/components/LayoutServer';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser();

  const [clinics, profileName, activeClinic, profileComplete] = await Promise.all([
    getUserClinics(user.id),
    getProfileName(user.id),
    getActiveClinic(user.id),
    isProfileComplete(user.id),
  ]);

  if (!profileComplete) {
    redirect('/complete-profile');
  }
  if (clinics.length === 0) {
    redirect('/create-clinic');
  }

  if (activeClinic && !(await validateClinicAccess(user.id, activeClinic.clinic_id))) {
    redirect('/clinic');
  }

  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';

  if (
    pathname !== '/profile' &&
    activeClinic &&
    !(await isDoctorOnboardingComplete(user.id, activeClinic.clinic_id))
  ) {
    redirect('/profile?setup=doctor');
  }

  return (
    <LayoutServer
      serverUser={user}
      serverClinics={clinics}
      serverProfileName={profileName}
      serverActiveClinicId={activeClinic?.clinic_id ?? null}
    >
      <main>{children}</main>
    </LayoutServer>
  );
}
