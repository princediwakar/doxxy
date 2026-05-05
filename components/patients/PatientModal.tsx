// src/components/patients/PatientModal.tsx
"use client";
import { useEffect, useState } from "react";
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

import { createPatient, updatePatient } from "@/actions/patients";
import { useAppState } from "@/contexts/AppStateContext";
import { showErrorToast } from "@/lib/error-utils";
import { toast } from "sonner";
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
  const { activeClinicId } = useAppState();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: (patient?.name || initialName) || "",
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
        name: (patient?.name || initialName) || "",
        gender: patient?.gender ?? "",
        age: patient?.age ?? undefined,
        phone: patient?.phone ?? "",
        email: patient?.email ?? "",
        address: patient?.address ?? "",
        medical_id: patient?.medical_id ?? "",
      });
    }
  }, [open, patient, initialName, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!activeClinicId) {
      toast.error("No active clinic selected.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (patient) {
        const result = await updatePatient(patient.id, { ...values });
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Patient updated successfully.");
          onOpenChange(false);
        }
      } else {
        const result = await createPatient({
          name: values.name,
          clinic_id: activeClinicId,
          gender: values.gender ?? null,
          age: values.age ?? null,
          phone: values.phone ?? null,
          email: values.email ?? null,
          address: values.address ?? null,
          medical_id: values.medical_id?.trim() || null,
        });
        if (result.error) {
          toast.error(result.error);
        } else if (result.data) {
          onPatientCreated(result.data as Patient);
          form.reset();
        }
      }
    } catch (err) {
      showErrorToast(err, { title: patient ? "Failed to update patient" : "Failed to create patient" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] z-[50] border-t-2 border-t-emerald-500">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <UserIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <DialogTitle>{patient ? "Edit Patient" : "New Patient"}</DialogTitle>
              <DialogDescription>
                {patient ? "Edit patient details" : "Add a new patient"}
              </DialogDescription>
            </div>
          </div>
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