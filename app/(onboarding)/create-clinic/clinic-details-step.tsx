// Path: app/(onboarding)/create-clinic/clinic-details-step.tsx
"use client";

import type { UseFormReturn, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GooglePlaceAutocomplete } from "@/components/ui/google-place-autocomplete";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { ClinicDetailsForm } from "./create-clinic-schemas";

interface ClinicDetailsStepProps {
  form: UseFormReturn<ClinicDetailsForm>;
  onSubmit: SubmitHandler<ClinicDetailsForm>;
}

export function ClinicDetailsStep({ form, onSubmit }: ClinicDetailsStepProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="google_place_id"
          render={({ field }) => {
            const placeData = form.watch('google_place_data');
            return (
              <FormItem>
                <FormLabel className="text-primary font-semibold text-base">Search for your clinic</FormLabel>
                <p className="text-xs text-muted-foreground mb-2 mt-0">We'll auto-fill your details if we find it.</p>
                <FormControl>
                  <GooglePlaceAutocomplete
                    value={
                      field.value && placeData
                        ? { place_id: field.value, google_place_data: placeData }
                        : null
                    }
                    onChange={(selection) => {
                      field.onChange(selection?.place_id ?? '');
                      form.setValue('google_place_data', selection?.google_place_data ?? undefined);

                      if (selection?.google_place_data) {
                        const data = selection.google_place_data;
                        if (data.displayName) form.setValue('name', data.displayName, { shouldValidate: true });
                        if (data.formattedAddress) form.setValue('address', data.formattedAddress, { shouldValidate: true });
                        if (data.nationalPhoneNumber) form.setValue('phone', data.nationalPhoneNumber.replace(/[^\d+]/g, ''), { shouldValidate: true });
                        if (data.websiteURI) form.setValue('website', data.websiteURI, { shouldValidate: true });
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
          <div className="flex-grow border-t border-muted"></div>
          <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground uppercase tracking-wider">Or enter manually</span>
          <div className="flex-grow border-t border-muted"></div>
        </div>

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
        <div className="grid grid-cols-2 gap-4">
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
        </div>
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

        <Button type="submit" className="w-full mt-6" disabled={form.formState.isSubmitting}>
          Next: Select Departments
        </Button>
      </form>
    </Form>
  );
}
