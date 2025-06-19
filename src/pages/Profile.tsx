import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Stethoscope, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const supabase = getSupabase();

const Profile = () => {
  const { user, activeClinicRole, loading: authLoading, activeClinic } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.user_metadata?.name || '');
  const [editedEmail, setEditedEmail] = useState(user?.email || '');
  const [editedPhotoUrl, setEditedPhotoUrl] = useState(user?.user_metadata?.avatar_url || '');
  const [saving, setSaving] = useState(false);

  // Doctor profile fields
  const [isBecomingDoctor, setIsBecomingDoctor] = useState(false);
  const [doctorPhone, setDoctorPhone] = useState('');
  const [doctorAvailability, setDoctorAvailability] = useState('');
  const [doctorBio, setDoctorBio] = useState('');

  useEffect(() => {
    if (user) {
      setEditedName(user.user_metadata?.name || '');
      setEditedEmail(user.email || '');
      setEditedPhotoUrl(user.user_metadata?.avatar_url || '');
    }
  }, [authLoading, user]);

  // Check if user is already a doctor
  const { data: existingDoctorProfile, isLoading: isDoctorLoading } = useQuery({
    queryKey: ['userDoctorProfile', user?.id, activeClinic?.clinic_id],
    queryFn: async () => {
      if (!user?.id || !activeClinic?.clinic_id) return null;
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', user.id)
        .eq('clinic_id', activeClinic.clinic_id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!activeClinic?.clinic_id && activeClinicRole === 'superadmin',
  });

  const handleSaveChanges = async () => {
    if (!user) return;

    setSaving(true);
    const updates: { data?: { name?: string; avatar_url?: string }; email?: string } = {};

    if (editedName !== (user.user_metadata?.name || '')) {
        updates.data = { ...updates.data, name: editedName };
    }
    if (editedPhotoUrl !== (user.user_metadata?.avatar_url || '')) {
        updates.data = { ...updates.data, avatar_url: editedPhotoUrl };
    }
    if (editedEmail !== (user.email || '')) {
        updates.email = editedEmail;
    }

    if (Object.keys(updates).length === 0 || (updates.data && Object.keys(updates.data).length === 0 && !updates.email)) {
      setIsEditing(false);
      setSaving(false);
      toast({ title: "No changes detected." });
      return;
    }

    const { error } = await supabase.auth.updateUser(updates);

    if (error) {
      console.error('Error updating profile:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile updated successfully!' });
      setIsEditing(false);
    }
    setSaving(false);
  };

  // Mutation to create doctor profile
  const becomeDoctorMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !activeClinic?.clinic_id) throw new Error('Missing user or clinic data');
      
      const { error } = await supabase
        .from('doctors')
        .insert({
          user_id: user.id,
          clinic_id: activeClinic.clinic_id,
          name: user.user_metadata?.name || user.email || '',
          email: user.email,
          phone: doctorPhone || '',
          availability: doctorAvailability || 'Available',
          bio: doctorBio || 'Clinic Administrator and Practicing Doctor',
          is_active: true,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ 
        title: 'Success!', 
        description: 'You are now registered as a doctor and will appear in appointment lists.' 
      });
      queryClient.invalidateQueries({ queryKey: ['userDoctorProfile'] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setIsBecomingDoctor(false);
      setDoctorPhone('');
      setDoctorAvailability('');
      setDoctorBio('');
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Error', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const handleBecomeDoctor = () => {
    becomeDoctorMutation.mutate();
  };

  if (authLoading || isDoctorLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center text-muted-foreground">Please log in to view your profile.</div>;
  }

  const isAdminNotDoctor = activeClinicRole === 'superadmin' && !existingDoctorProfile;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
      <p className="text-muted-foreground">Manage your profile details.</p>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)} disabled={saving}>
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
             <Avatar className="h-16 w-16">
               <AvatarImage src={editedPhotoUrl} />
               <AvatarFallback className="text-2xl">{editedEmail?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}</AvatarFallback>
             </Avatar>
             <div className="flex-1 space-y-2">
               {isEditing ? (
                 <>
                   <div>
                     <Label htmlFor="editName">Name</Label>
                     <Input id="editName" value={editedName} onChange={(e) => setEditedName(e.target.value)} disabled={saving} />
                   </div>
                   <div>
                     <Label htmlFor="editEmail">Email</Label>
                     <Input id="editEmail" type="email" value={editedEmail} onChange={(e) => setEditedEmail(e.target.value)} disabled={saving} />
                   </div>
                   <div>
                     <Label htmlFor="editPhotoUrl">Photo URL (Optional)</Label>
                     <Input id="editPhotoUrl" value={editedPhotoUrl} onChange={(e) => setEditedPhotoUrl(e.target.value)} disabled={saving} />
                   </div>
                 </>
               ) : (
                 <>
                   <div className="flex items-center gap-2">
                     <p className="text-xl font-semibold">{user?.user_metadata?.name || user?.email}</p>
                     {activeClinicRole && (
                       <Badge variant="outline" className="capitalize">
                         {activeClinicRole === 'superadmin' ? 'Admin' : activeClinicRole}
                       </Badge>
                     )}
                     {existingDoctorProfile && (
                       <Badge variant="default">
                         <Stethoscope className="w-3 h-3 mr-1" />
                         Doctor
                       </Badge>
                     )}
                   </div>
                   <p className="text-sm text-muted-foreground">{user?.email}</p>
                   {activeClinic && (
                     <p className="text-sm text-muted-foreground">Clinic: {activeClinic.clinic_name}</p>
                   )}
                 </>
               )}
             </div>
          </div>
          {isEditing && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving}>Cancel</Button>
              <Button onClick={handleSaveChanges} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Become a Doctor Section - Only for superadmins who are not doctors */}
      {isAdminNotDoctor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Become a Practicing Doctor
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              As a clinic administrator, you can also register as a practicing doctor to see patients and appear in appointment lists.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isBecomingDoctor ? (
              <Button onClick={() => setIsBecomingDoctor(true)} className="w-full">
                <UserPlus className="w-4 h-4 mr-2" />
                Register as Doctor
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="doctorPhone">Professional Phone (Optional)</Label>
                  <Input 
                    id="doctorPhone" 
                    placeholder="e.g., +1 123 456 7890"
                    value={doctorPhone}
                    onChange={(e) => setDoctorPhone(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="doctorAvailability">Availability (Optional)</Label>
                  <Input 
                    id="doctorAvailability" 
                    placeholder="e.g., Mon-Fri 9:00 AM - 5:00 PM"
                    value={doctorAvailability}
                    onChange={(e) => setDoctorAvailability(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="doctorBio">Professional Bio (Optional)</Label>
                  <Textarea 
                    id="doctorBio" 
                    placeholder="e.g., Specialist in cardiology with 10+ years of experience..."
                    className="min-h-[80px]"
                    value={doctorBio}
                    onChange={(e) => setDoctorBio(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsBecomingDoctor(false)}
                    disabled={becomeDoctorMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleBecomeDoctor}
                    disabled={becomeDoctorMutation.isPending}
                    className="flex-1"
                  >
                    {becomeDoctorMutation.isPending ? "Registering..." : "Register as Doctor"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Doctor Profile Section - Only for existing doctors */}
      {existingDoctorProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Doctor Profile
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              You are registered as a practicing doctor and appear in appointment lists.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Professional Phone</Label>
                <p className="text-sm text-muted-foreground">{existingDoctorProfile.phone || 'Not set'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Availability</Label>
                <p className="text-sm text-muted-foreground">{existingDoctorProfile.availability || 'Not set'}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Professional Bio</Label>
              <p className="text-sm text-muted-foreground">{existingDoctorProfile.bio || 'Not set'}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Profile;
