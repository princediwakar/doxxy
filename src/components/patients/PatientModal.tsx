import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { getSupabase } from "@/integrations/supabase/client";
import { UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";


import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Database } from "@/integrations/supabase/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { DatePickerWithYear } from "@/components/ui/DatePickerWithYear";

type Patient = Database['public']['Tables']['patients']['Row'];
type PatientInsert = Database['public']['Tables']['patients']['Insert'];

interface PatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null; // For editing existing patient
  onPatientCreated: (patient: Patient) => void; // Callback after creation
}

const supabase = getSupabase();

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  gender: z.string().optional(),
  date_of_birth: z.date().optional().nullable(),
  phone: z.string().optional(),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')), // Allow empty string or valid email
  address: z.string().optional(),
  medical_id: z.string().optional(),
});

export const PatientModal = ({
  open,
  onOpenChange,
  patient,
  onPatientCreated,
}: PatientModalProps) => {
  const { activeClinic } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: patient?.name || "",
      gender: patient?.gender || "",
      date_of_birth: patient?.date_of_birth ? new Date(patient.date_of_birth) : undefined,
      phone: patient?.phone || "",
      email: patient?.email || "",
      address: patient?.address || "",
      medical_id: patient?.medical_id || "",
    },
  });

  // Reset form when dialog opens or patient prop changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: patient?.name || "",
        gender: patient?.gender || "",
        date_of_birth: patient?.date_of_birth ? new Date(patient.date_of_birth) : undefined,
        phone: patient?.phone || "",
        email: patient?.email || "",
        address: patient?.address || "",
        medical_id: patient?.medical_id || "",
      });
    }
  }, [open, patient, form]);

  const createPatientMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!activeClinic?.clinic_id) {
        throw new Error("No active clinic selected.");
      }

      const patientData: PatientInsert = {
        name: values.name,
        clinic_id: activeClinic.clinic_id,
        gender: values.gender || null,
        date_of_birth: values.date_of_birth ? format(values.date_of_birth, "yyyy-MM-dd") : null,
        phone: values.phone || null,
        email: values.email || null,
        address: values.address || null,
        medical_id: values.medical_id || null,
      };

      const { data, error } = await supabase
        .from("patients")
        .insert(patientData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newPatient) => {
      toast.success("Patient created successfully.");
      onPatientCreated(newPatient);
      form.reset();
    },
    onError: (error) => {
      console.error("Error creating patient:", error);
      toast.error(`Failed to create patient: ${error.message}`);
    },
  });

  const updatePatientMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!patient?.id) {
        throw new Error("Patient ID is missing for update.");
      }

      const patientData: Partial<Patient> = {
        name: values.name,
        gender: values.gender || null,
        date_of_birth: values.date_of_birth ? format(values.date_of_birth, "yyyy-MM-dd") : null,
        phone: values.phone || null,
        email: values.email || null,
        address: values.address || null,
        medical_id: values.medical_id || null,
      };

      const { data, error } = await supabase
        .from('patients')
        .update(patientData)
        .eq('id', patient.id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: (updatedPatient) => {
      toast.success("Patient updated successfully.");
      // Invalidate patients query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['patients', activeClinic?.clinic_id] });
      onOpenChange(false); // Close modal on success
    },
    onError: (error) => {
      console.error("Error updating patient:", error);
      toast.error(`Failed to update patient: ${error.message}`);
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (patient) {
      updatePatientMutation.mutate(values);
    } else {
      createPatientMutation.mutate(values);
    }
  };

  const isSubmitting = createPatientMutation.isPending || updatePatientMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] z-[50]">
        <DialogHeader>
          <DialogTitle><div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            {patient ? "Edit Patient" : "New Patient"}
          </div></DialogTitle>
          <DialogDescription>
            {patient ? "Edit patient details" : "Add a new patient"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Patient Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                    <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {['Male', 'Female'].map(genderOption => (
                        <Button
                          key={genderOption}
                          type="button"
                          variant={field.value === genderOption ? "default" : "outline"}
                          onClick={() => field.onChange(genderOption)}
                          className={cn(
                            "rounded-full px-4 py-2 text-sm",
                            field.value !== genderOption && "hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          {genderOption}
                        </Button>
                      ))}
                    </div>
                    </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date_of_birth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <DatePickerWithYear
                    date={field.value || undefined}
                    setDate={field.onChange}
                    disabled={field.disabled}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., +1 123 456 7890" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="patient@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Patient Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="medical_id"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Medical ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional Medical ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : patient ? "Update Patient" : "Create Patient"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
