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
  Briefcase,
  Stethoscope,
  Shield,
  Heart,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

const supabase = getSupabase();

type DoctorProfile = Tables<'doctors'>;

type Department = {
  id: string;
  department_types: {
    name: string;
  } | null;
};

interface MedicalCredentialsModalProps {
  open: boolean;
  onClose: () => void;
  doctorProfile?: DoctorProfile;
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
  const [activeTab, setActiveTab] = useState("registration");

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
      
      if (error) {
        console.error('Error fetching current department:', error);
        return null;
      }
      
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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.medical_registration_number.trim()) errors.medical_registration_number = 'Medical registration number is required';
    if (!formData.medical_council) errors.medical_council = 'Medical council is required';
    if (!formData.department_id) errors.department_id = 'Department is required';
    if (!formData.medical_degree) errors.medical_degree = 'Medical degree is required';
    if (!formData.medical_college.trim()) errors.medical_college = 'Medical college is required';
    if (!formData.graduation_year.trim()) errors.graduation_year = 'Graduation year is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const updateCredentialsMutation = useMutation({
    mutationFn: async () => {
      if (!validateForm()) {
        throw new Error('Please fix the validation errors');
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

      if (clinicMemberError) {
        console.warn('Failed to update department in clinic_members:', clinicMemberError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorProfile'] });
      queryClient.invalidateQueries({ queryKey: ['clinicMembers'] });
      toast({
        title: "Success",
        description: "Medical credentials updated successfully.",
      });
      if (onSuccess) onSuccess();
      else onClose();
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
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-3">
            <Stethoscope className="w-6 h-6 text-blue-600" />
            Medical Credentials
          </DialogTitle>
        </DialogHeader>

        <div className="border-b px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="registration">Registration</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="specialization">Specialization</TabsTrigger>
              <TabsTrigger value="practice">Practice</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="flex-grow p-6 space-y-6">
              {activeTab === "registration" && (
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" />Medical Registration</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="medical_registration_number">Registration Number *</Label>
                        <Input id="medical_registration_number" value={formData.medical_registration_number} onChange={(e) => handleFieldChange('medical_registration_number', e.target.value)} placeholder="e.g., MCI-12345" />
                        {validationErrors.medical_registration_number && <p className="text-red-500 text-sm mt-1">{validationErrors.medical_registration_number}</p>}
                      </div>
                      <div>
                        <Label htmlFor="medical_council">Medical Council *</Label>
                        <Select value={formData.medical_council} onValueChange={(value) => handleFieldChange('medical_council', value)}>
                          <SelectTrigger><SelectValue placeholder="Select medical council" /></SelectTrigger>
                          <SelectContent>{MEDICAL_COUNCILS.map((council) => (<SelectItem key={council} value={council}>{council}</SelectItem>))}</SelectContent>
                        </Select>
                        {validationErrors.medical_council && <p className="text-red-500 text-sm mt-1">{validationErrors.medical_council}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="medical_license_state">License State</Label>
                        <Select value={formData.medical_license_state} onValueChange={(value) => handleFieldChange('medical_license_state', value)}>
                          <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                          <SelectContent>{INDIAN_STATES.map((state) => (<SelectItem key={state} value={state}>{state}</SelectItem>))}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="medical_license_expiry">License Expiry</Label>
                        <Input id="medical_license_expiry" type="date" value={formData.medical_license_expiry} onChange={(e) => handleFieldChange('medical_license_expiry', e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="department">Department *</Label>
                      <Select value={formData.department_id} onValueChange={(value) => handleFieldChange('department_id', value)}>
                        <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                        <SelectContent>{departments.map((dept) => (<SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>))}</SelectContent>
                      </Select>
                      {validationErrors.department_id && <p className="text-red-500 text-sm mt-1">{validationErrors.department_id}</p>}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "education" && (
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5" />Education & Qualifications</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-3">Undergraduate Medical Education</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="medical_degree">Medical Degree *</Label>
                          <Select value={formData.medical_degree} onValueChange={(value) => handleFieldChange('medical_degree', value)}>
                            <SelectTrigger><SelectValue placeholder="Select medical degree" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MBBS">MBBS</SelectItem>
                              <SelectItem value="BDS">BDS</SelectItem>
                              <SelectItem value="BAMS">BAMS</SelectItem>
                              <SelectItem value="BHMS">BHMS</SelectItem>
                              <SelectItem value="BUMS">BUMS</SelectItem>
                              <SelectItem value="BNYS">BNYS</SelectItem>
                              <SelectItem value="B.V.Sc">B.V.Sc</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          {validationErrors.medical_degree && <p className="text-red-500 text-sm mt-1">{validationErrors.medical_degree}</p>}
                        </div>
                        <div>
                          <Label htmlFor="medical_college">Medical College *</Label>
                          <Input id="medical_college" value={formData.medical_college} onChange={(e) => handleFieldChange('medical_college', e.target.value)} placeholder="Name of medical college" />
                          {validationErrors.medical_college && <p className="text-red-500 text-sm mt-1">{validationErrors.medical_college}</p>}
                        </div>
                        <div>
                          <Label htmlFor="medical_university">University/Board</Label>
                          <Input id="medical_university" value={formData.medical_university} onChange={(e) => handleFieldChange('medical_university', e.target.value)} placeholder="e.g., Delhi University, RGUHS" />
                        </div>
                        <div>
                          <Label htmlFor="graduation_year">Graduation Year *</Label>
                          <Input id="graduation_year" type="number" value={formData.graduation_year} onChange={(e) => handleFieldChange('graduation_year', e.target.value)} placeholder="e.g., 2015" min="1950" max={new Date().getFullYear()} />
                          {validationErrors.graduation_year && <p className="text-red-500 text-sm mt-1">{validationErrors.graduation_year}</p>}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-3">Postgraduate Training (Optional)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="postgraduate_degree">Postgraduate Degree</Label>
                          <Select value={formData.postgraduate_degree} onValueChange={(value) => handleFieldChange('postgraduate_degree', value)}>
                            <SelectTrigger><SelectValue placeholder="Select PG degree" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MD">MD</SelectItem>
                              <SelectItem value="MS">MS</SelectItem>
                              <SelectItem value="MDS">MDS</SelectItem>
                              <SelectItem value="Diploma">Diploma</SelectItem>
                              <SelectItem value="DNB">DNB</SelectItem>
                              <SelectItem value="MCh">MCh</SelectItem>
                              <SelectItem value="DM">DM</SelectItem>
                              <SelectItem value="Fellowship">Fellowship</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="pg_specialization">Specialization</Label>
                          <Input id="pg_specialization" value={formData.pg_specialization} onChange={(e) => handleFieldChange('pg_specialization', e.target.value)} placeholder="e.g., General Medicine, Orthopedics" />
                        </div>
                        <div>
                          <Label htmlFor="pg_institution">PG Institution</Label>
                          <Input id="pg_institution" value={formData.pg_institution} onChange={(e) => handleFieldChange('pg_institution', e.target.value)} placeholder="PG college/hospital name" />
                        </div>
                        <div>
                          <Label htmlFor="pg_completion_year">PG Completion Year</Label>
                          <Input id="pg_completion_year" type="number" value={formData.pg_completion_year} onChange={(e) => handleFieldChange('pg_completion_year', e.target.value)} placeholder="e.g., 2018" min="1950" max={new Date().getFullYear() + 10} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-3">📜 Additional Qualifications (Optional)</h4>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="additional_qualifications">Additional Qualifications</Label>
                          <Textarea id="additional_qualifications" value={formData.additional_qualifications} onChange={(e) => handleFieldChange('additional_qualifications', e.target.value)} placeholder="e.g., DNB, Fellowship details, Certifications" rows={2} />
                        </div>
                        <div>
                          <Label htmlFor="research_experience">Research Experience</Label>
                          <Textarea id="research_experience" value={formData.research_experience} onChange={(e) => handleFieldChange('research_experience', e.target.value)} placeholder="Research background, publications, projects" rows={2} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "specialization" && (
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Heart className="w-5 h-5" />Specialization</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="primary_specialization">Primary Specialization</Label>
                        <Input id="primary_specialization" value={formData.primary_specialization} onChange={(e) => handleFieldChange('primary_specialization', e.target.value)} placeholder="e.g., Cardiology" />
                      </div>
                      <div>
                        <Label htmlFor="medical_specializations">Additional Specializations</Label>
                        <Input id="medical_specializations" value={formData.medical_specializations} onChange={(e) => handleFieldChange('medical_specializations', e.target.value)} placeholder="Comma-separated list" />
                      </div>
                      <div>
                        <Label htmlFor="subspecialty">Subspecialty</Label>
                        <Input id="subspecialty" value={formData.subspecialty} onChange={(e) => handleFieldChange('subspecialty', e.target.value)} placeholder="e.g., Interventional Cardiology" />
                      </div>
                      <div>
                        <Label htmlFor="board_certifications">Board Certifications</Label>
                        <Input id="board_certifications" value={formData.board_certifications} onChange={(e) => handleFieldChange('board_certifications', e.target.value)} placeholder="Professional certifications" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="fellowship_details">Fellowship Details</Label>
                      <Textarea id="fellowship_details" value={formData.fellowship_details} onChange={(e) => handleFieldChange('fellowship_details', e.target.value)} placeholder="Details of fellowship programs" rows={3} />
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "practice" && (
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5" />Practice Information</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="professional_summary">Professional Summary</Label>
                      <Textarea id="professional_summary" value={formData.professional_summary} onChange={(e) => handleFieldChange('professional_summary', e.target.value)} placeholder="Briefly describe your professional background and philosophy of care." rows={3} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="years_of_experience">Years of Experience</Label>
                        <Input id="years_of_experience" type="number" value={formData.years_of_experience} onChange={(e) => handleFieldChange('years_of_experience', e.target.value)} placeholder="e.g., 10" min="0" />
                      </div>
                      <div>
                        <Label htmlFor="consultation_fee">Consultation Fee (₹)</Label>
                        <Input id="consultation_fee" type="number" value={formData.consultation_fee} onChange={(e) => handleFieldChange('consultation_fee', e.target.value)} placeholder="e.g., 500" min="0" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="flex-shrink-0 flex justify-end gap-3 p-4 border-t bg-background sticky bottom-0">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateCredentialsMutation.isPending}>
                {updateCredentialsMutation.isPending ? 'Saving...' : 'Save Credentials'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}