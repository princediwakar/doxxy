// File: src/components/PrivateRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppSidebar } from "@/components/app-sidebar";
import ClinicSelectionPage from "@/pages/ClinicSelectionPage"; // Import ClinicSelectionPage

const PrivateRoute = () => {
  const { user, activeClinic, loading, initialLoading, needsProfileCompletion } = useAuth();
  const location = useLocation();

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

  // Always render sidebar and layout chrome
  // Show spinner in main area while loading
  if (loading) {
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

  // If user is authenticated but needs to complete their profile
  if (user && needsProfileCompletion && location.pathname !== '/complete-profile') {
    console.log("PrivateRoute: User needs to complete profile, redirecting to /complete-profile");
    return <Navigate to="/complete-profile" state={{ from: location }} replace />;
  }

  // Allow access to /complete-profile even if profile is incomplete
  if (user && needsProfileCompletion && location.pathname === '/complete-profile') {
    return <Outlet />;
  }

  // If user is authenticated but has no active clinic
  if (user && !activeClinic) {
    // Allow access only to the create clinic path ('/create-clinic')
    if (location.pathname === '/create-clinic') {
        console.log(`PrivateRoute: Authenticated user without active clinic, allowing access to ${location.pathname}.`);
      return <Outlet />; // Render nested routes for CreateClinicPage
      } else {
      // For any other path, render the ClinicSelectionPage at the root
      console.log("PrivateRoute: Authenticated user without active clinic. Rendering ClinicSelectionPage.");
      // We are already at the root or being redirected here, so render the selection page directly
      // This handles the '/' path which is now the parent of the protected routes
      return <ClinicSelectionPage />;
      }
    }

  // If user is authenticated and has an active clinic
  // In App.tsx, this PrivateRoute has a nested <Route element={<Layout />}> with index for Dashboard at '/',
  // and other routes like /patients, /doctors etc.
  // When activeClinic exists, we just render the Outlet, and React Router will match the nested routes.
  if (user && activeClinic) {
      console.log("PrivateRoute: Authenticated user with active clinic. Allowing access to nested routes.");
    return <Outlet />;
  }

  // Fallback: should not be reached
  return null;
};

export default PrivateRoute;
