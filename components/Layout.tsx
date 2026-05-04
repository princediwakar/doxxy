// src/components/Layout.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { BottomNav } from "@/components/BottomNav";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { Suspense } from "react";
import { PageLoader, Spinner } from "@/components/ui/loading";
import { User } from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { loading, activeClinicRole } = useAuth();

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === "/") {
      router.replace("/today");
    }
  }, [pathname, router]);

  const role = activeClinicRole as "staff" | "doctor" | "superadmin" | null;
  const fabActions = role ? [{
    id: "new-patient",
    icon: <User className="w-5 h-5" />,
    label: "New Patient",
    href: "/today?action=new-patient",
  }] : [];

  return (
    <div className="flex min-h-screen bg-muted/90">
      {/* Desktop Sidebar - hidden on mobile, visible on lg: and above */}
      <div className="hidden lg:flex lg:flex-col lg:w-72 fixed left-0 top-0 h-screen z-40">
        <AppSidebar />
      </div>

      {/* Mobile Header - visible below lg */}
      <MobileHeader />

      {/* Main Content Area */}
      <div className="flex-1 mt-14 lg:mt-4 lg:ml-72 pb-24 lg:pb-0 min-w-0 overflow-hidden">
        <main className="bg-white rounded-xl shadow-sm p-4 md:p-6 mx-auto min-h-[calc(100vh-3rem)] md:min-h-[calc(100vh-4rem)] max-w-full overflow-x-hidden">
          {loading ? (
            <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
              <Spinner size="lg" />
            </div>
          ) : (
            <Suspense fallback={<PageLoader />}>
              {children}
            </Suspense>
          )}
        </main>
      </div>

      {/* Floating Action Button - Mobile only */}
      <FloatingActionButton actions={fabActions} />

      {/* Bottom Navigation Bar - Mobile only */}
      <BottomNav />
    </div>
  );
};

export default Layout;
