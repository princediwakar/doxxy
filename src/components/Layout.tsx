import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppSidebar } from "@/components/AppSidebar";
import { Suspense } from "react";
import { PageLoader, Spinner } from "@/components/ui/loading";

const Layout = () => {
  const { loading } = useAuth();

  return (
    <div className="flex min-h-screen bg-muted/90">
      <AppSidebar />
      <div className="flex-1 mt-4 ml-2 mr-4">
        <main className="bg-white rounded-xl shadow-sm p-2 border border-border/40 md:p-6 mx-auto min-h-[calc(100vh-3rem)] md:min-h-[calc(100vh-4rem)] overflow-x-hidden">
          {loading ? (
            <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
              <Spinner size="lg" />
            </div>
          ) : (
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          )}
        </main>
      </div>
    </div>
  );
};

export default Layout;