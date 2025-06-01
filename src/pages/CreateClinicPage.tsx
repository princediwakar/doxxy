import * as React from "react";
import { useForm } from "react-hook-form";
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

// Define the Zod schema for the clinic form
const clinicFormSchema = z.object({
  name: z.string().min(2, { message: "Clinic name must be at least 2 characters." }),
  address: z.string().optional(),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal("")), // Allow empty string for optional email
  phone: z.string().optional(),
  website: z.string().url({ message: "Invalid URL." }).optional().or(z.literal("")), // Allow empty string for optional website
});

const CreateClinicPage = () => {
  const { user, fetchUserAndClinicData, activeClinic } = useAuth(); // Get user and the fetch function
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize the form with react-hook-form and zod resolver
  const form = useForm<z.infer<typeof clinicFormSchema>>({
    resolver: zodResolver(clinicFormSchema),
    defaultValues: {
      name: "",
      address: "",
      email: "",
      phone: "",
      website: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof clinicFormSchema>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated.",
        variant: "destructive",
      });
      return;
    }

    try {
      // 1. Insert into clinics table
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinics')
        .insert({
          name: values.name,
          address: values.address,
          email: values.email || null, // Use null for optional empty strings
          phone: values.phone || null,
          website: values.website || null,
          created_by: user.id, // Link clinic to the creating user
        })
        .select()
        .single();

      if (clinicError) {
        throw clinicError;
      }

      if (!clinicData) {
         throw new Error("Clinic data not returned after insert.");
      }

      const newClinicId = clinicData.id;

      // 2. Insert into clinic_members table (linking user as superadmin)
      const { error: memberError } = await supabase
        .from('clinic_members')
        .insert({
          user_id: user.id,
          clinic_id: newClinicId,
          role: 'superadmin', // Assign superadmin role
        });

      if (memberError) {
        throw memberError;
      }

      // 3. Update auth context and navigate to dashboard
      // This will refetch user and clinic data and set the active clinic
      await fetchUserAndClinicData(user);

      // Log active clinic state after fetching data
      console.log("CreateClinicPage: Active clinic after fetch:", activeClinic);

      toast({
        title: "Success",
        description: `Clinic "${values.name}" created successfully.`,
      });

      navigate("/", { replace: true }); // Navigate to dashboard

    } catch (error: unknown) {
      console.error("Error creating clinic:", error);
      toast({
        title: "Error creating clinic",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg shadow-md bg-white p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Create New Clinic</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating..." : "Create Clinic"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateClinicPage; 