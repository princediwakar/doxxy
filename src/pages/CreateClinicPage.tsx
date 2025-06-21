import * as React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { Database } from "@/integrations/supabase/types";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Stethoscope, UserCheck, Building2 } from "lucide-react";

const supabase = getSupabase();

// Step 1: Clinic details schema
const clinicDetailsSchema = z.object({
  name: z.string().min(2, { message: "Clinic name must be at least 2 characters." }),
  address: z.string().optional(),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url({ message: "Invalid URL." }).optional().or(z.literal("")),
});

type ClinicDetailsForm = z.infer<typeof clinicDetailsSchema>;

// Step 2: Departments schema
const departmentsSchema = z.object({
  departments: z.array(z.string()).min(1, { message: "Select at least one department." }),
});
type DepartmentsForm = z.infer<typeof departmentsSchema>;

// Step 3: Doctor profile schema
const doctorProfileSchema = z.object({
  isDoctor: z.enum(['yes', 'no'], { required_error: 'Please specify if you are a practicing doctor.' }),
  availability: z.string().optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  selectedDepartment: z.string().optional(),
  primarySpecialization: z.string().optional(),
  consultationFee: z.coerce.number().min(0).default(500).optional(),
}).refine((data) => {
  if (data.isDoctor === 'yes' && !data.primarySpecialization?.trim()) {
    return false;
  }
  return true;
}, {
  message: "Medical specialization is required for practicing doctors",
  path: ["primarySpecialization"]
});
type DoctorProfileForm = z.infer<typeof doctorProfileSchema>;

