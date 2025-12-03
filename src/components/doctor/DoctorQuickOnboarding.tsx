// src/components/doctor/DoctorQuickOnboarding.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Stethoscope,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ButtonLoader } from '@/components/ui/loading';

const supabase = getSupabase();

interface DoctorQuickOnboardingProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DoctorQuickOnboarding({ open, onClose, onSuccess }: DoctorQuickOnboardingProps) {
  const { user, activeClinic, markProfileComplete } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    selectedDepartment: '',
    primarySpecialization: '',
    consultation_fee: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch profile data from profiles table
  const { data: profileData } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; 
      return data;
    },
    enabled: !!user?.id && open,
  });

  // Fetch existing doctor profile
  const { data: existingDoctorProfile } = useQuery({
    queryKey: ['doctorProfile', user?.id, activeClinic?.clinic_id],
    queryFn: async () => {
      if (!user?.id || !activeClinic?.clinic_id) return null;
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', user.id)
        .eq('clinic_id', activeClinic.clinic_id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id && !!activeClinic?.clinic_id && open,
  });

  // Initialize form with profile data
  React.useEffect(() => {
    if (profileData) {
      setFormData(prev => ({
        ...prev,
        name: profileData.name || user?.user_metadata?.name || '',
      }));
    }
    if (existingDoctorProfile) {
      setFormData(prev => ({
        ...prev,
        name: profileData?.name || existingDoctorProfile.name || user?.user_metadata?.name || '',
        primarySpecialization: existingDoctorProfile.primary_specialization || '',
        consultation_fee: existingDoctorProfile.consultation_fee?.toString() || '',
      }));
    }
  }, [profileData, existingDoctorProfile, user]);

  // Fetch available departments
  const { data: departments = [] } = useQuery({
    queryKey: ['clinicDepartments', activeClinic?.clinic_id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return [];
      const { data, error } = await supabase
        .from('clinic_departments')
        .select('id, department_types(id, name)')
        .eq('clinic_id', activeClinic.clinic_id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!activeClinic?.clinic_id && open,
  });

  const createOrUpdateDoctorMutation = useMutation({
    mutationFn: async () => {
      if (!user || !activeClinic) throw new Error('User or clinic not found');

      // --- VALIDATION LOGIC ---
      const errors: Record<string, string> = {};
      
      // 1. Name is Mandatory
      if (!formData.name.trim()) {
        errors.name = 'Full Name is required';
      }

      // 2. Department is Mandatory
      if (!formData.selectedDepartment) {
        errors.selectedDepartment = 'Department selection is required';
      }

      // 3. Specialization is Mandatory
      if (!formData.primarySpecialization.trim()) {
        errors.primarySpecialization = 'Specialization is required';
      }

      // 4. Consultation Fee is Mandatory
      if (!formData.consultation_fee || isNaN(parseInt(formData.consultation_fee))) {
        errors.consultation_fee = 'Please set a base fee (enter 0 if free)';
      }
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        throw new Error('Validation failed');
      }

      // --- DATABASE OPERATIONS ---

      // 1. Upsert Profile (Name only)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, phone')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        await supabase.from('profiles').insert({
          id: user.id,
          name: formData.name.trim(),
          email: user.email,
          created_at: new Date().toISOString(),
        });
      } else {
        // We only update name here, keeping existing phone if it exists in DB
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ name: formData.name.trim() })
          .eq('id', user.id);
          
        if (profileError) throw profileError;
      }

      // 2. Update Auth Metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { name: formData.name.trim() }
      });
      if (authError) throw authError;

      // 3. Upsert Doctor Record
      const doctorData = {
        name: formData.name.trim(),
        email: user.email || '',
        // Use existing profile phone, or auth phone, or empty string
        phone: existingProfile?.phone || user.phone || '', 
        primary_specialization: formData.primarySpecialization,
        consultation_fee: parseInt(formData.consultation_fee),
        bio: `Medical professional specializing in ${formData.primarySpecialization}`,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      if (existingDoctorProfile) {
        const { error: doctorError } = await supabase
          .from('doctors')
          .update(doctorData)
          .eq('user_id', user.id)
          .eq('clinic_id', activeClinic.clinic_id);
        if (doctorError) throw doctorError;
      } else {
        const { error: doctorError } = await supabase.from('doctors').insert({
          ...doctorData,
          user_id: user.id,
          clinic_id: activeClinic.clinic_id,
        });
        if (doctorError) throw doctorError;
      }

      // 4. Update Clinic Member Department
      const { error: deptError } = await supabase
        .from('clinic_members')
        .update({ department_id: formData.selectedDepartment })
        .eq('user_id', user.id)
        .eq('clinic_id', activeClinic.clinic_id);
      if (deptError) throw deptError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userHasDoctorProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['doctorProfile', user?.id, activeClinic?.clinic_id] });
      toast({ 
        title: "Success",
        description: "Medical profile ready! You can now start accepting appointments.",
      });
      markProfileComplete();
      onSuccess();
      onClose();
    },
    onError: (error: Error) => {
      if (error.message !== 'Validation failed') {
        toast({ 
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    createOrUpdateDoctorMutation.mutate();
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 p-2 rounded-full">
              <Stethoscope className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">Setup Medical Profile</DialogTitle>
              <p className="text-sm text-muted-foreground">Complete the essentials to start practicing</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value }));
                if (formErrors.name) {
                  setFormErrors(prev => ({ ...prev, name: '' }));
                }
              }}
              placeholder="Enter your full name"
            />
            {formErrors.name && (
              <p className="text-destructive text-sm">{formErrors.name}</p>
            )}
            <p className="text-xs text-muted-foreground">Your professional name as it will appear to patients</p>
          </div>

          {/* Department Selection */}
          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium">
              Department <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={formData.selectedDepartment} 
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, selectedDepartment: value }));
                if (formErrors.selectedDepartment) {
                  setFormErrors(prev => ({ ...prev, selectedDepartment: '' }));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your primary department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.department_types?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.selectedDepartment && (
              <p className="text-destructive text-sm">{formErrors.selectedDepartment}</p>
            )}
            <p className="text-xs text-muted-foreground">This helps with appointment categorization</p>
          </div>

          {/* Specialization */}
          <div className="space-y-2">
            <Label htmlFor="specialization" className="text-sm font-medium">
              Medical Specialization <span className="text-destructive">*</span>
            </Label>
            <Input
              id="specialization"
              value={formData.primarySpecialization}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, primarySpecialization: e.target.value }));
                if (formErrors.primarySpecialization) {
                  setFormErrors(prev => ({ ...prev, primarySpecialization: '' }));
                }
              }}
              placeholder="e.g., Cardiology, Neurology, General Medicine"
            />
             {formErrors.primarySpecialization && (
              <p className="text-destructive text-sm">{formErrors.primarySpecialization}</p>
            )}
            <p className="text-xs text-muted-foreground">Your area of medical expertise</p>
          </div>

          {/* Consultation Fee */}
          <div className="space-y-2">
            <Label htmlFor="fee" className="text-sm font-medium">
              Consultation Fee <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fee"
              type="number"
              value={formData.consultation_fee}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, consultation_fee: e.target.value }));
                if (formErrors.consultation_fee) {
                  setFormErrors(prev => ({ ...prev, consultation_fee: '' }));
                }
              }}
              placeholder="350"
              min="0"
            />
            {formErrors.consultation_fee && (
              <p className="text-destructive text-sm">{formErrors.consultation_fee}</p>
            )}
            <p className="text-xs text-muted-foreground">Base consultation fee (you can adjust this later)</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <ButtonLoader className="mr-2" />}
              {existingDoctorProfile ? 'Update Medical Profile' : 'Create Medical Profile'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}