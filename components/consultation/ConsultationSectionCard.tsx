"use client";

import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FieldPath, UseFormReturn } from "react-hook-form";
import type { ConsultationFormValues, FieldValue } from "@/types/consultation";
import type { FieldSection, NoteFieldConfig } from "@/lib/schemaUtils";
import { ConsultationFormField } from "./ConsultationFormField";

function isFieldFilled(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0 && value !== "NOT_SPECIFIED";
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return false;
}

interface ConsultationSectionCardProps {
  section: FieldSection;
  sectionIndex: number;
  form: UseFormReturn<ConsultationFormValues>;
  canEditConsultation: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

export const ConsultationSectionCard = ({
  section,
  sectionIndex,
  form,
  canEditConsultation,
  isExpanded,
  onToggle,
}: ConsultationSectionCardProps) => {
  const specialtyData = form.watch("specialty_data");

  const filledCount = useMemo(() => {
    if (!specialtyData || typeof specialtyData !== "object") return 0;
    const data = specialtyData as Record<string, unknown>;
    return section.fields.filter((f) => isFieldFilled(data[f.name])).length;
  }, [specialtyData, section.fields]);

  const totalFields = section.fields.length;
  const hasContent = filledCount > 0;
  const allFilled = filledCount === totalFields;

  return (
    <div className="border-b border-border/60 last:border-b-0">
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <div className="cursor-pointer transition-colors py-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5 text-base font-medium uppercase">
                <span>{section.title}</span>
                {hasContent && (
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      allFilled
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {filledCount}/{totalFields}
                  </span>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="pb-3 space-y-2">
            {section.fields.map(
              (field: NoteFieldConfig, fieldIndex: number) => (
                <ConsultationFormField
                  key={fieldIndex}
                  fieldConfig={field}
                  fieldIndex={fieldIndex}
                  value={
                    form.watch(
                      `specialty_data.${field.name}` as FieldPath<ConsultationFormValues>
                    ) as unknown as FieldValue
                  }
                  onChange={(value) =>
                    form.setValue(
                      `specialty_data.${field.name}` as FieldPath<ConsultationFormValues>,
                      value as never
                    )
                  }
                  isReadOnly={!canEditConsultation}
                  autoFocus={sectionIndex === 0 && fieldIndex === 0}
                />
              )
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};