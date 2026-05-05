import { Suspense } from 'react';
import type { User } from '@supabase/supabase-js';
import type { ClinicMemberWithClinic } from '@/types/core';
import { AppStateProvider } from '@/contexts/AppStateContext';
import { SidebarLayout } from '@/components/SidebarLayout';
import { CommandPalette } from '@/components/CommandPalette';
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
        <MobileHeader />

        <SidebarLayout>
          <Suspense fallback={<PageLoader />}>
            {children}
          </Suspense>
        </SidebarLayout>

        <CommandPalette />

        <FloatingActionButton actions={fabActions} />

        <BottomNav />
      </div>
    </AppStateProvider>
  );
};

export default LayoutServer;
