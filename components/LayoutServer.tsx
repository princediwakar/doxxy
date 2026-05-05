import { Suspense } from 'react';
import type { User } from '@supabase/supabase-js';
import type { ClinicMemberWithClinic } from '@/types/core';
import { AppStateProvider } from '@/contexts/AppStateContext';
import { AppSidebar } from '@/components/AppSidebar';
import { MobileHeader } from '@/components/MobileHeader';
import { BottomNav } from '@/components/BottomNav';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { PageLoader } from '@/components/ui/loading';
import { User as UserIcon } from 'lucide-react';

const LayoutServer = ({
  children,
  serverUser,
  serverClinics,
  serverProfileName,
  serverActiveClinicId,
}: {
  children: React.ReactNode;
  serverUser: User | null;
  serverClinics: ClinicMemberWithClinic[];
  serverProfileName: string | null;
  serverActiveClinicId: string | null;
}) => {
  const role = (serverClinics[0]?.role ?? serverClinics[0]?.role ?? null) as "staff" | "doctor" | "superadmin" | null;
  const fabActions = role ? [{
    id: "new-patient",
    icon: <UserIcon className="w-5 h-5" />,
    label: "New Patient",
    href: "/today?action=new-patient",
  }] : [];

  return (
    <AppStateProvider
      serverUser={serverUser}
      serverClinics={serverClinics}
      serverProfileName={serverProfileName}
      serverActiveClinicId={serverActiveClinicId}
    >
      <div className="flex min-h-screen bg-muted/90">
        <div className="hidden lg:flex lg:flex-col lg:w-72 fixed left-0 top-0 h-screen z-40">
          <AppSidebar />
        </div>

        <MobileHeader />

        <div className="flex-1 mt-14 lg:mt-4 lg:ml-72 pb-24 lg:pb-0 min-w-0 overflow-hidden">
          <main className="bg-white rounded-xl shadow-sm p-4 md:p-6 mx-auto min-h-[calc(100vh-3rem)] md:min-h-[calc(100vh-4rem)] max-w-full overflow-x-hidden">
            <Suspense fallback={<PageLoader />}>
              {children}
            </Suspense>
          </main>
        </div>

        <FloatingActionButton actions={fabActions} />

        <BottomNav />
      </div>
    </AppStateProvider>
  );
};

export default LayoutServer;
