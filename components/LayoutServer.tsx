// Path: components/LayoutServer.tsx
import { Suspense } from 'react';
import type { AppUser, ClinicMemberWithClinic } from '@/types/core';
import { AppStateProvider } from '@/contexts/AppStateContext';
import { SidebarLayout } from '@/components/SidebarLayout';
import { CommandPalette } from '@/components/CommandPalette';
import { MobileHeader } from '@/components/MobileHeader';
import { BottomNav } from '@/components/BottomNav';
import { PageLoader } from '@/components/ui/loading';
import { TooltipProvider } from '@/components/ui/tooltip';

const LayoutServer = ({
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
}) => {
  return (
    <AppStateProvider
      serverUser={serverUser}
      serverClinics={serverClinics}
      serverProfileName={serverProfileName}
      serverActiveClinicId={serverActiveClinicId}
    >
      <TooltipProvider delayDuration={150} skipDelayDuration={0} disableHoverableContent>
        <div className="flex h-full overflow-hidden bg-muted/90">
          <MobileHeader />

          <SidebarLayout>
            <Suspense fallback={<PageLoader />}>
              {children}
            </Suspense>
          </SidebarLayout>

          <CommandPalette />

          <BottomNav />
        </div>
      </TooltipProvider>
    </AppStateProvider>
  );
};

export default LayoutServer;
