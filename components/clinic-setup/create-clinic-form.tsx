// Path: components/clinic-setup/create-clinic-form.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppState } from "@/contexts/AppStateContext";
import { toast } from "sonner";
import { showErrorToast } from "@/lib/error-utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryDepartmentTypes } from "@/lib/queries/clinic";
import { queryKeys } from "@/lib/query-keys";
import { createClinicWithAdmin } from "@/actions/clinic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GooglePlaceAutocomplete } from "@/components/ui/google-place-autocomplete";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Stethoscope, Building2 } from "lucide-react";
import { createClinicSchema, type CreateClinicFormValues } from "./create-clinic-schemas";

interface CreateClinicFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export const CreateClinicForm = ({ onSuccess, onCancel }: CreateClinicFormProps) => {
  const { user } = useAppState();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { data: departmentTypes } = useQuery({
    queryKey: queryKeys.clinicDepartments.allTypes,
    queryFn: () => queryDepartmentTypes(),
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 3,
  });

  const queryClient = useQueryClient();

  const form = useForm<CreateClinicFormValues>({
    resolver: zodResolver(createClinicSchema),
    defaultValues: {
      name: "",
      address: "",
      email: "",
      phone: "",
      website: "",
      google_place_id: "",
      google_place_data: undefined,
      isDoctor: 'yes',
      selectedDepartment: "",
      consultationFee: 0,
      invitedDoctorEmail: "",
    },
    mode: "onTouched",
  });

  const isDoctor = form.watch("isDoctor");

  const handleSubmit = async (data: CreateClinicFormValues) => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      const result = await createClinicWithAdmin({
        clinicName: data.name,
        address: data.address,
        email: data.email,
        phone: data.phone,
        website: data.website,
        googlePlaceId: data.google_place_id || undefined,
        googlePlaceData: data.google_place_data,
        userId: user.id,
        userPhone: user.phone,
        departments: [],
        isDoctor: data.isDoctor === "yes",
        selectedDepartment: data.selectedDepartment,
        consultationFee: data.consultationFee,
        invitedDoctorEmail: data.invitedDoctorEmail,
        userName: user.user_metadata?.name,
        userEmail: user.email,
      });

      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }

      if ("clinicId" in result && result.clinicId) {
        document.cookie = `active-clinic-id=${result.clinicId}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      }

      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      queryClient.invalidateQueries({ queryKey: ["doctorDashboardData"] });

      toast.success(`Clinic "${data.name}" created successfully.`);
      onSuccess();
    } catch (err) {
      showErrorToast(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Create New Clinic</h1>
        <p className="text-muted-foreground mt-2">
          Set up a new workspace. Search Google Maps to auto-fill your details.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-10">
          {/* BLOCK 1: IDENTITY */}
          <section className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              1. Clinic Details
            </h2>

            <FormField
              control={form.control}
              name="google_place_id"
              render={({ field }) => {
                const placeData = form.watch("google_place_data");
                return (
                  <FormItem>
                    <FormLabel className="text-primary font-semibold text-base">Search for your clinic</FormLabel>
                    <p className="text-xs text-muted-foreground mb-2">We&apos;ll auto-fill your details if we find it.</p>
                    <FormControl>
                      <GooglePlaceAutocomplete
                        value={
                          field.value && placeData
                            ? { place_id: field.value, google_place_data: placeData }
                            : null
                        }
                        onChange={(selection) => {
                          field.onChange(selection?.place_id ?? "");
                          form.setValue("google_place_data", selection?.google_place_data ?? undefined);

                          if (selection?.google_place_data) {
                            const d = selection.google_place_data;
                            if (d.displayName) form.setValue("name", d.displayName, { shouldValidate: true });
                            if (d.formattedAddress) form.setValue("address", d.formattedAddress, { shouldValidate: true });
                            if (d.nationalPhoneNumber) form.setValue("phone", d.nationalPhoneNumber.replace(/[^\d+]/g, ""), { shouldValidate: true });
                            if (d.websiteURI) form.setValue("website", d.websiteURI, { shouldValidate: true });
                          }
                        }}
                        placeholder="Search on Google Maps..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-border" />
              <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground uppercase tracking-wider">
                Or enter manually
              </span>
              <div className="flex-grow border-t border-border" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clinic Name *</FormLabel>
                      <FormControl><Input placeholder="Neurovision" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clinic Address</FormLabel>
                      <FormControl><Input placeholder="123, Connaught Place, New Delhi" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clinic Phone</FormLabel>
                    <FormControl><Input type="tel" placeholder="9876543210" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clinic Email</FormLabel>
                    <FormControl><Input type="email" placeholder="email@clinic.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="col-span-1 md:col-span-2">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl><Input type="text" placeholder="www.clinic.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </section>

          {/* BLOCK 2: ROLE */}
          <section className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              2. Your Role
            </h2>

            <FormField
              control={form.control}
              name="isDoctor"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => field.onChange("yes")}
                      className={`flex items-start gap-4 p-5 rounded-lg border text-left transition-colors ${
                        field.value === "yes"
                          ? "ring-1 ring-primary bg-primary/5 border-primary/30"
                          : "border-border hover:border-zinc-600"
                      }`}
                    >
                      <Stethoscope className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-foreground">I&apos;m a practicing doctor</span>
                        <p className="text-sm text-muted-foreground mt-1">
                          I will see patients and appear in appointment lists
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => field.onChange("no")}
                      className={`flex items-start gap-4 p-5 rounded-lg border text-left transition-colors ${
                        field.value === "no"
                          ? "ring-1 ring-primary bg-primary/5 border-primary/30"
                          : "border-border hover:border-zinc-600"
                      }`}
                    >
                      <Building2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-foreground">I&apos;m an administrator</span>
                        <p className="text-sm text-muted-foreground mt-1">
                          I will manage the clinic but not see patients
                        </p>
                      </div>
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isDoctor === "yes" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/50 p-6 rounded-lg border border-border">
                <FormField
                  control={form.control}
                  name="selectedDepartment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Department <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select your primary department" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departmentTypes?.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="consultationFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consultation Fee (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="350"
                          min="0"
                          step="50"
                          value={!field.value ? "" : field.value}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/[^0-9]/g, "");
                            field.onChange(raw === "" ? undefined : parseInt(raw, 10));
                          }}
                          onBlur={field.onBlur}
                          ref={field.ref}
                          name={field.name}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {isDoctor === "no" && (
              <div className="bg-muted/50 p-6 rounded-lg border border-border">
                <FormField
                  control={form.control}
                  name="invitedDoctorEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor&apos;s Email <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="doctor@example.com" {...field} value={field.value || ""} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        You must invite at least one doctor to unlock your clinic.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </section>

          {/* ACTION BAR */}
          <div className="flex items-center justify-between pt-6 border-t border-border">
            {onCancel ? (
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            ) : (
              <div />
            )}
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Clinic"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
