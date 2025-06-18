// File: src/components/PrivateRoute.tsx
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppSidebar } from "@/components/AppSidebar";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: initialLoading, activeClinic, clinicLoading, needsProfileCompletion } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const loading = initialLoading || clinicLoading;

  // Wait for initial session check to complete before rendering anything
  if (initialLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AppSidebar />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto bg-white min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </main>
      </div>
    );
  }

  // Show loading state while clinic data is loading (but not if we're on complete-profile)
  if (loading && location.pathname !== '/complete-profile') {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AppSidebar />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto bg-white min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </main>
      </div>
    );
  }

  // If no user is authenticated, redirect to login
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If user needs to complete their profile (and not already on complete-profile page)
  if (user && needsProfileCompletion && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" state={{ from: location }} replace />;
  }

  // Allow access to /complete-profile even if profile is incomplete
  if (user && needsProfileCompletion && location.pathname === '/complete-profile') {
    return <Outlet />;
  }

  // If user is authenticated but has no active clinic (and profile is complete)
  if (user && !needsProfileCompletion && !activeClinic) {
    // Don't make routing decisions while clinic data is still loading
    if (clinicLoading) {
      return (
        <div className="flex min-h-screen bg-gray-100">
          <AppSidebar />
          <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto bg-white min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </main>
        </div>
      );
    }
    
    // Redirect to create clinic page if not already there
    if (location.pathname !== '/create-clinic') {
      return <Navigate to="/create-clinic" state={{ from: location }} replace />;
    }
    
    // Allow access to the create clinic page (without sidebar since no clinics yet)
    return (
      <div className="min-h-screen bg-gray-100">
        <main className="p-4 md:p-8 max-w-4xl mx-auto bg-white min-h-screen">
          <Outlet />
        </main>
      </div>
    );
  }

  // If user is authenticated, profile is complete, and has an active clinic
  if (user && !needsProfileCompletion && activeClinic) {
    // If they're on the create clinic page but now have an active clinic, redirect to dashboard
    if (location.pathname === '/create-clinic') {
      return <Navigate to="/" replace />;
    }
    
    return <Outlet />;
  }

  // If we get here, something unexpected happened - show loading
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AppSidebar />
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </main>
    </div>
  );
};

export default PrivateRoute;
