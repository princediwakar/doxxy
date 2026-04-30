// src/components/doctor/DoctorQuickOnboarding.tsx
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useDoctorProfile } from "@/hooks/useDoctorProfile";
import {
  useDoctorQuickOnboarding,
  useClinicDepartmentsForOnboarding,
} from "@/hooks/useDoctorQuickOnboarding";
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

interface DoctorQuickOnboardingProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DoctorQuickOnboarding({ open, onClose, onSuccess }: DoctorQuickOnboardingProps) {
  const { user, activeClinic, markProfileComplete } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    selectedDepartment: '',
    primarySpecialization: '',
    consultation_fee: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data: profileData } = useUserProfile(user?.id);
  const { data: existingDoctorProfile } = useDoctorProfile(
    user?.id,
    activeClinic?.clinic_id
  );
  const { data: departments = [] } = useClinicDepartmentsForOnboarding(
    activeClinic?.clinic_id
  );

  const onboardMutation = useDoctorQuickOnboarding();
  const isSubmitting = onboardMutation.isPending;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // --- VALIDATION LOGIC ---
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Full Name is required';
    }
    if (!formData.selectedDepartment) {
      errors.selectedDepartment = 'Department selection is required';
    }
    if (!formData.primarySpecialization.trim()) {
      errors.primarySpecialization = 'Specialization is required';
    }
    if (!formData.consultation_fee || isNaN(parseInt(formData.consultation_fee))) {
      errors.consultation_fee = 'Please set a base fee (enter 0 if free)';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    onboardMutation.mutate(
      {
        name: formData.name,
        departmentId: formData.selectedDepartment,
        specialization: formData.primarySpecialization,
        consultationFee: parseInt(formData.consultation_fee),
        userId: user!.id,
        userEmail: user?.email,
        userPhone: user?.phone,
        clinicId: activeClinic!.clinic_id,
        existingDoctorProfile: !!existingDoctorProfile,
      },
      {
        onSuccess: () => {
          markProfileComplete();
          onSuccess();
          onClose();
        },
      }
    );
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
              {isSubmitting && <ButtonLoader loading={isSubmitting} className="mr-2" />}
              {existingDoctorProfile ? 'Update Medical Profile' : 'Create Medical Profile'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}