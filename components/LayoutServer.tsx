import { Suspense } from 'react';
import type { User } from '@supabase/supabase-js';
import type { ClinicMemberWithClinic } from '@/types/core';
import { AppStateProvider } from '@/contexts/AppStateContext';
import { SidebarLayout } from '@/components/SidebarLayout';
import { CommandPalette } from '@/components/CommandPalette';
import { MobileHeader } from '@/components/MobileHeader';
import { BottomNav } from '@/components/BottomNav';
import { AppFAB } from '@/components/AppFAB';
import { PageLoader } from '@/components/ui/loading';

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
  return (
    <AppStateProvider
      serverUser={serverUser}
      serverClinics={serverClinics}
      serverProfileName={serverProfileName}
      serverActiveClinicId={serverActiveClinicId}
    >
      <div className="flex min-h-screen bg-muted/90">
        <MobileHeader />

        <SidebarLayout>
          <Suspense fallback={<PageLoader />}>
            {children}
          </Suspense>
        </SidebarLayout>

        <CommandPalette />

        <AppFAB />

        <BottomNav />
      </div>
    </AppStateProvider>
  );
};

export default LayoutServer;
