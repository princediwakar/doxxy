"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import type { User } from "@supabase/supabase-js";
import {
  User as UserIcon,
  Shield,
  Stethoscope,
  UserPlus,
  Building2,
  Edit,
  Phone,
  Mail,
  CheckCircle,
} from "lucide-react";
import { BasicProfileEditor } from "@/components/BasicProfileEditor";
import { DoctorQuickOnboarding } from "@/components/doctor/DoctorQuickOnboarding";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DoctorProfile = Record<string, any> | null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UserProfile = Record<string, any> | null;

interface ProfilePageClientProps {
  user: User;
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
  const queryClient = useQueryClient();
  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("setup") === "doctor") {
      setIsOnboardingModalOpen(true);
    }
  }, [searchParams]);

  const getRoleDisplayConfig = () => {
    const isDoctorRole = activeClinicRole === "doctor" || !!doctorProfile;
    const isHybridSuperadmin =
      activeClinicRole === "superadmin" && !!doctorProfile;

    const displayName =
      userProfile?.name || user?.user_metadata?.name || "User";

    if (isDoctorRole) {
      return {
        title: displayName,
        subtitle:
          doctorProfile?.primary_specialization || "Medical Professional",
        icon: Stethoscope,
        iconClass: "",
        bgClass: "bg-muted",
        badge: isHybridSuperadmin ? { text: "Superadmin", icon: Shield } : null,
      };
    }

    if (activeClinicRole === "superadmin") {
      return {
        title: displayName,
        subtitle: "Clinic Administrator",
        icon: Shield,
        iconClass: "text-slate-600",
        bgClass: "bg-slate-50",
        badge: null,
      };
    }

    return {
      title: displayName,
      subtitle: "Healthcare Team",
      icon: UserIcon,
      iconClass: "text-success",
      bgClass: "bg-success/10",
      badge: null,
    };
  };

  const roleConfig = getRoleDisplayConfig();
  const IconComponent = roleConfig.icon;

  const handleRefetch = () => {
    queryClient.invalidateQueries({
      queryKey: ["doctorProfile", user.id, activeClinicId],
    });
    queryClient.invalidateQueries({
      queryKey: ["userProfile", user.id],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-lg ${roleConfig.bgClass}`}
          >
            <IconComponent className={`w-5 h-5 ${roleConfig.iconClass}`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="hidden md:block text-muted-foreground">
              Manage your profile information and settings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {roleConfig.badge && (
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <roleConfig.badge.icon className="w-3 h-3 mr-1" />
              {roleConfig.badge.text}
            </Badge>
          )}
          <Button onClick={() => setIsBasicModalOpen(true)} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-16 h-16 border-2 border-border">
                  <AvatarImage
                    src={user?.user_metadata?.avatar_url}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-lg font-semibold">
                    {roleConfig.title
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{roleConfig.title}</CardTitle>
                  <CardDescription>{roleConfig.subtitle}</CardDescription>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {activeClinicName}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setIsBasicModalOpen(true)}
                size="sm"
                variant="ghost"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Contact Information</h4>
              <div className="space-y-2">
                {user?.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{user.email}</span>
                    <CheckCircle className="w-4 h-4 text-success" />
                  </div>
                )}
                {userProfile?.phone ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{userProfile.phone}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>Phone not provided</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <roleConfig.icon
                  className={`w-5 h-5 ${roleConfig.iconClass}`}
                />
                Role & Access
              </CardTitle>
              {doctorProfile && (
                <Button
                  onClick={() => setIsOnboardingModalOpen(true)}
                  size="sm"
                  variant="ghost"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
            </div>
            <CardDescription>
              Your role, clinic, and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Current Role
              </label>
              <p className="text-sm font-medium">{roleConfig.subtitle}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Clinic
              </label>
              <p className="text-sm">{activeClinicName}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Permissions
              </label>
              <p className="text-sm">
                {activeClinicRole === "superadmin"
                  ? "Full clinic management access"
                  : "Standard healthcare team access"}
              </p>
            </div>

            {doctorProfile && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Specialization
                    </label>
                    <p className="text-sm">
                      {doctorProfile.primary_specialization || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Department
                    </label>
                    <p className="text-sm">
                      {doctorProfile.department_name || "Not assigned"}
                    </p>
                  </div>
                </div>
              </>
            )}

            {!doctorProfile &&
              (activeClinicRole === "superadmin" ||
                activeClinicRole === "doctor") && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Medical Practice</h4>
                    <p className="text-xs text-muted-foreground">
                      {activeClinicRole === "superadmin"
                        ? "As a clinic administrator, you can also set up a medical practice profile"
                        : "Complete your medical profile to start seeing patients"}
                    </p>
                    <Button
                      onClick={() => setIsOnboardingModalOpen(true)}
                      className="w-full"
                      size="sm"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {activeClinicRole === "superadmin"
                        ? "Setup Medical Profile"
                        : "Complete Medical Profile"}
                    </Button>
                  </div>
                </>
              )}
          </CardContent>
        </Card>
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
            handleRefetch();
          }}
        />
      )}
    </div>
  );
}
