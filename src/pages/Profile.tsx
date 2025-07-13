import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabase } from '@/integrations/supabase/client';
import { 
  User,
  Shield,
  Stethoscope, 
  UserPlus, 
  Building2,
  Edit,
  Phone,
  Mail,
  CheckCircle,
  CheckCircle2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BasicProfileEditor } from "@/components/BasicProfileEditor";
import { MedicalCredentialsModal } from "@/components/doctor/MedicalCredentialsModal";
import { DoctorQuickOnboarding } from "@/components/doctor/DoctorQuickOnboarding";
import { useQueryClient } from '@tanstack/react-query';


const Profile = () => {
  const { user, activeClinic, activeClinicRole, hasDoctorProfile } = useAuth();
  const queryClient = useQueryClient();
  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [showPostOnboarding, setShowPostOnboarding] = useState(false);
  const [localHasDoctorProfile, setLocalHasDoctorProfile] = useState(hasDoctorProfile);

  useEffect(() => {
    setLocalHasDoctorProfile(hasDoctorProfile);
  }, [hasDoctorProfile]);
  const supabase = getSupabase()
  // Fetch doctor profile if user has one
  const { data: doctorProfile, isLoading: isDoctorLoading, refetch: refetchDoctorProfile } = useQuery({
    queryKey: ['doctorProfile', user?.id, activeClinic?.clinics?.id],
    queryFn: async () => {
      if (!user?.id || !activeClinic?.clinics?.id) return null;
      
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', user.id)
        .eq('clinic_id', activeClinic.clinics.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      
      const { data: memberData } = await supabase
        .from('clinic_members')
        .select(`
          department_id,
          clinic_departments(
            id,
            department_types(name)
          )
        `)
        .eq('user_id', user.id)
        .eq('clinic_id', activeClinic.clinics.id)
        .single();
      
      return {
        ...data,
        department_name: memberData?.clinic_departments?.department_types?.name || 'No Department'
      };
    },
    enabled: !!user?.id && !!activeClinic?.clinics?.id,
  });

  // Fetch user profile data from profiles table
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleBecomeDoctorClick = () => {
    setIsOnboardingModalOpen(true);
  };

  const getRoleDisplayConfig = () => {
    const isDoctorRole = activeClinicRole === 'doctor' || doctorProfile;
    const isHybridSuperadmin = activeClinicRole === 'superadmin' && doctorProfile;

    const displayName = userProfile?.name || user?.user_metadata?.name || 'User';

    if (isDoctorRole) {
      
      return {
        title: displayName,
        subtitle: doctorProfile?.primary_specialization || 'Medical Professional',
        icon: Stethoscope,
        iconClass: "",
        bgClass: "bg-muted",
        badge: isHybridSuperadmin ? { text: 'Superadmin', icon: Shield } : null
      };
    }

    if (activeClinicRole === 'superadmin') {
      return {
        title: displayName,
        subtitle: 'Clinic Administrator',
        icon: Shield,
        iconClass: "text-slate-600",
        bgClass: "bg-slate-50",
        badge: null
      };
    }

    return {
      title: displayName,
      subtitle: 'Healthcare Team',
      icon: User,
      iconClass: "text-success",
      bgClass: "bg-success/10",
      badge: null
    };
  };

  const roleConfig = getRoleDisplayConfig();
  const IconComponent = roleConfig.icon;

  if (isDoctorLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showPostOnboarding && (
        <Card className="bg-success/10 border-success/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-success" />
              <div>
                <h3 className="font-semibold text-foreground">Basic profile created!</h3>
                <p className="text-sm text-muted-foreground">Continue to add your full credentials for verification.</p>
              </div>
            </div>
            <Button onClick={() => {
              setIsMedicalModalOpen(true);
            }}>
              Complete Full Profile
            </Button>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${roleConfig.bgClass}`}>
            <IconComponent className={`w-5 h-5 ${roleConfig.iconClass}`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold ">Profile</h1>
            <p className="text-muted-foreground">Manage your profile information and settings</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {roleConfig.badge && (
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <roleConfig.badge.icon className="w-3 h-3 mr-1" />
              {roleConfig.badge.text}
            </Badge>
          )}
          <Button
            onClick={() => setIsBasicModalOpen(true)}
            variant="outline"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>
                  
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-16 h-16 border-2 border-border">
                  <AvatarImage 
                    src={user?.user_metadata?.avatar_url} 
                    className="object-cover"
                  />
                  <AvatarFallback className="text-lg font-semibold">
                    {roleConfig.title.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{roleConfig.title}</CardTitle>
                  <CardDescription>{roleConfig.subtitle}</CardDescription>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {activeClinic?.clinics?.name}
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

        {(activeClinicRole === 'doctor' || doctorProfile) && (
          <Card className="">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  Medical Profile
                </CardTitle>
                <Button 
                  onClick={() => setIsMedicalModalOpen(true)}
                  size="sm"
                  variant="ghost"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription>Professional medical credentials and information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {doctorProfile ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Specialization</label>
                      <p className="text-sm">{doctorProfile.primary_specialization || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Department</label>
                      <p className="text-sm">{doctorProfile.department_name || 'Not assigned'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Registration</label>
                      <p className="text-sm">{doctorProfile.medical_registration_number || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Experience</label>
                      <p className="text-sm">{doctorProfile.years_of_experience ? `${doctorProfile.years_of_experience} years` : 'Not specified'}</p>
                    </div>
                  </div>
                  
                  {doctorProfile.medical_college && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Medical College</label>
                      <p className="text-sm">{doctorProfile.medical_college}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Stethoscope className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-2">Medical profile not complete</p>
                  <p className="text-xs text-muted-foreground mb-4">Set up your professional credentials to start practicing</p>
                  <Button 
                    onClick={() => setIsMedicalModalOpen(true)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Complete Medical Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!localHasDoctorProfile && (
          <Card className="">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <roleConfig.icon className={`w-5 h-5 ${roleConfig.iconClass}`} />
                Role Information
              </CardTitle>
              <CardDescription>Your role and responsibilities in the clinic</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Current Role</label>
                <p className="text-sm font-medium">{roleConfig.subtitle}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Clinic</label>
                <p className="text-sm">{activeClinic?.clinics?.name}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Permissions</label>
                <p className="text-sm">
                  {activeClinicRole === 'superadmin' ? 'Full clinic management access' : 'Standard healthcare team access'}
                </p>
              </div>

              {activeClinicRole === 'superadmin' && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Medical Practice</h4>
                    <p className="text-xs text-muted-foreground">
                      As a clinic administrator, you can also set up a medical practice profile
                    </p>
                    <Button
                      onClick={handleBecomeDoctorClick}
                      className="w-full"
                      size="sm"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Setup Medical Profile
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
                  
      {isBasicModalOpen && (
        <BasicProfileEditor 
          open={isBasicModalOpen}
          onClose={() => setIsBasicModalOpen(false)}
          user={user} 
          onProfileUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['doctorProfile', user?.id, activeClinic?.clinics?.id] });
          }} 
        />
      )}

      {isMedicalModalOpen && (activeClinicRole === 'doctor' || doctorProfile) && (
        <MedicalCredentialsModal
          open={isMedicalModalOpen}
          onClose={() => setIsMedicalModalOpen(false)}
          doctorProfile={doctorProfile || undefined}
          onSuccess={() => {
            setIsMedicalModalOpen(false);
            setShowPostOnboarding(false);
            refetchDoctorProfile();
          }}
        />
      )}
      
      {isOnboardingModalOpen && (
        <DoctorQuickOnboarding 
          open={isOnboardingModalOpen}
          onClose={() => setIsOnboardingModalOpen(false)}
          onSuccess={() => {
            setIsOnboardingModalOpen(false);
            refetchDoctorProfile();
            setShowPostOnboarding(true);
            setLocalHasDoctorProfile(true);
          }}
        />
      )}
    </div>
  );
};

export default Profile;