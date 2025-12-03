// File: src/components/PrivateRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/loading";

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
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    console.log('PrivateRoute: No user, redirecting to /auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Clean up invitation tokens if user has active clinic
  if (activeClinic) {
    const shouldCleanup = 
      sessionStorage.getItem('invitation_token') || 
      sessionStorage.getItem('invitation_start_time');
    
    if (shouldCleanup) {
      console.log('PrivateRoute: User has active clinic, cleaning up invitation tokens');
      sessionStorage.removeItem('invitation_token');
      sessionStorage.removeItem('invitation_start_time');
    }
  }

  // Priority 1: Profile completion (allow this even without a clinic)
  if (needsProfileCompletion && location.pathname !== '/complete-profile') {
    console.log('PrivateRoute: Profile incomplete, redirecting to /complete-profile');
    return <Navigate to="/complete-profile" state={{ from: location }} replace />;
  }

  // Priority 2: Check if invitation is being processed before redirecting to clinic creation
  if (!needsProfileCompletion && !activeClinic && location.pathname !== '/create-clinic') {
    // Check if there's an invitation being processed
    const invitationToken = typeof localStorage !== 'undefined' ? localStorage.getItem('invitation_token') : null;

    if (invitationToken) {
      // Show loading state while invitation is being processed
      console.log('PrivateRoute: Invitation being processed, showing loading state');
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <Spinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Processing your invitation...</p>
          </div>
        </div>
      );
    } else {
      // No invitation, redirect to clinic creation
      console.log('PrivateRoute: No active clinic, redirecting to /create-clinic');
      return <Navigate to="/create-clinic" state={{ from: location }} replace />;
    }
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

  // Clear invitation tokens if we have an active clinic (invitation was processed successfully)
  if (activeClinic) {
    const invitationToken = sessionStorage.getItem('invitation_token');
    if (invitationToken) {
      console.log('PrivateRoute: Invitation processed successfully, clearing tokens');
      sessionStorage.removeItem('invitation_token');
      sessionStorage.removeItem('invitation_start_time');
    }
  }

  console.log('PrivateRoute: Rendering protected content');
  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute;