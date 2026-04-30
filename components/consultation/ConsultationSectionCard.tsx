"use client";

import {
  User,
  Stethoscope,
  Activity,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FieldPath, UseFormReturn } from "react-hook-form";
import type { ConsultationFormValues, FieldValue } from "@/types/consultation";
import type { FieldSection, NoteFieldConfig } from "@/lib/schemaUtils";
import { ConsultationFormField } from "./ConsultationFormField";

function getSectionIcon(title: string) {
  if (title.toLowerCase().includes("history"))
    return <User className="h-5 w-5 text-primary" />;
  if (title.toLowerCase().includes("examination"))
    return <Stethoscope className="h-5 w-5 text-success" />;
  if (title.toLowerCase().includes("plan") || title.toLowerCase().includes("diagnosis"))
    return <ClipboardList className="h-5 w-5 text-secondary" />;
  if (title.toLowerCase().includes("investigation"))
    return <FileText className="h-5 w-5 text-accent" />;
  return <Activity className="h-5 w-5 text-muted-foreground" />;
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
  const completedFields = section.fields.filter((field: NoteFieldConfig) => {
    const formValues = form.getValues();
    const value = (formValues.specialty_data as Record<string, unknown>)?.[field.name];
    return value && String(value).trim().length > 0;
  }).length;

  return (
    <Card className="bg-white">
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between w-full">
              <CardTitle className="flex items-center gap-3 text-lg">
                {getSectionIcon(section.title)}
                <span className="text-gray-900">{section.title}</span>
              </CardTitle>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  {completedFields}/{section.fields.length} completed
                </span>
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="p-6 space-y-4">
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
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};