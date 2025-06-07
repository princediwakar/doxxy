// File: src/components/PrivateRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppSidebar } from "@/components/app-sidebar";

const PrivateRoute = () => {
  const { user, activeClinic, loading, initialLoading, clinicLoading, needsProfileCompletion } = useAuth();
  const location = useLocation();

  // Debug logging
  console.log("PrivateRoute: Current auth state:", {
    hasUser: !!user,
    hasActiveClinic: !!activeClinic,
    loading,
    initialLoading,
    clinicLoading,
    needsProfileCompletion,
    pathname: location.pathname
  });

  // Wait for initial session check to complete before rendering anything
  if (initialLoading) {
    console.log("PrivateRoute: Showing loading spinner due to initialLoading");
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
    console.log("PrivateRoute: Showing loading spinner due to loading flag");
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
    console.log("PrivateRoute: No user, redirecting to /auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If user needs to complete their profile (and not already on complete-profile page)
  if (user && needsProfileCompletion && location.pathname !== '/complete-profile') {
    console.log("PrivateRoute: User needs to complete profile, redirecting to /complete-profile");
    return <Navigate to="/complete-profile" state={{ from: location }} replace />;
  }

  // Allow access to /complete-profile even if profile is incomplete
  if (user && needsProfileCompletion && location.pathname === '/complete-profile') {
    console.log("PrivateRoute: User on complete-profile page, allowing access");
    return <Outlet />;
  }

  // If user is authenticated but has no active clinic (and profile is complete)
  if (user && !needsProfileCompletion && !activeClinic) {
    // Don't make routing decisions while clinic data is still loading
    if (clinicLoading) {
      console.log("PrivateRoute: Clinic data loading, showing spinner");
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
      console.log("PrivateRoute: Authenticated user without active clinic, redirecting to /create-clinic");
      return <Navigate to="/create-clinic" state={{ from: location }} replace />;
    }
    
      // Allow access to the create clinic page (without sidebar since no clinics yet)
  console.log("PrivateRoute: User on create-clinic page, allowing access");
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
      console.log("PrivateRoute: User has active clinic but is on create-clinic page, redirecting to dashboard");
      return <Navigate to="/" replace />;
    }
    
    console.log("PrivateRoute: Authenticated user with active clinic and complete profile, allowing access");
    return <Outlet />;
  }

  // If we get here, something unexpected happened - show loading
  console.warn("PrivateRoute: Unexpected state, showing loading", {
    hasUser: !!user,
    needsProfileCompletion,
    hasActiveClinic: !!activeClinic,
    pathname: location.pathname
  });
  
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
