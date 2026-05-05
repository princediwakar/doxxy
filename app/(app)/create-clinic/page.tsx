"use client";

import * as React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState } from "@/contexts/AppStateContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DbDepartmentType } from "@/types/core";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Stethoscope, Building2, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { queryDepartmentTypes } from "@/lib/queries/clinic";
import { queryKeys } from "@/lib/query-keys";
import { createClinicWithAdmin } from "@/actions/clinic";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/error-boundary/ErrorBoundary";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Step 1: Clinic details schema
const clinicDetailsSchema = z.object({
  name: z.string().min(2, { message: "Clinic name must be at least 2 characters." }),
  address: z.string().optional(),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().optional().or(z.literal("")).refine((val) => {
    if (!val || val === "") return true; // Empty is allowed
    
    // Allow common website patterns without being too strict
    const websitePattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    const domainPattern = /^[\da-z.-]+\.([a-z.]{2,6})$/i;
    
    return websitePattern.test(val) || domainPattern.test(val);
  }, { message: "Please enter a valid website (example.com or https://example.com)" }),
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
  bio: z.string().optional(),
  phone: z.string().optional(),
  selectedDepartment: z.string().superRefine((val, ctx) => {
    const parent = ctx.path[0] as unknown as { isDoctor: string };
    if (parent?.isDoctor === 'yes' && (!val || val.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one department when registering as a doctor."
      });
    }
  }),
  consultationFee: z.coerce.number().min(0).optional(),
});
type DoctorProfileForm = z.infer<typeof doctorProfileSchema>;

const CreateClinicPage = () => {
  const { user, setActiveClinicId } = useAppState();
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [clinicDetails, setClinicDetails] = React.useState<ClinicDetailsForm>({
    name: "",
    address: "",
    email: "",
    phone: "",
    website: "",
  });
  const [departments, setDepartments] = React.useState<string[]>([]);
  const [doctorProfile] = React.useState<DoctorProfileForm>({
    isDoctor: 'no',
    bio: '',
    phone: '',
    selectedDepartment: '',
    consultationFee: 0,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Fetch department types
  const { data: departmentTypes, isLoading: isLoadingDepartmentTypes, error: departmentTypesError } = useQuery({
    queryKey: queryKeys.clinicDepartments.allTypes,
    queryFn: () => queryDepartmentTypes(),
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 3,
  });

  const queryClient = useQueryClient();

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

  // Final Submit (Step 3) — calls server action
  const handleSubmit = async (data: DoctorProfileForm) => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      const result = await createClinicWithAdmin({
        clinicName: clinicDetails.name,
        address: clinicDetails.address,
        email: clinicDetails.email,
        phone: clinicDetails.phone,
        website: clinicDetails.website,
        userId: user.id,
        userPhone: user.phone,
        departments,
        isDoctor: data.isDoctor === 'yes',
        doctorBio: data.bio,
        doctorPhone: data.phone,
        selectedDepartment: data.selectedDepartment,
        consultationFee: data.consultationFee,
        userName: user.user_metadata?.name,
        userEmail: user.email,
      });

      if ('error' in result && result.error) {
        toast.error(result.error);
        return;
      }

      if ('clinicId' in result && result.clinicId) {
        setActiveClinicId(result.clinicId);
      }

      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
      queryClient.invalidateQueries({ queryKey: ['doctorDashboardData'] });

      toast.success(`Clinic "${clinicDetails.name}" created successfully.`);
      router.replace("/schedule");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error creating clinic');
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
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-md medical-card p-6 border-4 border-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-2 text-center text-foreground">Create New Clinic</h1>
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
                      <Input placeholder="Neurovision" {...field} />
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
                    <FormLabel>Clinic Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123, Connaught Place, New Delhi" {...field} />
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
                    <FormLabel>Clinic Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@clinic.com" {...field} />
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
                    <FormLabel>Clinic Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="9876543210" {...field} />
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
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="www.clinic.com" {...field} />
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
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Unable to load departments</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Retry the query
                              window.location.reload();
                            }}
                          >
                            Try Again
                          </Button>
                        </div>
                      ) : departmentTypes && (departmentTypes as DbDepartmentType[]).length > 0 ? (
                        (departmentTypes as DbDepartmentType[]).map((dept: DbDepartmentType) => (
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
                            <Label htmlFor={`department-${dept.id}`} className="text-foreground">{dept.name}</Label>
                          </div>
                        ))
                      ) : (
                        <div className="text-muted-foreground">No departments found.</div>
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
            <form onSubmit={doctorForm.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Are you a practicing doctor?</h3>
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
                          <Label htmlFor="yes" className="cursor-pointer">
                            <Card className={`transition-colors ${field.value === 'yes' ? 'ring-2 ring-primary' : ''}`}>
                              <CardContent className="flex items-center space-x-3 p-4">
                                <RadioGroupItem value="yes" id="yes" />
                                <div className="flex items-center space-x-3">
                                  <Stethoscope className="h-5 w-5 text-primary" />
                                  <div>
                                    <span className="font-medium text-foreground">
                                      Yes, I'm a practicing doctor
                                    </span>
                                    <p className="text-sm text-muted-foreground">
                                      I will see patients and appear in appointment lists
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Label>

                          <Label htmlFor="no" className="cursor-pointer">
                            <Card className={`transition-colors ${field.value === 'no' ? 'ring-2 ring-primary' : ''}`}>
                              <CardContent className="flex items-center space-x-3 p-4">
                                <RadioGroupItem value="no" id="no" />
                                <div className="flex items-center space-x-3">
                                  <Building2 className="h-5 w-5 text-primary" />
                                  <div>
                                    <span className="font-medium text-foreground">
                                      No, I'm an administrator only
                                    </span>
                                    <p className="text-sm text-muted-foreground">
                                      I will manage the clinic but not see patients
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Label>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Doctor-specific fields */}
                {doctorForm.watch('isDoctor') === 'yes' && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium text-foreground">Essential Medical Details</h4>
                    
                    {/* Department Selection - NEW FIELD */}
                    <FormField
                      control={doctorForm.control}
                      name="selectedDepartment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Department <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your primary department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(departmentTypes as DbDepartmentType[])
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

                    {/* Consultation Fee */}
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
                              ref={field.ref}
                              name={field.name}
                              value={field.value === 0 ? '' : field.value}
                              onChange={(e) => {
                                const raw = e.target.value;
                                if (raw === '') {
                                  field.onChange(0);
                                } else {
                                  const parsed = parseInt(raw, 10);
                                  field.onChange(isNaN(parsed) ? 0 : parsed);
                                }
                              }}
                              onBlur={field.onBlur}
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

const CreateClinicPageWithErrorBoundary = () => (
  <ErrorBoundary>
    <CreateClinicPage />
  </ErrorBoundary>
);

export default CreateClinicPageWithErrorBoundary;