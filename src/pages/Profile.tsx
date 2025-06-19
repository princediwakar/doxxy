import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const supabase = getSupabase();

const Profile = () => {
  const { user, activeClinicRole, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.user_metadata?.name || '');
  const [editedEmail, setEditedEmail] = useState(user?.email || '');
  const [editedPhotoUrl, setEditedPhotoUrl] = useState(user?.user_metadata?.avatar_url || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setEditedName(user.user_metadata?.name || '');
      setEditedEmail(user.email || '');
      setEditedPhotoUrl(user.user_metadata?.avatar_url || '');
    }
  }, [authLoading, user]);

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



  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center text-muted-foreground">Please log in to view your profile.</div>;
  }

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
                   <p className="text-xl font-semibold">{user?.user_metadata?.name || user?.email}</p>
                   <p className="text-sm text-muted-foreground">{user?.email}</p>
                   {activeClinicRole && (
                     <p className="text-sm text-muted-foreground">Role: {activeClinicRole}</p>
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


    </div>
  );
};

export default Profile;
