// Path: app/(onboarding)/create-clinic/departments-step.tsx
"use client";

import type { UseFormReturn, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { DbDepartmentType } from "@/types/core";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { DepartmentsForm } from "./create-clinic-schemas";

interface DepartmentsStepProps {
  form: UseFormReturn<DepartmentsForm>;
  departmentTypes: DbDepartmentType[] | undefined;
  isLoading: boolean;
  hasError: boolean;
  onSubmit: SubmitHandler<DepartmentsForm>;
  onBack: () => void;
}

export function DepartmentsStep({
  form,
  departmentTypes,
  isLoading,
  hasError,
  onSubmit,
  onBack,
}: DepartmentsStepProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="departments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departments</FormLabel>
              <div className="grid gap-2">
                {isLoading ? (
                  <div>Loading departments...</div>
                ) : hasError ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Unable to load departments</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Try Again</Button>
                  </div>
                ) : departmentTypes && departmentTypes.length > 0 ? (
                  departmentTypes.map((dept: DbDepartmentType) => (
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
          <Button type="button" variant="outline" onClick={onBack} disabled={form.formState.isSubmitting}>Back</Button>
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>Next: Your Role</Button>
        </div>
      </form>
    </Form>
  );
}
