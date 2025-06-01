import * as React from "react";
import { useEffect } from "react"; // Import useEffect
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"; // Import the Button component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card components
import { PlusCircle } from "lucide-react"; // Import an icon for the create card
import { cn } from "@/lib/utils"; // Import cn for conditional class names

const ClinicSelectionPage = () => {
  const { user, activeClinic, loading, clinicLoading, userClinics, setActiveClinicId } = useAuth();
  const navigate = useNavigate();

  // Navigate to dashboard if user is logged in, not loading, and has an active clinic
  useEffect(() => {
    if (user && activeClinic && !loading && !clinicLoading) {
      navigate("/", { replace: true });
    }
  }, [user, activeClinic, loading, clinicLoading, navigate]); // Add dependencies

  // Show a loading spinner while initial auth or clinic data is loading
  if (loading || clinicLoading) {
     return (
        <div className="flex items-center justify-center min-h-screen">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
     );
  }

  // PrivateRoute should handle redirection if no user, but double-check
  if (!user) {
    navigate("/auth", { replace: true });
    return null; // Or a loading spinner
  }

  // If user is logged in but has no active clinic, show clinic selection/creation UI
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to Doxxy</h1>
      <p className="text-muted-foreground mb-8 text-center max-w-md">Select a clinic to continue or create a new one if you don't see yours.</p>

      {/* Clinics and Create Clinic Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
        
        {/* Map over userClinics to create clinic cards */}
        {userClinics && userClinics.map((clinicMember) => (
          <Card
            key={clinicMember.clinic_id}
            className={cn(
              "cursor-pointer hover:border-primary transition-colors",
              activeClinic?.clinic_id === clinicMember.clinic_id && "border-primary border-2"
            )}
            onClick={() => setActiveClinicId(clinicMember.clinic_id)}
          >
            <CardHeader>
              <CardTitle className="text-lg">{clinicMember.clinics?.name || 'Unnamed Clinic'}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Optional: Add more clinic details here */}
              <p className="text-sm text-muted-foreground">Role: {clinicMember.role}</p>
            </CardContent>
          </Card>
        ))}

        {/* Create New Clinic Card */}
        <Card
          className="flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors p-6 text-center"
          onClick={() => navigate('/create-clinic')}
        >
          <PlusCircle size={48} className="text-muted-foreground mb-3" />
          <CardTitle className="text-lg">Create New Clinic</CardTitle>
        </Card>

      </div>
    </div>
  );
};

export default ClinicSelectionPage; 