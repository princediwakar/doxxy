// components/profile/ProfilePageClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { AppUser } from "@/types/core";
import {
  Shield,
  Stethoscope,
  Building2,
  Edit2,
  Phone,
  Mail,
  AlertCircle,
  BriefcaseMedical,
  MapPin,
  Banknote,
} from "lucide-react";
import { BasicProfileEditor } from "@/components/BasicProfileEditor";
import { DoctorQuickOnboarding } from "@/components/doctor/DoctorQuickOnboarding";

type DoctorProfile = Record<string, any> | null;
type UserProfile = Record<string, any> | null;

interface ProfilePageClientProps {
  user: AppUser;
  activeClinicId: string;
  activeClinicRole: string;
  activeClinicName: string;
  doctorProfile: DoctorProfile;
  userProfile: UserProfile;
}

export default function ProfilePageClient({
  user,
  activeClinicId,
  activeClinicRole,
  activeClinicName,
  doctorProfile,
  userProfile,
}: ProfilePageClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("setup") === "doctor" && doctorProfile) {
      if (!doctorProfile.department_id) {
        setIsOnboardingModalOpen(true);
      }
    }
  }, [searchParams, doctorProfile]);

  const displayName = userProfile?.name || user?.user_metadata?.name || "Unknown User";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
  
  const isDoctorRole = activeClinicRole === "doctor" || !!doctorProfile;
  const isSuperadmin = activeClinicRole === "superadmin";
  const needsMedicalProfile = !doctorProfile && (isDoctorRole || isSuperadmin);
  
  // Identify if this user is strictly staff to hide clinical sections entirely
  const isStrictlyStaff = activeClinicRole === "staff" && !doctorProfile;

  const handleRefetch = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.profile.doctor(user.id, activeClinicId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.profile.user(user.id) });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4 pb-10" data-testid="profile-page">
      
      {/* Hero Identity Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-border">
        <div className="flex items-center gap-5">
          <Avatar className="w-20 h-20 md:w-24 md:h-24 border-2 border-border shadow-sm">
            <AvatarImage src={user?.user_metadata?.avatar_url} className="object-cover" />
            <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{displayName}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                {activeClinicName}
              </span>
              <span className="text-muted-foreground/40">•</span>
              <Badge variant="secondary" className="capitalize font-normal text-xs px-2 py-0.5">
                {activeClinicRole}
              </Badge>
              {isSuperadmin && doctorProfile && (
                <Badge variant="outline" className="font-normal text-xs px-2 py-0.5 border-blue-500/30 text-blue-500">
                  <Shield className="w-3 h-3 mr-1" /> Superadmin
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button onClick={() => setIsBasicModalOpen(true)} variant="secondary" className="shrink-0 shadow-sm">
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Critical Actions */}
      {needsMedicalProfile && (
        <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-500 shadow-sm">
          <AlertCircle className="h-5 w-5 text-blue-500" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full ml-2">
            <div>
              <AlertTitle className="font-semibold">Medical Profile Required</AlertTitle>
              <AlertDescription className="text-sm opacity-90">
                Complete your medical profile to assign yourself to a department, set fees, and accept appointments.
              </AlertDescription>
            </div>
            <Button 
              onClick={() => setIsOnboardingModalOpen(true)} 
              className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
            >
              Setup Profile
            </Button>
          </div>
        </Alert>
      )}

      {/* Data Grids */}
      <div className={`grid grid-cols-1 ${isStrictlyStaff ? 'max-w-2xl' : 'lg:grid-cols-2'} gap-8`}>
        
        {/* Contact Information */}
        <Card className="shadow-sm border-border bg-card">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            <div className="flex items-center p-4 gap-4">
              <div className="p-2 bg-muted rounded-md"><Mail className="w-4 h-4 text-foreground/70" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium mb-0.5">Email Address</p>
                <p className="text-sm font-medium truncate text-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center p-4 gap-4">
              <div className="p-2 bg-muted rounded-md"><Phone className="w-4 h-4 text-foreground/70" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium mb-0.5">Phone Number</p>
                <p className="text-sm font-medium truncate text-foreground">
                  {userProfile?.phone || <span className="text-muted-foreground italic">Not provided</span>}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Profile - Hidden for pure Staff */}
        {!isStrictlyStaff && (
          <Card className="shadow-sm border-border bg-card">
            <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Clinical Details
              </CardTitle>
              {doctorProfile && (
                <Button onClick={() => setIsOnboardingModalOpen(true)} variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground hover:text-foreground">
                  <Edit2 className="w-3 h-3 mr-1" /> Edit
                </Button>
              )}
            </CardHeader>
            
            {doctorProfile ? (
              <CardContent className="p-0 divide-y divide-border">
                <div className="flex items-center p-4 gap-4">
                  <div className="p-2 bg-blue-500/10 text-blue-500 rounded-md"><BriefcaseMedical className="w-4 h-4" /></div>
<div className="flex-1 min-w-0">
  <p className="text-xs text-muted-foreground font-medium mb-0.5">Specialization & Dept.</p>
  <p className="text-sm font-medium truncate text-foreground">
    {[doctorProfile.primary_specialization, doctorProfile.department_name]
      .filter(Boolean)
      .join(' • ') || "Unassigned"}
  </p>
</div>
                </div>
                <div className="flex items-center p-4 gap-4">
                  <div className="p-2 bg-green-500/10 text-green-500 rounded-md"><Banknote className="w-4 h-4" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Consultation Fee</p>
                    <p className="text-sm font-medium truncate text-foreground">
                      {doctorProfile.consultation_fee ? `₹${doctorProfile.consultation_fee}` : "Free"}
                    </p>
                  </div>
                </div>
                {doctorProfile.google_place_id && (
                  <div className="flex items-center p-4 gap-4 bg-muted/20">
                    <div className="p-2 bg-muted text-foreground/70 rounded-md"><MapPin className="w-4 h-4" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-medium mb-0.5">Google Place Linked</p>
                      <p className="text-xs font-mono text-muted-foreground truncate">{doctorProfile.google_place_id}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            ) : (
              <CardContent className="p-8">
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <Stethoscope className="w-8 h-8 mb-3 opacity-20" />
                  <p className="text-sm">No clinical profile established.</p>
                </div>
              </CardContent>
            )}
          </Card>
        )}
      </div>

      {isBasicModalOpen && (
        <BasicProfileEditor
          open={isBasicModalOpen}
          onClose={() => setIsBasicModalOpen(false)}
          user={user}
          onProfileUpdate={handleRefetch}
        />
      )}

      {isOnboardingModalOpen && (
        <DoctorQuickOnboarding
          open={isOnboardingModalOpen}
          onClose={() => setIsOnboardingModalOpen(false)}
          onSuccess={() => {
            setIsOnboardingModalOpen(false);
            const next = new URLSearchParams(searchParams.toString());
            next.delete("setup");
            router.replace(window.location.pathname + (next.toString() ? `?${next.toString()}` : ""), { scroll: false });
            router.refresh();
            handleRefetch();
          }}
        />
      )}
    </div>
  );
}