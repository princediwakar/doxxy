// src/components/doctor/DoctorQuickOnboarding.tsx
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppState } from "@/contexts/AppStateContext";
import { quickOnboardDoctor } from "@/actions/doctors";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryUserProfile, queryDoctorProfile } from "@/lib/queries/profile";
import { queryClinicDepartments } from "@/lib/queries/clinic";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";
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
  const { user, activeClinicId } = useAppState();

  const [formData, setFormData] = useState({
    name: '',
    selectedDepartment: '',
    primarySpecialization: '',
    consultation_fee: '',
    signature: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data: profileData } = useQuery({
    queryKey: queryKeys.profile.user(user?.id ?? ""),
    queryFn: () => queryUserProfile(user!.id!),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: existingDoctorProfile } = useQuery({
    queryKey: queryKeys.profile.doctor(user?.id ?? "", activeClinicId ?? ""),
    queryFn: () => queryDoctorProfile(user!.id!, activeClinicId!),
    enabled: !!user?.id && !!activeClinicId,
    staleTime: 5 * 60 * 1000,
  });

  const queryClient = useQueryClient();

  const { data: departments = [] } = useQuery({
    queryKey: queryKeys.clinicDepartments.byClinic(activeClinicId ?? ""),
    queryFn: () => queryClinicDepartments(activeClinicId!),
    enabled: !!activeClinicId,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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
        selectedDepartment: existingDoctorProfile.department_id || '',
        primarySpecialization: existingDoctorProfile.primary_specialization || '',
        consultation_fee: existingDoctorProfile.consultation_fee?.toString() || '',
        signature: existingDoctorProfile.signature || '',
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
    if (!formData.consultation_fee || isNaN(parseInt(formData.consultation_fee))) {
      errors.consultation_fee = 'Please set a base fee (enter 0 if free)';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    handleQuickOnboard();
  };

  const handleQuickOnboard = async () => {
    if (!user?.id || !activeClinicId) return;
    setIsSubmitting(true);
    try {
      const result = await quickOnboardDoctor({
        name: formData.name,
        departmentId: formData.selectedDepartment,
        specialization: formData.primarySpecialization,
        consultationFee: parseInt(formData.consultation_fee),
        userId: user.id,
        userEmail: user?.email,
        userPhone: user?.phone,
        clinicId: activeClinicId,
        existingDoctorProfile: !!existingDoctorProfile,
        signature: formData.signature || undefined,
      });
      if ('error' in result && result.error) {
        toast.error(result.error);
        return;
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.user(user.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.doctor(user.id, activeClinicId) });
      queryClient.invalidateQueries({ queryKey: ['userHasDoctorProfile'] });
      toast.success('Medical profile ready! You can now start accepting appointments.');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save medical profile');
    } finally {
      setIsSubmitting(false);
    }
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
            {/* <p className="text-xs text-muted-foreground">Your professional name as it will appear to patients</p> */}
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
          </div>

          {/* Specialization */}
          <div className="space-y-2">
            <Label htmlFor="specialization" className="text-sm font-medium">
              Medical Specialization
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
          </div>

          {/* Professional Signature */}
          <div className="space-y-2">
            <Label htmlFor="signature" className="text-sm font-medium">
              Professional Signature
            </Label>
            <Textarea
              id="signature"
              value={formData.signature}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, signature: e.target.value }));
              }}
placeholder={"Dr. Firstname Lastname\nDegree 1, Degree 2 (Institution)\nSpecialty (Institution)\nNotable Achievement (e.g., Gold Medalist)"}              rows={4}
              className="resize-y"
            />
            <p className="text-xs text-muted-foreground">
              This appears at the bottom of printed consultation notes. Include your qualifications, registrations, and achievements.
            </p>
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