// src/components/BasicProfileEditor.tsx
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  User as UserIcon, 
  Save, 
  X, 
  Upload
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const supabase = getSupabase();

interface BasicProfileEditorProps {
  open: boolean;
  onClose: () => void;
  user: User;
  onProfileUpdate?: () => void;
}

export const BasicProfileEditor: React.FC<BasicProfileEditorProps> = ({ 
  open,
  onClose,
  user, 
  onProfileUpdate 
}) => {
  const { toast } = useToast();
  const { markProfileComplete, activeClinic } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [editedName, setEditedName] = useState(user?.user_metadata?.name || '');
  const [editedPhone, setEditedPhone] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(user?.user_metadata?.avatar_url || '');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch profile data from profiles table
  const { data: profileData, isLoading: profileLoading } = useQuery({
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
    enabled: !!user?.id && open,
  });

  // Initialize phone and name from profile data
  React.useEffect(() => {
    if (profileData?.name) {
      setEditedName(profileData.name);
    }
    if (profileData?.phone) {
      setEditedPhone(profileData.phone);
    }
  }, [profileData]);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFormErrors(prev => ({ ...prev, photo: 'Please select an image file' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, photo: 'File size must be less than 5MB' }));
        return;
      }

      setProfilePhoto(file);
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.photo;
        return newErrors;
      });

      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateBasicProfileMutation = useMutation({
    mutationFn: async () => {
      // Validate
      const errors: Record<string, string> = {};
      if (!editedName.trim()) {
        errors.name = 'Name is required';
      }
      if (editedPhone && !/^\+?[0-9]{10,15}$/.test(editedPhone)) {
        errors.phone = 'Please enter a valid phone number';
      }
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        throw new Error('Validation failed');
      }

      let avatarUrl = user?.user_metadata?.avatar_url;

      // Upload photo if selected
      if (profilePhoto) {
        const fileExt = profilePhoto.name?.split('.').pop() || 'jpg';
        const fileName = `${user?.id}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, profilePhoto);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        avatarUrl = urlData.publicUrl;
      }

      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name: editedName.trim(),
          avatar_url: avatarUrl,
        }
      });
      if (authError) {
        throw authError;
      }

      // Create or update profiles table
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user?.id || '')
        .maybeSingle();

      if (!existingProfile) {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: user?.id || '',
          name: editedName.trim(),
          phone: editedPhone.trim() || null,
          email: user?.email || null,
          avatar_url: avatarUrl, // Sync avatar URL from user metadata
          created_at: new Date().toISOString(),
        });
        if (insertError) {
          console.error('Profile insert error:', insertError);
          throw insertError;
        }
      } else {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            name: editedName.trim(),
            phone: editedPhone.trim() || null,
            email: user?.email || null,
            avatar_url: avatarUrl, // Sync avatar URL from user metadata
            updated_at: new Date().toISOString()
          })
          .eq('id', user?.id || '');
        if (profileError) {
          console.error('Profile update error:', profileError);
          throw profileError;
        }
      }

      // Update doctors table if user has a doctor profile
      const { data: doctorProfile } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user?.id || '')
        .maybeSingle();

      if (doctorProfile) {
        const { error: doctorError } = await supabase
          .from('doctors')
          .update({
            name: editedName.trim(),
            phone: editedPhone.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user?.id || '');
        if (doctorError) {
          console.error('Doctor update error:', doctorError);
          throw doctorError;
        }
      }
    },
    onSuccess: () => {
      setFormErrors({});
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['doctorProfile', user?.id, activeClinic?.clinics?.id] });
      toast({ 
        title: 'Profile updated successfully!', 
        description: 'Your changes have been saved.',
        variant: 'default'
      });
      markProfileComplete();
      onProfileUpdate?.();
      onClose();
    },
    onError: (error: Error) => {
      console.error('Profile update failed:', error);
      if (error.message !== 'Validation failed') {
        toast({ 
          title: 'Error updating profile', 
          description: error.message, 
          variant: 'destructive' 
        });
      }
    },
    onSettled: () => {
    },
  });

  const handleSaveChanges = () => {
    updateBasicProfileMutation.mutate();
  };

  const handleCancel = () => {
    setEditedName(profileData?.name || user?.user_metadata?.name || '');
    setEditedPhone(profileData?.phone || '');
    setProfilePhoto(null);
    setPhotoPreview(user?.user_metadata?.avatar_url || '');
    setFormErrors({});
    onClose();
  };

  if (!open) return null;
  if (profileLoading) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <UserIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-xl font-semibold">Edit Profile</span>
              <DialogDescription className="text-sm">
                Manage your basic profile information
              </DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="pt-6 space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-border">
                <AvatarImage 
                  src={photoPreview} 
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {editedName?.split(' ').map((n: string) => n[0]).join('') || (user?.user_metadata?.name ? user.user_metadata.name.split(' ').map((n: string) => n[0]).join('') : '') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground">
                  {editedName || user?.user_metadata?.name || 'Enter your name'}
                </h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={editedName}
                  onChange={(e) => {
                    setEditedName(e.target.value);
                    if (formErrors.name) {
                      setFormErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.name;
                        return newErrors;
                      });
                    }
                  }}
                  placeholder="Enter your full name"
                  className="h-11"
                />
                {formErrors.name && (
                  <p className="text-destructive text-sm">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={editedPhone}
                  onChange={(e) => {
                    setEditedPhone(e.target.value);
                    if (formErrors.phone) {
                      setFormErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.phone;
                        return newErrors;
                      });
                    }
                  }}
                  placeholder="Enter your phone number"
                  className="h-11"
                />
                {formErrors.phone && (
                  <p className="text-destructive text-sm">{formErrors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Profile Photo</Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {photoPreview && photoPreview !== user?.user_metadata?.avatar_url ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <span className="text-xs text-muted-foreground">Max 5MB, PNG/JPG/JPEG</span>
                </div>
                {formErrors.photo && (
                  <p className="text-destructive text-sm">{formErrors.photo}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Email Address</Label>
                <div className="p-3 bg-muted/30 rounded-lg border flex items-center justify-between">
                  <span className="text-sm">{user?.email}</span>
                  <Badge variant="outline" className="text-xs text-success border-success/20 bg-success/10">
                    Verified
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 border-t pt-4">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={updateBasicProfileMutation.isPending}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={updateBasicProfileMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {updateBasicProfileMutation.isPending ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};