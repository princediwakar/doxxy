// Path: app/(onboarding)/create-clinic/doctor-role-step.tsx
"use client";

import type { UseFormReturn, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Stethoscope, Building2 } from "lucide-react";
import { DbDepartmentType } from "@/types/core";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { DoctorProfileForm } from "./create-clinic-schemas";

interface DoctorRoleStepProps {
  form: UseFormReturn<DoctorProfileForm>;
  departmentTypes: DbDepartmentType[] | undefined;
  isSubmitting: boolean;
  onSubmit: SubmitHandler<DoctorProfileForm>;
  onBack: () => void;
}

export function DoctorRoleStep({
  form,
  departmentTypes,
  isSubmitting,
  onSubmit,
  onBack,
}: DoctorRoleStepProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Are you a practicing doctor?</h3>
            <p className="text-sm text-muted-foreground">
              This determines whether you'll appear in appointment doctor lists or manage the clinic as an administrator only.
            </p>
          </div>

          <FormField
            control={form.control}
            name="isDoctor"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 gap-4">
                    <Label htmlFor="yes" className="cursor-pointer">
                      <Card className={`transition-colors ${field.value === 'yes' ? 'ring-2 ring-primary' : ''}`}>
                        <CardContent className="flex items-center space-x-3 p-4">
                          <RadioGroupItem value="yes" id="yes" />
                          <div className="flex items-center space-x-3">
                            <Stethoscope className="h-5 w-5 text-primary" />
                            <div>
                              <span className="font-medium text-foreground">Yes, I'm a practicing doctor</span>
                              <p className="text-sm text-muted-foreground">I will see patients and appear in appointment lists</p>
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
                              <span className="font-medium text-foreground">No, I'm an administrator only</span>
                              <p className="text-sm text-muted-foreground">I will manage the clinic but not see patients</p>
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

          {form.watch('isDoctor') === 'yes' && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium text-foreground">Essential Medical Details</h4>

              <FormField
                control={form.control}
                name="selectedDepartment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Department <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select your primary department" /></SelectTrigger></FormControl>
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
                        ref={field.ref}
                        name={field.name}
                        value={!field.value ? '' : field.value}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9]/g, '');
                          field.onChange(raw === '' ? undefined : parseInt(raw, 10));
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

          {form.watch('isDoctor') === 'no' && (
            <div className="space-y-4 border-t pt-4">
              <FormField
                control={form.control}
                name="invitedDoctorEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor's Email <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input type="email" placeholder="doctor@example.com" {...field} value={field.value || ''} /></FormControl>
                    <p className="text-xs text-muted-foreground mt-1">You must invite at least one doctor to unlock your clinic.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        <div className="flex justify-between gap-2">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>Back</Button>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating Clinic..." : "Create Clinic"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
