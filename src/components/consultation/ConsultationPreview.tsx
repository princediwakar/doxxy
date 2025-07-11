import React from "react";
import { NoteFieldConfig } from "@/lib/consultationNotesSchemas";
import { ConsultationFormValues } from "@/hooks/useConsultation";

interface ConsultationPreviewProps {
  data: ConsultationFormValues['specialty_data'];
  fieldConfigs: NoteFieldConfig[];
}

export const ConsultationPreview: React.FC<ConsultationPreviewProps> = ({ 
  data, 
  fieldConfigs 
}) => (
  <div className="space-y-4">
    <h3 className="text-sm font-semibold text-foreground">Consultation Summary</h3>
    {fieldConfigs.map((config) => {
      const value = data ? data[config.name as keyof typeof data] : null;
      if (!value) return null;
      return (
        <div key={config.name as string} className="border-b py-2">
          <h4 className="font-medium text-xs text-foreground">{config.label}</h4>
          <p className="text-xs text-muted-foreground">{value}</p>
        </div>
      );
    })}
  </div>
); 