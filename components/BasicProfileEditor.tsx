// src/components/BasicProfileEditor.tsx
"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { updateProfileEditor } from '@/actions/profile';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/query-keys';
import { toast } from 'sonner';
import { User as UserIcon, Save, X, Upload } from 'lucide-react';
import type { AppUser } from '@/types/core';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/loading';

const getInitials = (name?: string | null): string =>
  name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';

interface BasicProfileEditorProps {
  open: boolean;
  onClose: () => void;
  user: AppUser;
  onProfileUpdate?: () => void;
}

export const BasicProfileEditor: React.FC<BasicProfileEditorProps> = ({
  open,
  onClose,
  user,
  onProfileUpdate
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editedName, setEditedName] = useState(user?.user_metadata?.name || '');
  const [editedPhone, setEditedPhone] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(user?.user_metadata?.avatar_url || '');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const clearFormError = (field: string) => {
    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const queryClient = useQueryClient();
  const supabase = getSupabase();

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: queryKeys.profile.user(user?.id ?? ""),
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
    enabled: !!user?.id && open,
  });

  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (profileData?.name) setEditedName(profileData.name);
    if (profileData?.phone) setEditedPhone(profileData.phone);
  }, [profileData]);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) return setFormErrors(prev => ({ ...prev, photo: 'Select an image file' }));
      if (file.size > 5 * 1024 * 1024) return setFormErrors(prev => ({ ...prev, photo: 'Max size 5MB' }));

      setProfilePhoto(file);
      clearFormError('photo');

      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    const errors: Record<string, string> = {};
    if (!editedName.trim()) errors.name = 'Name is required';

    const cleanPhone = editedPhone ? editedPhone.replace(/[\s-]/g, '') : '';
    if (cleanPhone && !/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
      errors.phone = 'Valid phone number required';
    }

    if (Object.keys(errors).length > 0) return setFormErrors(errors);

    if (!user?.id) return;
    setIsUpdating(true);

    try {
      let avatarUrl = user?.user_metadata?.avatar_url;

      if (profilePhoto) {
        const fileExt = profilePhoto.name?.split('.').pop() || 'jpg';
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, profilePhoto);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
        avatarUrl = urlData.publicUrl;
      }

      const result = await updateProfileEditor({
        userId: user.id,
        name: editedName.trim(),
        phone: cleanPhone,
        avatarUrl,
        userEmail: user?.email,
      });

      if ('error' in result && result.error) throw new Error(result.error);

      queryClient.invalidateQueries({ queryKey: queryKeys.profile.user(user.id) });

      toast.success('Profile updated successfully!');
      onProfileUpdate?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error updating profile');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col bg-background text-foreground border-border shadow-lg">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <UserIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-xl font-semibold">Edit Identity</span>
              <DialogDescription className="text-sm">Manage your core account information</DialogDescription>
            </div>
          </DialogTitle>
        </DialogHeader>

        {profileLoading ? (
          <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="pt-4 space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 border-2 border-border">
                    <AvatarImage src={photoPreview} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                      {getInitials(editedName) || getInitials(user?.user_metadata?.name) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-2" /> Upload Photo
                      </Button>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </div>
                    {formErrors.photo && <p className="text-destructive text-xs">{formErrors.photo}</p>}
                  </div>
                </div>

                <Separator className="bg-border" />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                    <Input
                      id="name"
                      value={editedName}
                      onChange={(e) => { setEditedName(e.target.value); clearFormError('name'); }}
                      className="bg-background border-input"
                    />
                    {formErrors.name && <p className="text-destructive text-xs">{formErrors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={editedPhone}
                      onChange={(e) => { setEditedPhone(e.target.value); clearFormError('phone'); }}
                      className="bg-background border-input"
                    />
                    {formErrors.phone && <p className="text-destructive text-xs">{formErrors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="p-3 bg-muted rounded-lg border border-border flex items-center justify-between">
                      <span className="text-sm text-foreground">{user?.email}</span>
                      <Badge variant="outline" className="text-xs text-success border-success/20 bg-success/10">Verified</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 border-t border-border pt-4 mt-4">
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onClose} disabled={isUpdating}>Cancel</Button>
                <Button onClick={handleSaveChanges} disabled={isUpdating}>
                  {isUpdating ? <><Spinner size="sm" className="mr-2" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};