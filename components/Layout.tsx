// src/components/Layout.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNav } from "@/components/MobileNav";
import { Suspense } from "react";
import { PageLoader, Spinner } from "@/components/ui/loading";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useAuth();

  return (
    <div className="flex min-h-screen bg-muted/90">
      {/* Desktop Sidebar - hidden on mobile, visible on lg: and above */}
      <div className="hidden lg:flex lg:flex-col lg:w-72 fixed left-0 top-0 h-screen z-40">
        <AppSidebar />
      </div>
      
      {/* Mobile Navigation Trigger - visible below lg */}
      <div className="lg:hidden fixed top-0 left-0 z-50 pl-2 pt-2">
        <MobileNav />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 mt-14 ml-2 mr-2 lg:mt-4 lg:ml-72">
        <main className="bg-white rounded-xl shadow-sm p-2 border border-border/40 md:p-6 mx-auto min-h-[calc(100vh-3rem)] md:min-h-[calc(100vh-4rem)] overflow-x-hidden">
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
    </div>
  );
};

export default Layout;