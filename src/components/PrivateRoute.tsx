// File: src/components/PrivateRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// src/components/PrivateRoute.tsx
const PrivateRoute = ({ children }: { children?: React.ReactNode }) => {
  const { 
    user, 
    loading: initialLoading, 
    clinicLoading, 
    activeClinic, 
    needsProfileCompletion 
  } = useAuth();
  const location = useLocation();

  console.log('PrivateRoute render:', {
    pathname: location.pathname,
    user: !!user,
    initialLoading,
    clinicLoading,
    activeClinic: activeClinic ? activeClinic.clinics?.name : null,
    needsProfileCompletion
  });

  // Wait for both initial session and clinic data to load
  if (initialLoading || clinicLoading) {
    console.log('PrivateRoute: Waiting for initial or clinic loading');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    console.log('PrivateRoute: No user, redirecting to /auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Priority 1: Profile completion (allow this even without a clinic)
  if (needsProfileCompletion && location.pathname !== '/complete-profile') {
    console.log('PrivateRoute: Profile incomplete, redirecting to /complete-profile');
    return <Navigate to="/complete-profile" state={{ from: location }} replace />;
  }

  // Priority 2: Clinic creation (only check this if profile is complete)
  if (!needsProfileCompletion && !activeClinic && location.pathname !== '/create-clinic') {
    console.log('PrivateRoute: No active clinic, redirecting to /create-clinic');
    return <Navigate to="/create-clinic" state={{ from: location }} replace />;
  }

  // Allow /complete-profile page to render even without active clinic
  if (location.pathname === '/complete-profile') {
    console.log('PrivateRoute: Rendering /complete-profile page');
    return (
      <div className="min-h-screen">
        <main className="p-4 md:p-8 max-w-4xl mx-auto bg-white min-h-screen">
          {children ? <>{children}</> : <Outlet />}
        </main>
      </div>
    );
  }

  // Allow /create-clinic page to render
  if (location.pathname === '/create-clinic') {
    console.log('PrivateRoute: Rendering /create-clinic page');
    return (
      <div className="min-h-screen">
        <main className="p-4 md:p-8 max-w-4xl mx-auto bg-white min-h-screen">
          {children ? <>{children}</> : <Outlet />}
        </main>
      </div>
    );
  }

  console.log('PrivateRoute: Rendering protected content');
  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute;