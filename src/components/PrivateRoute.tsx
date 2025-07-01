// File: src/components/PrivateRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const PrivateRoute = ({ children }: { children?: React.ReactNode }) => {
  const { 
    user, 
    loading: initialLoading, 
    activeClinic, 
    clinicLoading, 
    needsProfileCompletion 
  } = useAuth();
  const location = useLocation();

  // Debug logging
  console.log('PrivateRoute render:', {
    pathname: location.pathname,
    user: !!user,
    initialLoading,
    clinicLoading,
    activeClinic: activeClinic ? activeClinic.clinics?.name : null,
    needsProfileCompletion
  });

  // 1. Wait for initial session check to complete
  if (initialLoading) {
    console.log('PrivateRoute: Initial session loading');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // 2. If no user is authenticated, redirect to login
  if (!user) {
    console.log('PrivateRoute: No user, redirecting to /auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // 3. If user needs to complete their profile
  if (needsProfileCompletion) {
    if (location.pathname === '/complete-profile') {
      console.log('PrivateRoute: On /complete-profile with incomplete profile');
      return children ? <>{children}</> : <Outlet />;
    } else {
      console.log('PrivateRoute: Profile incomplete, redirecting to /complete-profile');
      return <Navigate to="/complete-profile" state={{ from: location }} replace />;
    }
  }

  // 4. Profile is complete - check clinic status
  // Show loading while clinic data is being fetched (except on complete-profile)
  if (clinicLoading && location.pathname !== '/complete-profile') {
    console.log('PrivateRoute: Clinic data loading');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // 5. If user has no active clinic
  if (!activeClinic) {
    if (location.pathname === '/create-clinic') {
      console.log('PrivateRoute: On /create-clinic without active clinic');
      // Render create clinic page without sidebar layout
      return (
        <div className="min-h-screen">
          <main className="p-4 md:p-8 max-w-4xl mx-auto bg-white min-h-screen">
            {children ? <>{children}</> : <Outlet />}
          </main>
        </div>
      );
    } else {
      console.log('PrivateRoute: No active clinic, redirecting to /create-clinic');
      return <Navigate to="/create-clinic" state={{ from: location }} replace />;
    }
  }

  // 6. User is authenticated, profile is complete, and has an active clinic
  if (location.pathname === '/create-clinic') {
    // Allow users with existing clinics to create new clinics
    console.log('PrivateRoute: User with active clinic on /create-clinic, allowing clinic creation');
    // Render create clinic page without sidebar layout
    return (
      <div className="min-h-screen">
        <main className="p-4 md:p-8 max-w-4xl mx-auto bg-white min-h-screen">
          {children ? <>{children}</> : <Outlet />}
        </main>
      </div>
    );
  }

  // 7. All conditions met - render protected content
  console.log('PrivateRoute: Rendering protected content for authenticated user with clinic');
  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute;