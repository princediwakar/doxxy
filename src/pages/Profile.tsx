import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { 
  User,
  Shield,
  Stethoscope, 
  UserPlus, 
  Settings,
  AlertTriangle,
  Loader,
  Building2,
  Activity,
  GraduationCap,
  FileText,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  CheckCircle2,
  BookOpen,
  Heart,
  Users
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BasicProfileEditor } from "@/components/BasicProfileEditor";
import { MedicalCredentialsModal } from "@/components/doctor/MedicalCredentialsModal";
import { DoctorQuickOnboarding } from "@/components/doctor/DoctorQuickOnboarding";

const supabase = getSupabase();

interface ProfileStats {
  profileCompletion: number;
  enhancementScore: number;
  totalPatients?: number;
  totalConsultations?: number;
  yearsExperience?: number;
  completedToday?: number;
  registrationNumber: string;
  clinicRole: string;
}

interface DoctorProfile {
  id: string;
  name: string;
  primary_specialization?: string;
  medical_registration_number?: string;
  medical_council?: string;
  license_state?: string;
  medical_college?: string;
  years_of_experience?: number;
  department_id?: string;
  department_name?: string;
  bio?: string;
  consultation_fee_min?: number;
  consultation_fee_max?: number;
  medical_qualifications?: string;
  medical_license_state?: string;
  board_certifications?: string;
  professional_summary?: string;
  emergency_contact?: string;
}

