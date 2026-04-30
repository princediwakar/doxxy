"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FieldSection, NoteFieldConfig } from "@/lib/schemaUtils";
import type { ConsultationFormValues } from "@/types/consultation";
import type { UseFormReturn } from "react-hook-form";

interface ConsultationProgressProps {
  specialtySections: FieldSection[];
  form: UseFormReturn<ConsultationFormValues>;
  isConsultationCompleted: boolean;
}

export const ConsultationProgress = ({
  specialtySections,
  form,
  isConsultationCompleted,
}: ConsultationProgressProps) => {
  const completed = specialtySections.reduce((count, section) => {
    const hasContent = section.fields.some(
      (field: NoteFieldConfig) => {
        const formValues = form.getValues();
        const value = (formValues.specialty_data as Record<string, unknown>)?.[field.name];
        return (
          value &&
          (typeof value === "string"
            ? value.length > 0
            : Array.isArray(value)
            ? value.length > 0
            : !!value)
        );
      }
    );
    return count + (hasContent ? 1 : 0);
  }, 0);

  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Medical Consultation
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {completed}/{specialtySections.length} sections completed
            </p>
          </div>
          <Badge
            variant={isConsultationCompleted ? "default" : "secondary"}
            className="text-sm"
          >
            {isConsultationCompleted ? "Completed" : "In Progress"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};