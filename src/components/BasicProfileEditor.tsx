import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/integrations/supabase/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Save, 
  X, 
  Camera,
  Shield, 
  Clock, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
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

  // Initialize phone from profile data
  React.useEffect(() => {
    if (profileData?.phone) {
      setEditedPhone(profileData.phone);
    }
  }, [profileData?.phone]);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFormErrors(prev => ({ ...prev, photo: 'Please select an image file' }));
        return;
      }
      
      // Validate file size (max 5MB)
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

      // Create preview
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
      if (editedPhone && !/^\+?[\d\s\-()]+$/.test(editedPhone)) {
        errors.phone = 'Please enter a valid phone number';
      }
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        throw new Error('Validation failed');
      }

      let avatarUrl = user?.user_metadata?.avatar_url;

      // Upload photo if selected
      if (profilePhoto) {
        const fileExt = profilePhoto.name.split('.').pop();
        const fileName = `${user!.id}_${Date.now()}.${fileExt}`;
        
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

      if (authError) throw authError;

      // Update or create profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user!.id,
          name: editedName.trim(),
          email: user!.email,
          phone: editedPhone.trim() || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (profileError) throw profileError;
    },
    onSuccess: () => {
      setFormErrors({});
      toast({ 
        title: 'Profile updated successfully!', 
        description: 'Your changes have been saved.',
        variant: 'default'
      });
      onProfileUpdate?.();
      onClose();
    },
    onError: (error: Error) => {
      if (error.message !== 'Validation failed') {
        toast({ 
          title: 'Error updating profile', 
          description: error.message, 
          variant: 'destructive' 
        });
      }
    },
  });

  const handleSaveChanges = () => {
    updateBasicProfileMutation.mutate();
  };

  const handleCancel = () => {
    setEditedName(user?.user_metadata?.name || '');
    setEditedPhone(profileData?.phone || '');
    setProfilePhoto(null);
    setPhotoPreview(user?.user_metadata?.avatar_url || '');
    setFormErrors({});
    onClose();
  };

  const lastLoginDate = user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never';

  if (!open) return null;
  if (profileLoading) return null; // Wait for profile data to load

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="pt-6 space-y-6">
            {/* Simple Profile Header */}
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-border">
                <AvatarImage 
                  src={photoPreview} 
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {editedName?.split(' ').map((n: string) => n[0]).join('') || user?.user_metadata?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
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

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name <span className="text-red-500">*</span>
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
                  <p className="text-red-500 text-sm">{formErrors.name}</p>
                )}
              </div>

              {/* Phone Field */}
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
                  <p className="text-red-500 text-sm">{formErrors.phone}</p>
                )}
              </div>

              {/* Photo Upload Field */}
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
                  <p className="text-red-500 text-sm">{formErrors.photo}</p>
                )}
              </div>

              {/* Email Field - Read Only */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email Address</Label>
                <div className="p-3 bg-muted/30 rounded-lg border flex items-center justify-between">
                  <span className="text-sm">{user?.email}</span>
                  <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50">
                    Verified
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
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