
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface PrivateRouteProps {
  requiredRole?: string;
}

const PrivateRoute = ({ requiredRole }: PrivateRouteProps) => {
  const { user, userRole, loading } = useAuth();
  
  if (loading) {
    // Show loading state while auth status is being determined
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Check role if required
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on role
    if (userRole === "admin") {
      return <Navigate to="/admin" replace />;
    }
    if (userRole === "doctor") {
      return <Navigate to="/doctor" replace />;
    }
    // If no valid role, redirect to login
    return <Navigate to="/auth" replace />;
  }
  
  return <Outlet />;
};

export default PrivateRoute;