const Profile = () => {
  const { user, activeClinic, activeClinicRole, hasDoctorProfile } = useAuth();
  const { toast } = useToast();
  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  // Fetch doctor profile if user has one
  const { data: doctorProfile, isLoading: isDoctorLoading } = useQuery({
    queryKey: ['doctorProfile', user?.id, activeClinic?.clinics?.id],
    queryFn: async () => {
      if (!user?.id || !activeClinic?.clinics?.id) return null;
      
      // Fetch doctor profile (without department_id - removed for multi-tenant architecture)
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', user.id)
        .eq('clinic_id', activeClinic.clinics.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No doctor profile found - this is normal for non-doctors
          return null;
        }
        throw error;
      }
      
      // Fetch department information from clinic_members table (proper multi-tenant approach)
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
      
      if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" error
      return data;
    },
    enabled: !!user?.id,
  });

  // Centralized and user-friendly profile completion calculation
  const calculateProfileStats = (): ProfileStats => {
    // Basic profile fields (4 total) - check avatar properly
    const hasAvatar = !!(user?.user_metadata?.avatar_url);
    const basicFields = [
      user?.user_metadata?.name,
      userProfile?.phone,
      user?.email,
      hasAvatar ? 'avatar' : null // Convert boolean to string for filter logic
    ];
    
    // Check if user is a doctor (either has doctor profile OR has doctor role)
    const isDoctorRole = activeClinicRole === 'doctor' || doctorProfile;
    
    // CORE required medical fields for 100% completion (5 fields - truly essential for practice)
    const coreRequiredMedicalFields = isDoctorRole ? [
      doctorProfile?.medical_registration_number,    // Essential for legal practice
      doctorProfile?.medical_council,                // Essential for verification
      doctorProfile?.primary_specialization,         // Essential for patient matching
      doctorProfile?.years_of_experience,           // Essential for credibility
      doctorProfile?.consultation_fee_min           // Essential for booking
    ] : [];

    // Optional enhancement fields (not counted toward 100%, but improve profile quality)
    const optionalEnhancementFields = isDoctorRole ? [
      doctorProfile?.medical_qualifications,
      doctorProfile?.medical_college,
      doctorProfile?.professional_summary,
      doctorProfile?.medical_license_state,
      doctorProfile?.board_certifications
    ] : [];

    const totalRequiredFields = basicFields.length + (isDoctorRole ? coreRequiredMedicalFields.length : 0);
    const completedRequiredFields = basicFields.filter(Boolean).length + coreRequiredMedicalFields.filter(Boolean).length;
    
    // Calculate completion percentage based on ONLY required fields (can reach 100%)
    const completionPercentage = Math.round((completedRequiredFields / totalRequiredFields) * 100);
    
    // Calculate enhancement score (additional quality beyond 100%)
    const totalEnhancementFields = optionalEnhancementFields.length;
    const completedEnhancementFields = optionalEnhancementFields.filter(Boolean).length;
    const enhancementScore = totalEnhancementFields > 0 ? 
      Math.round((completedEnhancementFields / totalEnhancementFields) * 100) : 0;
    
    return {
      profileCompletion: completionPercentage,
      enhancementScore: enhancementScore, // New field for optional enhancements
      totalPatients: 0, // TODO: Fetch from API
      totalConsultations: 0, // TODO: Fetch from API
      yearsExperience: doctorProfile?.years_of_experience,
      completedToday: 0, // TODO: Fetch from API
      registrationNumber: doctorProfile?.medical_registration_number || 'Not Set',
      clinicRole: activeClinicRole === 'superadmin' ? 'Administrator' : 
                 activeClinicRole === 'doctor' ? 'Medical Professional' : 'Staff Member'
    };
  };

  const stats = calculateProfileStats();

  const handleBecomeDoctorClick = () => {
    setIsOnboardingModalOpen(true);
  };

  const getRoleDisplayConfig = () => {
    const isDoctorRole = activeClinicRole === 'doctor' || doctorProfile;
    const isHybridSuperadmin = activeClinicRole === 'superadmin' && doctorProfile;

    if (isDoctorRole) {
      // Ensure consistent "Dr." prefix for all doctors
      const doctorName = doctorProfile?.name || user?.user_metadata?.name || 'Doctor';
      const displayName = doctorName.startsWith('Dr.') ? doctorName : `Dr. ${doctorName}`;
      
      return {
        title: displayName,
        subtitle: doctorProfile?.primary_specialization || 'Medical Professional',
        icon: Stethoscope,
        iconClass: "text-blue-600",
        bgClass: "bg-blue-50",
        badge: isHybridSuperadmin ? { text: 'Administrator', icon: Shield } : null
      };
    }

    if (activeClinicRole === 'superadmin') {
      return {
        title: user?.user_metadata?.name || 'Administrator',
        subtitle: 'Clinic Administrator',
        icon: Shield,
        iconClass: "text-slate-600",
        bgClass: "bg-slate-50",
        badge: null
      };
    }

    return {
      title: user?.user_metadata?.name || 'Staff Member',
      subtitle: 'Healthcare Team',
      icon: User,
      iconClass: "text-green-600",
      bgClass: "bg-green-50",
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
      {/* Consistent Page Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${roleConfig.bgClass}`}>
            <IconComponent className={`w-5 h-5 ${roleConfig.iconClass}`} />
                      </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">Profile</h1>
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
                  
      {/* Profile Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Basic Profile Card */}
        <Card className="medical-card">
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
                        {/* Profile Completion Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Profile Completion</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stats.profileCompletion}%</span>
                  {stats.profileCompletion === 100 && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>
              <Progress value={stats.profileCompletion} className="h-2" />
              {stats.profileCompletion === 100 ? (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-green-600 font-medium">
                    ✨ Profile Complete!
                  </p>
                  {/* Show enhancement score for doctors */}
                  {(activeClinicRole === 'doctor' || doctorProfile) && stats.enhancementScore > 0 && (
                    <span className="text-xs text-blue-600 font-medium">
                      +{stats.enhancementScore}% Enhanced
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Fill required fields to complete your profile
                </p>
              )}
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Contact Information</h4>
              <div className="space-y-2">
                {user?.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{user.email}</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
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

        {/* Medical Profile Card - Only for doctors */}
        {(activeClinicRole === 'doctor' || doctorProfile) && (
          <Card className="medical-card">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
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
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Complete Medical Profile
                  </Button>
                </div>
              )}
          </CardContent>
        </Card>
        )}

        {/* For non-doctors, show role-specific information */}
        {!hasDoctorProfile && (
          <Card className="medical-card">
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

              {/* Become Doctor option for superadmins */}
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
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
                  
      {/* Modal Components with corrected props */}
      {isBasicModalOpen && (
        <BasicProfileEditor 
          open={isBasicModalOpen}
          onClose={() => setIsBasicModalOpen(false)}
          user={user} 
          onProfileUpdate={() => {
            window.location.reload();
          }} 
        />
      )}

      {isMedicalModalOpen && (activeClinicRole === 'doctor' || doctorProfile) && (
        <MedicalCredentialsModal
          open={isMedicalModalOpen}
          onClose={() => setIsMedicalModalOpen(false)}
          doctorProfile={doctorProfile || undefined}
        />
      )}
      
      {isOnboardingModalOpen && (
        <DoctorQuickOnboarding 
          open={isOnboardingModalOpen}
          onClose={() => setIsOnboardingModalOpen(false)}
          onSuccess={() => {
            setIsOnboardingModalOpen(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default Profile;
