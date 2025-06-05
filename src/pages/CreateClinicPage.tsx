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
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { Database } from "@/integrations/supabase/types";

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

const CreateClinicPage = () => {
  const { user, fetchUserAndClinicData, activeClinic } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = React.useState<1 | 2>(1);
  const [clinicDetails, setClinicDetails] = React.useState<ClinicDetailsForm>({
    name: "",
    address: "",
    email: "",
    phone: "",
    website: "",
  });
  const [departments, setDepartments] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showDoctorPrompt, setShowDoctorPrompt] = React.useState(false);
  const [showDoctorModal, setShowDoctorModal] = React.useState(false);
  const [newClinicId, setNewClinicId] = React.useState<string | null>(null);

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

  // Keep forms in sync with state
  React.useEffect(() => {
    detailsForm.reset(clinicDetails);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step === 1]);
  React.useEffect(() => {
    departmentsForm.reset({ departments });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step === 2, departmentTypes]);

  // Step 1: Next
  const handleNext: SubmitHandler<ClinicDetailsForm> = (data) => {
    setClinicDetails(data);
    setStep(2);
  };

  // Step 2: Back
  const handleBack = () => {
    setStep(1);
  };

  // Step 2: Submit
  const handleCreateClinic: SubmitHandler<DepartmentsForm> = async (data) => {
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
      // 1. Insert into clinics table
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinics')
        .insert({
          name: clinicDetails.name, // ensure required
          address: clinicDetails.address || null,
          email: clinicDetails.email || null,
          phone: clinicDetails.phone || null,
          website: clinicDetails.website || null,
          created_by: user.id,
        })
        .select()
        .single();
      if (clinicError) throw clinicError;
      if (!clinicData) throw new Error("Clinic data not returned after insert.");
      const createdClinicId = clinicData.id;
      setNewClinicId(createdClinicId); // Save for DoctorModal
      // 2. Insert into clinic_members table (linking user as superadmin)
      const { error: memberError } = await supabase
        .from('clinic_members')
        .insert({
          user_id: user.id,
          clinic_id: createdClinicId,
          role: 'superadmin',
        });
      if (memberError) throw memberError;
      // 2b. Auto-create doctor profile for superadmin
      const { error: doctorError } = await supabase
        .from('doctors')
        .insert({
          id: user.id,
          user_id: user.id,
          clinic_id: createdClinicId,
          name: user.user_metadata?.name || user.email || '',
          email: user.email,
        });
      if (doctorError) throw doctorError;
      // 3. Insert selected departments into clinic_departments
      if (data.departments.length > 0) {
        const departmentRows = data.departments.map((departmentTypeId) => ({
          clinic_id: createdClinicId,
          department_type_id: departmentTypeId,
        }));
        const { error: deptError } = await supabase
          .from('clinic_departments')
          .insert(departmentRows);
        if (deptError) throw deptError;
      }
      // 4. Update auth context
      await fetchUserAndClinicData(user);
      toast({
        title: "Success",
        description: `Clinic "${clinicDetails.name}" created successfully.\nDepartments: ${departmentTypes?.filter(dt => data.departments.includes(dt.id)).map(dt => dt.name).join(", ")}`,
      });
      // Instead of navigating, show doctor prompt
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
      <div className={`flex items-center space-x-2 text-sm font-medium ${step === 1 ? 'text-primary' : 'text-muted-foreground'}`}>1. Clinic Details</div>
      <div className="mx-2">→</div>
      <div className={`flex items-center space-x-2 text-sm font-medium ${step === 2 ? 'text-primary' : 'text-muted-foreground'}`}>2. Departments</div>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg shadow-md bg-white p-6">
        <h1 className="text-2xl font-bold mb-2 text-center">Create New Clinic</h1>
        <StepIndicator />
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
                      <Input placeholder="e.g., Neurovision Clinic" {...field} />
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
              <Button type="submit" className="w-full" disabled={detailsForm.formState.isSubmitting}>Next</Button>
            </form>
          </Form>
        )}
        {step === 2 && (
          <Form {...departmentsForm}>
            <form onSubmit={departmentsForm.handleSubmit(handleCreateClinic)} className="space-y-6">
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
                <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting}>Back</Button>
                <Button type="submit" className="w-full" disabled={departmentsForm.formState.isSubmitting || isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Clinic"}
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