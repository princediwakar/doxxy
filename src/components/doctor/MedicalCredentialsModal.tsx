import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getSupabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import {
  GraduationCap,
  Building2,
  FileText,
  Calendar,
  MapPin,
  Save,
  Stethoscope,
  Shield,
  AlertCircle,
  Loader2,
  Users,
  Heart,
  Clock
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

const supabase = getSupabase();

type DoctorProfile = Tables<'doctors'>;

interface MedicalCredentialsModalProps {
  open: boolean;
  onClose: () => void;
  doctorProfile?: DoctorProfile;
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

export function MedicalCredentialsModal({ open, onClose, doctorProfile }: MedicalCredentialsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeClinic } = useAuth();
  const [activeTab, setActiveTab] = useState("registration");

  // Fetch departments
  const { data: departments = [] } = useQuery({
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
      
      return data.map((d: any) => ({ id: d.id, name: d.department_types?.name || 'Unnamed Department' }));
    },
    enabled: !!activeClinic?.clinics?.id,
  });

  // Fetch current department assignment from clinic_members table
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
      
      if (error) {
        console.error('Error fetching current department:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!doctorProfile?.user_id && !!activeClinic?.clinics?.id,
  });

  // Simple form state
  const [formData, setFormData] = useState({
    medical_registration_number: '',
    medical_council: '',
    medical_license_state: '',
    medical_license_expiry: '',
    medical_qualifications: '',
    medical_college: '',
    graduation_year: '',
    department_id: '',
    primary_specialization: '',
    medical_specializations: '',
    subspecialty: '',
    board_certifications: '',
    fellowship_details: '',
    professional_summary: '',
    years_of_experience: '',
    consultation_fee_min: '',
    consultation_fee_max: '',
    clinic_timings: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with existing data
  useEffect(() => {
    if (doctorProfile && open) {
      setFormData({
        medical_registration_number: doctorProfile.medical_registration_number || '',
        medical_council: doctorProfile.medical_council || '',
        medical_license_state: doctorProfile.medical_license_state || '',
        medical_license_expiry: doctorProfile.medical_license_expiry || '',
        medical_qualifications: Array.isArray(doctorProfile.medical_qualifications) ? doctorProfile.medical_qualifications.join(', ') : '',
        medical_college: doctorProfile.medical_college || '',
        graduation_year: doctorProfile.graduation_year?.toString() || '',
        department_id: currentDepartment?.department_id || '', // Get from clinic_members table
        primary_specialization: doctorProfile.primary_specialization || '',
        medical_specializations: Array.isArray(doctorProfile.medical_specializations) ? doctorProfile.medical_specializations.join(', ') : '',
        subspecialty: Array.isArray(doctorProfile.subspecialty) ? doctorProfile.subspecialty.join(', ') : '',
        board_certifications: Array.isArray(doctorProfile.board_certifications) ? doctorProfile.board_certifications.join(', ') : '',
        fellowship_details: doctorProfile.fellowship_details || '',
        professional_summary: doctorProfile.professional_summary || '',
        years_of_experience: doctorProfile.years_of_experience?.toString() || '',
        consultation_fee_min: doctorProfile.consultation_fee_min?.toString() || '',
        consultation_fee_max: doctorProfile.consultation_fee_max?.toString() || '',
        clinic_timings: typeof doctorProfile.clinic_timings === 'string' ? doctorProfile.clinic_timings : '',
      });
      
      // Clear any previous validation errors
      setValidationErrors({});
    }
  }, [doctorProfile, currentDepartment, open]);

  // Debug departments loading
  useEffect(() => {
    if (departments.length > 0) {
      console.log('MedicalCredentialsModal: Departments loaded:', departments);
    }
  }, [departments]);

  // Simple form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.medical_registration_number.trim()) {
      errors.medical_registration_number = 'Medical registration number is required';
    }
    
    if (!formData.medical_council) {
      errors.medical_council = 'Medical council is required';
    }
    
    if (!formData.department_id) {
      errors.department_id = 'Department is required';
    }
    
    if (!formData.primary_specialization.trim()) {
      errors.primary_specialization = 'Primary specialization is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Update mutation
  const updateCredentialsMutation = useMutation({
    mutationFn: async () => {
      if (!validateForm()) {
        throw new Error('Please fix the validation errors');
      }

      if (!doctorProfile?.user_id) {
        throw new Error('Doctor profile not found');
      }

      const updateData = {
        medical_registration_number: formData.medical_registration_number || null,
        medical_council: formData.medical_council || null,
        medical_license_state: formData.medical_license_state || null,
        medical_license_expiry: formData.medical_license_expiry || null,
        medical_qualifications: formData.medical_qualifications ? [formData.medical_qualifications] : null,
        medical_college: formData.medical_college || null,
        graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
        primary_specialization: formData.primary_specialization || null,
        medical_specializations: formData.medical_specializations ? [formData.medical_specializations] : null,
        subspecialty: formData.subspecialty ? [formData.subspecialty] : null,
        board_certifications: formData.board_certifications ? [formData.board_certifications] : null,
        fellowship_details: formData.fellowship_details || null,
        professional_summary: formData.professional_summary || null,
        years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : null,
        consultation_fee_min: formData.consultation_fee_min ? parseFloat(formData.consultation_fee_min) : null,
        consultation_fee_max: formData.consultation_fee_max ? parseFloat(formData.consultation_fee_max) : null,
        clinic_timings: formData.clinic_timings || null,
      };

      // Update the doctors table (without department_id - proper multi-tenant architecture)
      const { error: doctorError } = await supabase
        .from('doctors')
        .update(updateData)
        .eq('user_id', doctorProfile.user_id)
        .eq('clinic_id', activeClinic?.clinic_id);

      if (doctorError) throw doctorError;

      // CRITICAL FIX: Update department_id ONLY in clinic_members table (proper multi-tenant approach)
      if (activeClinic?.clinic_id) {
        const { error: clinicMemberError } = await supabase
          .from('clinic_members')
          .update({ department_id: formData.department_id || null })
          .eq('user_id', doctorProfile.user_id)
          .eq('clinic_id', activeClinic.clinic_id);

        if (clinicMemberError) {
          console.warn('Failed to update department in clinic_members:', clinicMemberError);
          // Don't fail the entire update for this, just warn
        }
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['doctorProfile'] });
      queryClient.invalidateQueries({ queryKey: ['clinicMembers'] });

      toast({
        title: "Success",
        description: "Medical credentials updated successfully.",
      });

      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCredentialsMutation.mutate();
  };

  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [validationErrors]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <Stethoscope className="w-6 h-6 text-blue-600" />
            Medical Credentials
                </DialogTitle>
        </DialogHeader>

        {/* Tabs - Fixed at top */}
        <div className="flex-shrink-0 border-b">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="registration">Registration</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="specialization">Specialization</TabsTrigger>
              <TabsTrigger value="practice">Practice</TabsTrigger>
          </TabsList>
          </Tabs>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-2">
          <form onSubmit={handleSubmit} className="pt-6 space-y-6">
              {/* Registration Tab */}
            {activeTab === "registration" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Medical Registration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="medical_registration_number">Registration Number *</Label>
                        <Input
                          id="medical_registration_number"
                          value={formData.medical_registration_number}
                          onChange={(e) => handleFieldChange('medical_registration_number', e.target.value)}
                          placeholder="e.g., MCI-12345"
                        />
                        {validationErrors.medical_registration_number && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.medical_registration_number}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="medical_council">Medical Council *</Label>
                        <Select value={formData.medical_council} onValueChange={(value) => handleFieldChange('medical_council', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select medical council" />
                          </SelectTrigger>
                          <SelectContent>
                            {MEDICAL_COUNCILS.map((council) => (
                              <SelectItem key={council} value={council}>{council}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {validationErrors.medical_council && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.medical_council}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="medical_license_state">License State</Label>
                        <Select value={formData.medical_license_state} onValueChange={(value) => handleFieldChange('medical_license_state', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {INDIAN_STATES.map((state) => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="medical_license_expiry">License Expiry</Label>
                        <Input
                          id="medical_license_expiry"
                          type="date"
                          value={formData.medical_license_expiry}
                          onChange={(e) => handleFieldChange('medical_license_expiry', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="department">Department *</Label>
                      <Select value={formData.department_id} onValueChange={(value) => handleFieldChange('department_id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {validationErrors.department_id && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.department_id}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

              {/* Education Tab */}
            {activeTab === "education" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Education & Qualifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="medical_qualifications">Medical Qualifications</Label>
                      <Input
                        id="medical_qualifications"
                        value={formData.medical_qualifications}
                        onChange={(e) => handleFieldChange('medical_qualifications', e.target.value)}
                          placeholder="e.g., MBBS, MD"
                      />
                    </div>

                      <div>
                        <Label htmlFor="medical_college">Medical College</Label>
                        <Input
                          id="medical_college"
                          value={formData.medical_college}
                          onChange={(e) => handleFieldChange('medical_college', e.target.value)}
                          placeholder="Name of medical college"
                        />
                      </div>
                      </div>
                      
                    <div>
                      <Label htmlFor="graduation_year">Graduation Year</Label>
                        <Input
                          id="graduation_year"
                          type="number"
                          value={formData.graduation_year}
                          onChange={(e) => handleFieldChange('graduation_year', e.target.value)}
                          placeholder="e.g., 2015"
                        />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

              {/* Specialization Tab */}
            {activeTab === "specialization" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Specialization
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="primary_specialization">Primary Specialization *</Label>
                      <Input
                        id="primary_specialization"
                          value={formData.primary_specialization} 
                        onChange={(e) => handleFieldChange('primary_specialization', e.target.value)}
                        placeholder="e.g., Cardiology"
                      />
                      {validationErrors.primary_specialization && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.primary_specialization}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="medical_specializations">Additional Specializations</Label>
                      <Input
                        id="medical_specializations"
                        value={formData.medical_specializations}
                        onChange={(e) => handleFieldChange('medical_specializations', e.target.value)}
                        placeholder="Comma-separated list"
                      />
                    </div>

                    <div>
                      <Label htmlFor="subspecialty">Subspecialty</Label>
                        <Input
                          id="subspecialty"
                          value={formData.subspecialty}
                          onChange={(e) => handleFieldChange('subspecialty', e.target.value)}
                          placeholder="e.g., Interventional Cardiology"
                        />
                      </div>
                      
                    <div>
                      <Label htmlFor="board_certifications">Board Certifications</Label>
                        <Input
                          id="board_certifications"
                          value={formData.board_certifications}
                          onChange={(e) => handleFieldChange('board_certifications', e.target.value)}
                          placeholder="Professional certifications"
                        />
                    </div>

                    <div>
                      <Label htmlFor="fellowship_details">Fellowship Details</Label>
                      <Textarea
                        id="fellowship_details"
                        value={formData.fellowship_details}
                        onChange={(e) => handleFieldChange('fellowship_details', e.target.value)}
                        placeholder="Details of fellowship programs"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

              {/* Practice Tab */}
            {activeTab === "practice" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Practice Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="professional_summary">Professional Summary</Label>
                      <Textarea
                        id="professional_summary"
                        value={formData.professional_summary}
                        onChange={(e) => handleFieldChange('professional_summary', e.target.value)}
                        placeholder="Brief professional summary"
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="years_of_experience">Years of Experience</Label>
                      <Input
                        id="years_of_experience"
                        type="number"
                        value={formData.years_of_experience}
                        onChange={(e) => handleFieldChange('years_of_experience', e.target.value)}
                        placeholder="e.g., 10"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="consultation_fee_min">Min Consultation Fee (₹)</Label>
                        <Input
                          id="consultation_fee_min"
                          type="number"
                          value={formData.consultation_fee_min}
                          onChange={(e) => handleFieldChange('consultation_fee_min', e.target.value)}
                          placeholder="e.g., 500"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="consultation_fee_max">Max Consultation Fee (₹)</Label>
                        <Input
                          id="consultation_fee_max"
                          type="number"
                          value={formData.consultation_fee_max}
                          onChange={(e) => handleFieldChange('consultation_fee_max', e.target.value)}
                          placeholder="e.g., 1000"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="clinic_timings">Doctor Availability Hours</Label>
                      <Input
                        id="clinic_timings"
                        value={formData.clinic_timings}
                        onChange={(e) => handleFieldChange('clinic_timings', e.target.value)}
                        placeholder="e.g., Mon-Fri 9:00 AM - 5:00 PM, Sat 9:00 AM - 1:00 PM"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Your personal availability hours for consultations
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </form>
          </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
            type="submit" 
              onClick={handleSubmit}
              disabled={updateCredentialsMutation.isPending}
          >
            {updateCredentialsMutation.isPending ? 'Saving...' : 'Save Credentials'}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 