// src/components/patients/PatientModal.tsx
"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

import { usePatientMutations } from "@/hooks/usePatientMutations";
import { cn } from "@/lib/utils";
import type { Patient } from "@/types/patients";
import type { DbPatientByClinic } from "@/types/core";

interface PatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: DbPatientByClinic | null;
  onPatientCreated: (patient: Patient) => void;
  initialName?: string;
}

// Helper function for smart title casing
const toTitleCase = (str: string) => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};
const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    // TRANSFORM: This cleans the name automatically on submit
    .transform((val) => {
      // If the user typed ALL LOWERCASE or ALL CAPS, fix it completely to Title Case
      if (val === val.toLowerCase() || val === val.toUpperCase()) {
        return toTitleCase(val);
      }
      // Otherwise, respect their specific capitalization (e.g. McDonald) 
      // but ensure the very first letter is uppercase.
      return val.charAt(0).toUpperCase() + val.slice(1);
    }),
  gender: z.string().optional(),
  age: z.number().int().min(0).max(150).optional().nullable(),
  phone: z.string().optional(),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  address: z.string().optional(),
  medical_id: z.string().optional(),
});

export const PatientModal = ({
  open,
  onOpenChange,
  patient,
  onPatientCreated,
  initialName = "",
}: PatientModalProps) => {
  const { createPatient, updatePatient } = usePatientMutations();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: (patient?.name || initialName) || "", // Use initialName here
      gender: patient?.gender ?? "",
      age: patient?.age ?? undefined,
      phone: patient?.phone ?? "",
      email: patient?.email ?? "",
      address: patient?.address ?? "",
      medical_id: patient?.medical_id ?? "",
    },
  });

  // Reset form when dialog opens or patient prop changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: (patient?.name || initialName) || "", // Use initialName here on reset
        gender: patient?.gender ?? "",
        age: patient?.age ?? undefined,
        phone: patient?.phone ?? "",
        email: patient?.email ?? "",
        address: patient?.address ?? "",
        medical_id: patient?.medical_id ?? "",
      });
    }
  }, [open, patient, initialName, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (patient) {
      updatePatient.mutate(
        { id: patient.id, ...values },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createPatient.mutate(values, {
        onSuccess: (newPatient) => {
          onPatientCreated(newPatient);
          form.reset();
        },
      });
    }
  };

  const isSubmitting = createPatient.isPending || updatePatient.isPending;

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
                    <Input placeholder="Patient Name" {...field} className="capitalize" />
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
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Age"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : parseInt(e.target.value))}
                      value={field.value === null || field.value === undefined ? '' : field.value}
                    />
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
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="9876543210" {...field} />
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