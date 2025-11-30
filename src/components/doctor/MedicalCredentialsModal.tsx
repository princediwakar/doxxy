// src/components/doctor/MedicalCredentialsModal.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getSupabase } from '@/integrations/supabase/client';
import { DbDoctor } from '@/types/core';
import { Department } from '@/types/doctor';
import {
  GraduationCap,
  Briefcase,
  Shield,
  Heart,
  Stethoscope,
  ScrollText,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

const supabase = getSupabase();

interface MedicalCredentialsModalProps {
  open: boolean;
  onClose: () => void;
  doctorProfile?: DbDoctor;
  onSuccess?: () => void;
}

const MEDICAL_COUNCILS = [
  'Medical Council of India (MCI)',
  'National Medical Commission (NMC)',
  'Delhi Medical Council',
  'Maharashtra Medical Council',
  'Tamil Nadu Medical Council',
  'Karnataka Medical Council',
  'Gujarat Medical Council',
  'West Bengal Medical Council',
  'Andhra Pradesh Medical Council',
  'Telangana State Medical Council',
  'Kerala State Medical Council',
  'Punjab Medical Council',
  'Haryana Medical Council',
  'Uttar Pradesh Medical Council',
  'Madhya Pradesh Medical Council',
  'Rajasthan Medical Council',
  'Bihar Medical Council',
  'Odisha State Medical Council',
  'Assam Medical Council'
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export function MedicalCredentialsModal({ open, onClose, doctorProfile, onSuccess }: MedicalCredentialsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeClinic } = useAuth();
  const [activeTab, setActiveTab] = useState("practice");

  useQuery({
    queryKey: ['clinicDepartments', activeClinic?.clinics?.id],
    queryFn: async () => {
      if (!activeClinic?.clinics?.id) return [];
      const { data, error } = await supabase
        .from('clinic_departments')
        .select('id, department_types(name)')
        .eq('clinic_id', activeClinic.clinics.id);
      
      if (error) {
        console.error('Error fetching departments:', error);
        return [];
      }
      return data.map((d: Department) => ({ id: d.id, name: d.department_types?.name || 'Unnamed Department' }));
    },
    enabled: !!activeClinic?.clinics?.id,
  });

  const { data: currentDepartment } = useQuery({
    queryKey: ['doctorDepartment', doctorProfile?.user_id, activeClinic?.clinics?.id],
    queryFn: async () => {
      if (!doctorProfile?.user_id || !activeClinic?.clinics?.id) return null;
      const { data, error } = await supabase
        .from('clinic_members')
        .select('department_id')
        .eq('user_id', doctorProfile.user_id)
        .eq('clinic_id', activeClinic.clinics.id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!doctorProfile?.user_id && !!activeClinic?.clinics?.id,
  });

  const [formData, setFormData] = useState({
    medical_registration_number: '',
    medical_council: '',
    medical_license_state: '',
    medical_license_expiry: '',
    department_id: '',
    primary_specialization: '',
    medical_specializations: '',
    subspecialty: '',
    board_certifications: '',
    fellowship_details: '',
    professional_summary: '',
    years_of_experience: '',
    consultation_fee: '',
    medical_degree: '',
    medical_college: '',
    graduation_year: '',
    medical_university: '',
    postgraduate_degree: '',
    pg_specialization: '',
    pg_institution: '',
    pg_completion_year: '',
    additional_qualifications: '',
    research_experience: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (doctorProfile && open) {
      setFormData({
        medical_registration_number: doctorProfile.medical_registration_number || '',
        medical_council: doctorProfile.medical_council || '',
        medical_license_state: doctorProfile.medical_license_state || '',
        medical_license_expiry: doctorProfile.medical_license_expiry || '',
        department_id: currentDepartment?.department_id || '',
        primary_specialization: doctorProfile.primary_specialization || '',
        medical_specializations: Array.isArray(doctorProfile.medical_specializations) ? doctorProfile.medical_specializations.join(', ') : '',
        subspecialty: Array.isArray(doctorProfile.subspecialty) ? doctorProfile.subspecialty.join(', ') : '',
        board_certifications: Array.isArray(doctorProfile.board_certifications) ? doctorProfile.board_certifications.join(', ') : '',
        fellowship_details: doctorProfile.fellowship_details || '',
        professional_summary: doctorProfile.professional_summary || '',
        years_of_experience: doctorProfile.years_of_experience?.toString() || '',
        consultation_fee: doctorProfile.consultation_fee?.toString() || '',
        medical_degree: doctorProfile.medical_degree || '',
        medical_college: doctorProfile.medical_college || '',
        graduation_year: doctorProfile.graduation_year?.toString() || '',
        medical_university: doctorProfile.medical_university || '',
        postgraduate_degree: doctorProfile.postgraduate_degree || '',
        pg_specialization: doctorProfile.pg_specialization || '',
        pg_institution: doctorProfile.pg_institution || '',
        pg_completion_year: doctorProfile.pg_completion_year?.toString() || '',
        additional_qualifications: doctorProfile.additional_qualifications || '',
        research_experience: doctorProfile.research_experience || '',
      });
      setValidationErrors({});
    }
  }, [doctorProfile, currentDepartment, open]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const updateCredentialsMutation = useMutation({
    mutationFn: async () => {
      if (!validateForm()) {
        throw new Error("Please check the form for errors.");
      }

      if (!doctorProfile?.user_id || !activeClinic?.clinic_id) {
        throw new Error('Doctor profile or active clinic not found');
      }

      const updateData = {
        medical_registration_number: formData.medical_registration_number || null,
        medical_council: formData.medical_council || null,
        medical_license_state: formData.medical_license_state || null,
        medical_license_expiry: formData.medical_license_expiry || null,
        primary_specialization: formData.primary_specialization || null,
        medical_specializations: formData.medical_specializations ? formData.medical_specializations.split(',').map(s => s.trim()) : null,
        subspecialty: formData.subspecialty ? formData.subspecialty.split(',').map(s => s.trim()) : null,
        board_certifications: formData.board_certifications ? formData.board_certifications.split(',').map(s => s.trim()) : null,
        fellowship_details: formData.fellowship_details || null,
        professional_summary: formData.professional_summary || null,
        years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : null,
        consultation_fee: formData.consultation_fee ? parseFloat(formData.consultation_fee) : null,
        medical_degree: formData.medical_degree || null,
        medical_college: formData.medical_college || null,
        graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
        medical_university: formData.medical_university || null,
        postgraduate_degree: formData.postgraduate_degree || null,
        pg_specialization: formData.pg_specialization || null,
        pg_institution: formData.pg_institution || null,
        pg_completion_year: formData.pg_completion_year ? parseInt(formData.pg_completion_year) : null,
        additional_qualifications: formData.additional_qualifications || null,
        research_experience: formData.research_experience || null,
      };

      const { error: doctorError } = await supabase
        .from('doctors')
        .update(updateData)
        .eq('user_id', doctorProfile.user_id);

      if (doctorError) throw doctorError;
      
      const { error: clinicMemberError } = await supabase
        .from('clinic_members')
        .update({ department_id: formData.department_id || null })
        .eq('user_id', doctorProfile.user_id)
        .eq('clinic_id', activeClinic.clinic_id);

      if (clinicMemberError) console.warn('Failed to update department', clinicMemberError);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorProfile'] });
      queryClient.invalidateQueries({ queryKey: ['clinicMembers'] });
      toast({ title: "Success", description: "Medical credentials updated." });
      if (onSuccess) onSuccess();
      else onClose();
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCredentialsMutation.mutate();
  };

  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
        setValidationErrors(prev => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }
  }, [validationErrors]);

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      {/* CHANGE 1: Removed h-[85vh], added max-h-[90vh] to allow shrinking */}
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
        
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Stethoscope className="h-5 w-5 text-primary" />
            Medical Credentials
          </DialogTitle>
          <DialogDescription>
            Manage professional qualifications and registration details.
          </DialogDescription>
        </DialogHeader>

        {/* CHANGE 2: Removed flex-1, added overflow-y-auto so scrolling happens only if needed */}
        <div className="overflow-y-auto bg-muted/5">
          <form id="credentials-form" onSubmit={handleSubmit} className="flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              
              <div className="px-6 pt-4 bg-background border-b sticky top-0 z-10">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="practice">Practice</TabsTrigger>
                  <TabsTrigger value="specialization">Specialty</TabsTrigger>
                  <TabsTrigger value="registration">License</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                </TabsList>
              </div>

              {/* Practice Tab */}
              <TabsContent value="practice" className="p-6 space-y-6 m-0 focus-visible:ring-0 outline-none animate-in fade-in-50">
                  <div className="space-y-3">
                    <Label htmlFor="professional_summary" className="text-base font-semibold flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> Professional Summary
                    </Label>
                    <Textarea 
                      id="professional_summary" 
                      value={formData.professional_summary} 
                      onChange={(e) => handleFieldChange('professional_summary', e.target.value)} 
                      placeholder="Briefly describe your background, philosophy of care, and key areas of expertise." 
                      className="min-h-[140px]" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="years_of_experience">Years of Experience</Label>
                      <Input id="years_of_experience" type="number" value={formData.years_of_experience} onChange={(e) => handleFieldChange('years_of_experience', e.target.value)} placeholder="e.g., 10" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="consultation_fee">Consultation Fee (₹)</Label>
                      <Input id="consultation_fee" type="number" value={formData.consultation_fee} onChange={(e) => handleFieldChange('consultation_fee', e.target.value)} placeholder="e.g., 500" />
                    </div>
                  </div>
              </TabsContent>

              {/* Specialization Tab */}
              <TabsContent value="specialization" className="p-6 space-y-6 m-0 focus-visible:ring-0 outline-none animate-in fade-in-50">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Primary Specialization</Label>
                      <Input value={formData.primary_specialization} onChange={(e) => handleFieldChange('primary_specialization', e.target.value)} placeholder="e.g., Cardiology" />
                    </div>
                    <div className="space-y-2">
                      <Label>Subspecialty</Label>
                      <Input value={formData.subspecialty} onChange={(e) => handleFieldChange('subspecialty', e.target.value)} placeholder="e.g., Interventional" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Additional Specializations</Label>
                      <Input value={formData.medical_specializations} onChange={(e) => handleFieldChange('medical_specializations', e.target.value)} placeholder="Comma-separated list" />
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                      <Heart className="w-4 h-4" /> Fellowships & Boards
                    </h4>
                    <div className="space-y-2">
                      <Label>Board Certifications</Label>
                      <Input value={formData.board_certifications} onChange={(e) => handleFieldChange('board_certifications', e.target.value)} placeholder="Professional certifications" />
                    </div>
                    <div className="space-y-2">
                      <Label>Fellowship Details</Label>
                      <Textarea value={formData.fellowship_details} onChange={(e) => handleFieldChange('fellowship_details', e.target.value)} placeholder="Fellowship program details" rows={2} />
                    </div>
                  </div>
              </TabsContent>

              {/* Registration Tab */}
              <TabsContent value="registration" className="p-6 space-y-6 m-0 focus-visible:ring-0 outline-none animate-in fade-in-50">
                   <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 text-blue-800 rounded-md">
                      <Shield className="w-5 h-5" />
                      <span className="text-sm font-medium">Please ensure license details match your official documents.</span>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Registration Number</Label>
                      <Input 
                        value={formData.medical_registration_number} 
                        onChange={(e) => handleFieldChange('medical_registration_number', e.target.value)} 
                        placeholder="e.g., MCI-12345"
                        className={validationErrors.medical_registration_number ? "border-red-500" : ""}
                      />
                      {validationErrors.medical_registration_number && (
                          <p className="text-xs text-red-500">{validationErrors.medical_registration_number}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Medical Council</Label>
                      <Select value={formData.medical_council} onValueChange={(value) => handleFieldChange('medical_council', value)}>
                        <SelectTrigger><SelectValue placeholder="Select council" /></SelectTrigger>
                        <SelectContent className="max-h-[200px]">{MEDICAL_COUNCILS.map((council) => (<SelectItem key={council} value={council}>{council}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>License State</Label>
                      <Select value={formData.medical_license_state} onValueChange={(value) => handleFieldChange('medical_license_state', value)}>
                        <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                        <SelectContent className="max-h-[200px]">{INDIAN_STATES.map((state) => (<SelectItem key={state} value={state}>{state}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>License Expiry</Label>
                      <Input type="date" value={formData.medical_license_expiry} onChange={(e) => handleFieldChange('medical_license_expiry', e.target.value)} />
                    </div>
                  </div>
              </TabsContent>

              {/* Education Tab */}
              <TabsContent value="education" className="p-6 space-y-8 m-0 focus-visible:ring-0 outline-none animate-in fade-in-50">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b pb-2">
                       <GraduationCap className="w-4 h-4" /> Undergraduate
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <Label>Degree <span className="text-red-500">*</span></Label>
                         <Select value={formData.medical_degree} onValueChange={(v) => handleFieldChange('medical_degree', v)}>
                          <SelectTrigger className={validationErrors.medical_degree ? "border-red-500" : ""}><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {['MBBS', 'BDS', 'BAMS', 'BHMS', 'Other'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                          </SelectContent>
                         </Select>
                         {validationErrors.medical_degree && (
                            <p className="text-xs text-red-500">{validationErrors.medical_degree}</p>
                         )}
                      </div>
                      <div className="space-y-2">
                         <Label>Graduation Year</Label>
                         <Input type="number" value={formData.graduation_year} onChange={(e) => handleFieldChange('graduation_year', e.target.value)} />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label>College / University</Label>
                        <Input value={formData.medical_college} onChange={(e) => handleFieldChange('medical_college', e.target.value)} placeholder="College Name" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b pb-2">
                       <ScrollText className="w-4 h-4" /> Postgraduate (Optional)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <Label>PG Degree</Label>
                         <Select value={formData.postgraduate_degree} onValueChange={(v) => handleFieldChange('postgraduate_degree', v)}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {['MD', 'MS', 'DNB', 'MCh', 'DM', 'Diploma'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                          </SelectContent>
                         </Select>
                      </div>
                      <div className="space-y-2">
                         <Label>Completion Year</Label>
                         <Input type="number" value={formData.pg_completion_year} onChange={(e) => handleFieldChange('pg_completion_year', e.target.value)} />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label>Specialization & Institution</Label>
                        <Input value={formData.pg_specialization} onChange={(e) => handleFieldChange('pg_specialization', e.target.value)} placeholder="Specialization (e.g. Pediatrics)" className="mb-2" />
                        <Input value={formData.pg_institution} onChange={(e) => handleFieldChange('pg_institution', e.target.value)} placeholder="Institution Name" />
                      </div>
                    </div>
                  </div>
              </TabsContent>
            </Tabs>
          </form>
        </div>

        <div className="p-4 border-t bg-background flex justify-between items-center shrink-0">
            <p className="text-xs text-muted-foreground">
              Fields marked with * are required.
            </p>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" form="credentials-form" disabled={updateCredentialsMutation.isPending}>
                {updateCredentialsMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}