import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabase } from '@/integrations/supabase/client';
import { Tables } from "@/integrations/supabase/types";
import { z } from "zod";
import { toast } from "sonner";
import { 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Save, 
  Settings,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";

const supabase = getSupabase();

const clinicDetailsSchema = z.object({
  name: z.string().min(1, "Clinic name is required").max(100, "Name too long"),
  address: z.string().min(1, "Address is required").max(200, "Address too long"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required").regex(/^[+\-\s\d()]+$/, "Invalid phone format"),
  website: z.string().optional().or(z.literal("")).refine((val) => {
    if (!val || val === "") return true; // Empty is allowed
    
    // Allow common website patterns without being too strict
    const websitePattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    const domainPattern = /^[\da-z.-]+\.([a-z.]{2,6})$/i;
    
    return websitePattern.test(val) || domainPattern.test(val);
  }, { message: "Please enter a valid website (e.g., example.com or https://example.com)" }),
});

type ClinicDetailsForm = z.infer<typeof clinicDetailsSchema>;

interface ValidationError {
  field: keyof ClinicDetailsForm;
  message: string;
}

const ClinicDetailsManagement = () => {
  const { activeClinic, activeClinicRole } = useAuth();
  const queryClient = useQueryClient();
  const clinic = activeClinic?.clinics as Tables<'clinics'> | null;
  
  const [form, setForm] = useState<ClinicDetailsForm>({
    name: "",
    address: "",
    email: "",
    phone: "",
    website: "",
  });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize form with clinic data
  useEffect(() => {
    if (clinic) {
      const initialForm = {
        name: clinic.name || "",
        address: clinic.address || "",
        email: clinic.email || "",
        phone: clinic.phone || "",
        website: clinic.website || "",
      };
      setForm(initialForm);
      setHasUnsavedChanges(false);
    }
  }, [clinic]);

  const isSuperadmin = activeClinicRole === 'superadmin';

  // Fetch clinic details with React Query
  const { data: clinicData, isLoading: isLoadingClinic } = useQuery({
    queryKey: ['clinic', clinic?.id],
    queryFn: async () => {
      if (!clinic?.id) return null;
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', clinic.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!clinic?.id,
  });

  // Update clinic mutation
  const updateClinicMutation = useMutation({
    mutationFn: async (formData: ClinicDetailsForm) => {
      if (!clinic?.id) throw new Error('No clinic found');
      
      const { name, address, email, phone, website } = formData;
      const { error } = await supabase
        .from("clinics")
        .update({ 
          name, 
          address, 
          email, 
          phone, 
          website: website || null 
        })
        .eq("id", clinic.id);
      
      if (error) throw error;
      return formData;
    },
    onSuccess: () => {
      toast.success("Clinic details updated successfully");
      setHasUnsavedChanges(false);
      setValidationErrors([]);
      queryClient.invalidateQueries({ queryKey: ['clinic', clinic?.id] });
    },
    onError: (error: Error) => {
      toast.error("Failed to update clinic details: " + error.message);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);
    
    // Clear validation error for this field
    setValidationErrors(prev => prev.filter(err => err.field !== name));
  };

  const validateForm = () => {
    const result = clinicDetailsSchema.safeParse(form);
    if (!result.success) {
      const errors: ValidationError[] = result.error.errors.map(err => ({
        field: err.path[0] as keyof ClinicDetailsForm,
        message: err.message,
      }));
      setValidationErrors(errors);
      return false;
    }
    setValidationErrors([]);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix validation errors");
      return;
    }
    
    updateClinicMutation.mutate(form);
  };

  const getFieldError = (field: keyof ClinicDetailsForm) => {
    return validationErrors.find(err => err.field === field)?.message;
  };

  const hasFieldError = (field: keyof ClinicDetailsForm) => {
    return validationErrors.some(err => err.field === field);
  };

  // Early return for access control after all hooks
  if (!isSuperadmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Access Denied</p>
            <p className="text-sm">Only Superadmins can manage clinic details.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!clinic) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Building className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No clinic selected</p>
            <p className="text-sm">Please select a clinic to manage its details.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Clinic Details</h2>
          <p className="text-muted-foreground">
            Manage your clinic's basic information and contact details
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-amber-600 border-amber-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
          {!hasUnsavedChanges && !updateClinicMutation.isPending && (
            <Badge variant="outline" className="text-green-600 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Saved
            </Badge>
          )}
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Clinic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingClinic ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-muted/50 rounded w-24 animate-pulse" />
                  <div className="h-10 bg-muted/50 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Clinic Name */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    Clinic Name *
                  </label>
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    disabled={updateClinicMutation.isPending}
                    placeholder="Enter clinic name"
                    className={hasFieldError('name') ? 'border-red-500' : ''}
                  />
                  {hasFieldError('name') && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {getFieldError('name')}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    Email Address *
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={updateClinicMutation.isPending}
                    placeholder="contact@clinic.com"
                    className={hasFieldError('email') ? 'border-red-500' : ''}
                  />
                  {hasFieldError('email') && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {getFieldError('email')}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    Phone Number *
                  </label>
                  <Input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={updateClinicMutation.isPending}
                    placeholder="+1 (555) 123-4567"
                    className={hasFieldError('phone') ? 'border-red-500' : ''}
                  />
                  {hasFieldError('phone') && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {getFieldError('phone')}
                    </p>
                  )}
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium">
                    <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                    Website (Optional)
                  </label>
                  <Input
                    name="website"
                    type="text"
                    value={form.website}
                    onChange={handleChange}
                    disabled={updateClinicMutation.isPending}
                    placeholder="www.clinic.com"
                    className={hasFieldError('website') ? 'border-red-500' : ''}
                  />
                  {hasFieldError('website') && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {getFieldError('website')}
                    </p>
                  )}
                </div>
              </div>

              {/* Address - Full Width */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  Address *
                </label>
                <Input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  disabled={updateClinicMutation.isPending}
                  placeholder="123 Medical Center Drive, City, State 12345"
                  className={hasFieldError('address') ? 'border-red-500' : ''}
                />
                {hasFieldError('address') && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {getFieldError('address')}
                  </p>
                )}
              </div>

{/* Place for Clinic Timings Editor */}

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={updateClinicMutation.isPending || !hasUnsavedChanges}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>
                    {updateClinicMutation.isPending ? "Saving..." : "Save Changes"}
                  </span>
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicDetailsManagement; 