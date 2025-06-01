// File: src/components/PrivateRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ClinicSelectionPage from "@/pages/ClinicSelectionPage"; // Import ClinicSelectionPage

const PrivateRoute = () => {
  const { user, activeClinic, loading } = useAuth();
  const location = useLocation();

  // If still loading auth state, show nothing or a loader
  if (loading) {
    // You might want a full-page loader here
    return null;
  }

  // If no user is authenticated, redirect to login
  if (!user) {
    console.log("PrivateRoute: No user, redirecting to /auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
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
