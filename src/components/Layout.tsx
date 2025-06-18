import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppSidebar } from "@/components/AppSidebar";
import AppHeader from './AppHeader';

const Layout = () => {
  const { loading } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AppSidebar />
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto bg-white min-h-screen overflow-x-hidden">
        {loading && (
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;