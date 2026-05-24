// components/superadmin/ClinicDetailsManagement.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppState } from "@/contexts/AppStateContext";
import { updateClinic } from "@/actions/clinic";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { type DbClinic } from "@/types/core";
import { z } from "zod";
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Save,
  Settings,
  CheckCircle,
  AlertCircle
} from "lucide-react";

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
  google_place_id: z.string().optional().or(z.literal("")),
});

type ClinicDetailsForm = z.infer<typeof clinicDetailsSchema>;

interface ValidationError {
  field: keyof ClinicDetailsForm;
  message: string;
}

const ClinicDetailsManagement = () => {
  const { activeClinicId, activeClinicRole } = useAppState();
  const queryClient = useQueryClient();
  const supabase = getSupabase();

  const { data: clinicData, isLoading: isLoadingClinic } = useQuery({
    queryKey: ['clinic', 'details', activeClinicId],
    queryFn: async () => {
      if (!activeClinicId) return null;
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', activeClinicId)
        .single();
      if (error) throw error;
      return data as DbClinic;
    },
    enabled: !!activeClinicId,
  });

  const [isUpdating, setIsUpdating] = useState(false);
  
  const [form, setForm] = useState<ClinicDetailsForm>({
    name: "",
    address: "",
    email: "",
    phone: "",
    website: "",
    google_place_id: "",
  });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize form with clinic data
  useEffect(() => {
    if (clinicData) {
      const initialForm = {
        name: clinicData.name || "",
        address: clinicData.address || "",
        email: clinicData.email || "",
        phone: clinicData.phone || "",
        website: clinicData.website || "",
        google_place_id: clinicData.google_place_id || "",
      };
      setForm(initialForm);
      setHasUnsavedChanges(false);
    }
  }, [clinicData]);

  const isSuperadmin = activeClinicRole === 'superadmin';

  

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

    if (!activeClinicId) return;

    setIsUpdating(true);
    try {
      const result = await updateClinic(activeClinicId, form);
      if ('error' in result && result.error) {
        toast.error(result.error);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['clinic', 'details', activeClinicId] });
      setHasUnsavedChanges(false);
      setValidationErrors([]);
      toast.success('Clinic details updated');
    } catch {
      toast.error('Failed to update clinic details');
    } finally {
      setIsUpdating(false);
    }
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

  if (!activeClinicId) {
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
    <div className="space-y-6 px-4 md:px-0 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">About Clinic</h1>
            <p className="hidden sm:block text-muted-foreground">Basic info and contact details</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-success border-success/20">
              <AlertCircle className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Unsaved</span>
            </Badge>
          )}
          {!hasUnsavedChanges && !isUpdating && (
            <Badge variant="outline" className="text-success border-success/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Saved</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Form Card */}
      
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
            <form onSubmit={handleSubmit} className="space-y-6 border border-border rounded-lg p-4 md:p-6 w-full max-w-full overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                    disabled={isUpdating}
                    placeholder="Enter clinic name"
                    className={hasFieldError('name') ? 'border-destructive flex items-center' : ''}
                  />
                  {hasFieldError('name') && (
                    <p className="text-sm text-destructive flex items-center">
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
                    disabled={isUpdating}
                    placeholder="contact@clinic.com"
                    className={hasFieldError('email') ? 'border-destructive flex items-center' : ''}
                  />
                  {hasFieldError('email') && (
                    <p className="text-sm text-destructive flex items-center">
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
                    disabled={isUpdating}
                    placeholder="9000012345"
                    className={hasFieldError('phone') ? 'border-destructive flex items-center' : ''}
                  />
                  {hasFieldError('phone') && (
                    <p className="text-sm text-destructive flex items-center">
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
                    disabled={isUpdating}
                    placeholder="www.clinic.com"
                    className={hasFieldError('website') ? 'border-destructive flex items-center' : ''}
                  />
                  {hasFieldError('website') && (
                    <p className="text-sm text-destructive flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {getFieldError('website')}
                    </p>
                  )}
                </div>

                {/* Google Place ID */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    Google Place ID (Optional)
                  </label>
                  <Input
                    name="google_place_id"
                    type="text"
                    value={form.google_place_id}
                    onChange={handleChange}
                    disabled={isUpdating}
                    placeholder="ChIJ..."
                  />
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
                  disabled={isUpdating}
                  placeholder="123 Medical Center Drive, City, State 12345"
                  className={hasFieldError('address') ? 'border-destructive flex items-center' : ''}
                />
                {hasFieldError('address') && (
                  <p className="text-sm text-destructive flex items-center">
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
                  disabled={isUpdating || !hasUnsavedChanges}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </span>
                </Button>
              </div>
            </form>
          )}
    </div>
  );
};

export default ClinicDetailsManagement; 