const CreateClinicPage = () => {
  const { user, fetchUserAndClinicData, activeClinic } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [clinicDetails, setClinicDetails] = React.useState<ClinicDetailsForm>({
    name: "",
    address: "",
    email: "",
    phone: "",
    website: "",
  });
  const [departments, setDepartments] = React.useState<string[]>([]);
  const [doctorProfile, setDoctorProfile] = React.useState<DoctorProfileForm>({
    isDoctor: 'no',
    availability: '',
    bio: '',
    phone: '',
    selectedDepartment: '',
    primarySpecialization: '',
    consultationFee: 500,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Fetch department types
  const { data: departmentTypes, isLoading: isLoadingDepartmentTypes, error: departmentTypesError } = useQuery({
    queryKey: ["departmentTypes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("department_types").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  // Step 1 form
  const detailsForm = useForm<ClinicDetailsForm>({
    resolver: zodResolver(clinicDetailsSchema),
    defaultValues: clinicDetails,
    mode: "onTouched",
  });

  // Step 2 form
  const departmentsForm = useForm<DepartmentsForm>({
    resolver: zodResolver(departmentsSchema),
    defaultValues: { departments },
    mode: "onTouched",
  });

  // Step 3 form
  const doctorForm = useForm<DoctorProfileForm>({
    resolver: zodResolver(doctorProfileSchema),
    defaultValues: doctorProfile,
    mode: "onTouched",
  });

  // Keep forms in sync with state
  React.useEffect(() => {
    detailsForm.reset(clinicDetails);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step === 1]);
  React.useEffect(() => {
    departmentsForm.reset({ departments });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step === 2, departmentTypes]);
  React.useEffect(() => {
    doctorForm.reset(doctorProfile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step === 3]);

  // Step 1: Next
  const handleNext: SubmitHandler<ClinicDetailsForm> = (data) => {
    setClinicDetails(data);
    setStep(2);
  };

  // Step 2: Next
  const handleDepartmentsNext: SubmitHandler<DepartmentsForm> = (data) => {
    setDepartments(data.departments);
    setStep(3);
  };

  // Step 2: Back
  const handleBackFromDepartments = () => {
    setStep(1);
  };

  // Step 3: Back
  const handleBackFromDoctor = () => {
    setStep(2);
  };

  // Final Submit (Step 3)
  const handleCreateClinic: SubmitHandler<DoctorProfileForm> = async (data) => {
    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Use the create_clinic_with_admin function
      const { data: clinicResult, error: clinicError } = await supabase
        .rpc('create_clinic_with_admin', {
          clinic_name: clinicDetails.name,
          user_phone: user.phone || null
        })
        .single();

      if (clinicError) throw clinicError;
      if (!clinicResult) throw new Error("Clinic creation failed - no result returned.");
      
      const createdClinicId = clinicResult.clinic_id;

      // Update additional clinic details (address, email, phone, website)
      const { error: updateError } = await supabase
        .from('clinics')
        .update({
          address: clinicDetails.address || null,
          email: clinicDetails.email || null,
          phone: clinicDetails.phone || null,
          website: clinicDetails.website || null,
        })
        .eq('id', createdClinicId);

      if (updateError) throw updateError;

      // Insert selected departments into clinic_departments first
      if (departments.length > 0) {
        const departmentRows = departments.map((departmentTypeId) => ({
          clinic_id: createdClinicId,
          department_type_id: departmentTypeId,
        }));
        const { error: deptError } = await supabase
          .from('clinic_departments')
          .insert(departmentRows);
        if (deptError) throw deptError;
      }

      // Only create doctor profile if the superadmin is a practicing doctor
      if (data.isDoctor === 'yes') {
        const { data: existingDoctor, error: checkDoctorError } = await supabase
          .from('doctors')
          .select('id')
          .eq('user_id', user.id)
          .eq('clinic_id', createdClinicId)
          .maybeSingle();
        
        if (checkDoctorError) throw checkDoctorError;
        
        if (!existingDoctor) {
          // Find the clinic_department ID for the selected department
          let departmentId = null;
          if (data.selectedDepartment) {
            const { data: clinicDept, error: deptError } = await supabase
              .from('clinic_departments')
              .select('id')
              .eq('clinic_id', createdClinicId)
              .eq('department_type_id', data.selectedDepartment)
              .single();
            
            if (!deptError && clinicDept) {
              departmentId = clinicDept.id;
            }
          }

          const { error: doctorError } = await supabase
            .from('doctors')
            .insert({
              user_id: user.id,
              clinic_id: createdClinicId,
              name: user.user_metadata?.name || user.email || '',
              email: user.email,
              phone: data.phone || user.phone || '',
              department_id: departmentId,
              primary_specialization: data.primarySpecialization || null,
              consultation_fee_min: data.consultationFee || 500,
              consultation_fee_max: (data.consultationFee || 500) + 200,
              availability: data.availability || 'Available',
              bio: data.bio || `Medical professional specializing in ${data.primarySpecialization || 'healthcare'}`,
              is_active: true,
            });
          if (doctorError) throw doctorError;
        }
      }

      // Update auth context
      await fetchUserAndClinicData(user);
      
      const selectedDepartmentNames = departmentTypes?.filter(dt => departments.includes(dt.id)).map(dt => dt.name).join(", ") || "None";
      const doctorStatus = data.isDoctor === 'yes' ? "You will also appear in doctor lists for appointments." : "You will manage the clinic as an administrator only.";
      
      toast({
        title: "Success",
        description: `Clinic "${clinicDetails.name}" created successfully.\nDepartments: ${selectedDepartmentNames}\n${doctorStatus}`,
      });
      
      // Navigate to dashboard
      navigate("/", { replace: true });
    } catch (error: unknown) {
      console.error("Error creating clinic:", error);
      toast({
        title: "Error creating clinic",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step indicator
  const StepIndicator = () => (
    <div className="flex justify-center mb-6">
      <div className={`flex items-center space-x-2 text-sm font-medium ${step === 1 ? 'text-primary' : 'text-muted-foreground'}`}>
        1. Clinic Details
      </div>
      <div className="mx-2">→</div>
      <div className={`flex items-center space-x-2 text-sm font-medium ${step === 2 ? 'text-primary' : 'text-muted-foreground'}`}>
        2. Departments
      </div>
      <div className="mx-2">→</div>
      <div className={`flex items-center space-x-2 text-sm font-medium ${step === 3 ? 'text-primary' : 'text-muted-foreground'}`}>
        3. Your Role
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg shadow-md bg-white p-6">
        <h1 className="text-2xl font-bold mb-2 text-center">Create New Clinic</h1>
        <StepIndicator />
        
        {/* Step 1: Clinic Details */}
        {step === 1 && (
          <Form {...detailsForm}>
            <form onSubmit={detailsForm.handleSubmit(handleNext)} className="space-y-6">
              <FormField
                control={detailsForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clinic Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., City Medical Center" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={detailsForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 123 Main St" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={detailsForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g., info@clinic.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={detailsForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="e.g., +1 123 456 7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={detailsForm.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (Optional)</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="e.g., https://www.clinic.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={detailsForm.formState.isSubmitting}>
                Next: Select Departments
              </Button>
            </form>
          </Form>
        )}

        {/* Step 2: Departments */}
        {step === 2 && (
          <Form {...departmentsForm}>
            <form onSubmit={departmentsForm.handleSubmit(handleDepartmentsNext)} className="space-y-6">
              <FormField
                control={departmentsForm.control}
                name="departments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departments</FormLabel>
                    <div className="grid gap-2">
                      {isLoadingDepartmentTypes ? (
                        <div>Loading departments...</div>
                      ) : departmentTypesError ? (
                        <div className="text-red-500">Error loading departments.</div>
                      ) : departmentTypes && departmentTypes.length > 0 ? (
                        departmentTypes.map((dept: Database['public']['Tables']['department_types']['Row']) => (
                          <div key={dept.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`department-${dept.id}`}
                              checked={field.value?.includes(dept.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...(field.value || []), dept.id]);
                                } else {
                                  field.onChange((field.value || []).filter((id: string) => id !== dept.id));
                                }
                                setDepartments(field.value || []);
                              }}
                            />
                            <Label htmlFor={`department-${dept.id}`}>{dept.name}</Label>
                          </div>
                        ))
                      ) : (
                        <div>No departments found.</div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between gap-2">
                <Button type="button" variant="outline" onClick={handleBackFromDepartments} disabled={departmentsForm.formState.isSubmitting}>
                  Back
                </Button>
                <Button type="submit" className="w-full" disabled={departmentsForm.formState.isSubmitting}>
                  Next: Your Role
                </Button>
              </div>
            </form>
          </Form>
        )}

        {/* Step 3: Doctor Profile */}
        {step === 3 && (
          <Form {...doctorForm}>
            <form onSubmit={doctorForm.handleSubmit(handleCreateClinic)} className="space-y-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Are you a practicing doctor?</h3>
                  <p className="text-sm text-muted-foreground">
                    This determines whether you'll appear in appointment doctor lists or manage the clinic as an administrator only.
                  </p>
                </div>

                <FormField
                  control={doctorForm.control}
                  name="isDoctor"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-1 gap-4"
                        >
                          <Card className={`cursor-pointer transition-colors ${field.value === 'yes' ? 'ring-2 ring-primary' : ''}`}>
                            <CardContent className="flex items-center space-x-3 p-4">
                              <RadioGroupItem value="yes" id="yes" />
                              <div className="flex items-center space-x-3">
                                <Stethoscope className="h-5 w-5 text-primary" />
                                <div>
                                  <Label htmlFor="yes" className="font-medium cursor-pointer">
                                    Yes, I'm a practicing doctor
                                  </Label>
                                  <p className="text-sm text-muted-foreground">
                                    I will see patients and appear in appointment lists
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className={`cursor-pointer transition-colors ${field.value === 'no' ? 'ring-2 ring-primary' : ''}`}>
                            <CardContent className="flex items-center space-x-3 p-4">
                              <RadioGroupItem value="no" id="no" />
                              <div className="flex items-center space-x-3">
                                <Building2 className="h-5 w-5 text-primary" />
                                <div>
                                  <Label htmlFor="no" className="font-medium cursor-pointer">
                                    No, I'm an administrator only
                                  </Label>
                                  <p className="text-sm text-muted-foreground">
                                    I will manage the clinic but not see patients
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Doctor-specific fields */}
                {doctorForm.watch('isDoctor') === 'yes' && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium">Essential Medical Details</h4>
                    
                    {/* Department Selection - NEW FIELD */}
                    <FormField
                      control={doctorForm.control}
                      name="selectedDepartment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Department</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your primary department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departmentTypes
                                ?.filter(dt => departments.includes(dt.id))
                                .map((dept) => (
                                  <SelectItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Medical Specialization - NEW FIELD */}
                    <FormField
                      control={doctorForm.control}
                      name="primarySpecialization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medical Specialization *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Clinical Cardiology, General Medicine, Neurology"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                // Smart auto-suggestions based on department
                                const selectedDept = doctorForm.getValues('selectedDepartment');
                                const selectedDeptName = departmentTypes?.find(d => d.id === selectedDept)?.name;
                                if (selectedDeptName && !e.target.value && selectedDeptName !== 'General Medicine') {
                                  field.onChange(`Clinical ${selectedDeptName}`);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Consultation Fee - NEW FIELD */}
                    <FormField
                      control={doctorForm.control}
                      name="consultationFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Consultation Fee (₹)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="500"
                              min="0"
                              step="50"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 500)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={doctorForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., +91 98765 43210" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={doctorForm.control}
                      name="availability"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Availability (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Mon-Fri 9:00 AM - 5:00 PM" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={doctorForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Bio (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="e.g., Specialist in cardiology with 10+ years of experience..."
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-between gap-2">
                <Button type="button" variant="outline" onClick={handleBackFromDoctor} disabled={isSubmitting}>
                  Back
                </Button>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Creating Clinic..." : "Create Clinic"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
};

export default CreateClinicPage; 