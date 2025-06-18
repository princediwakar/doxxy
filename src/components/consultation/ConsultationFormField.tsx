import { useState } from 'react';
import { ChevronDown, ChevronRight, Activity } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CharacterCounter } from './CharacterCounter';
import { CHARACTER_LIMITS } from './constants';
import { PrescriptionField } from './PrescriptionField';
import { FieldConfig, PrescriptionMedication } from './types';

interface ConsultationFormFieldProps {
  fieldConfig: FieldConfig;
  fieldIndex: number;
  value: string | readonly PrescriptionMedication[];
  onChange: (value: string | PrescriptionMedication[]) => void;
  expandedFields: Record<string, boolean>;
  setExpandedFields: (fields: Record<string, boolean>) => void;
}

export const ConsultationFormField = ({
  fieldConfig,
  fieldIndex,
  value,
  onChange,
  expandedFields,
  setExpandedFields
}: ConsultationFormFieldProps) => {
  const isMandatory = ['chief_complaint', 'assessment', 'treatment_plan'].includes(fieldConfig.name);
  const isExpanded = expandedFields[fieldConfig.name] ?? isMandatory;
  
  const toggleField = () => {
    setExpandedFields({
      ...expandedFields,
      [fieldConfig.name]: !expandedFields[fieldConfig.name]
    });
  };

  // Get character limit for this field
  const getCharacterLimit = () => {
    if (fieldConfig.type === 'textarea') {
      return CHARACTER_LIMITS.textarea[fieldConfig.name as keyof typeof CHARACTER_LIMITS.textarea] || 1000;
    }
    return CHARACTER_LIMITS.input.default;
  };

  // Special handling for prescriptions
  if (fieldConfig.type === 'prescription') {
    return (
      <div key={fieldIndex} className="space-y-3">
        <Collapsible open={isExpanded} onOpenChange={toggleField}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              <Label className="font-medium cursor-pointer text-gray-900 flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                {fieldConfig.label}
                {isMandatory && <span className="text-destructive">*</span>}
                <span className="text-xs text-gray-500">
                  ({Array.isArray(value) ? value.length : 0} medication{Array.isArray(value) && value.length !== 1 ? 's' : ''})
                </span>
              </Label>
              {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pt-2">
              <PrescriptionField
                value={Array.isArray(value) ? value : []}
                onChange={onChange}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  // For other field types
  const hasValue = value && typeof value === 'string' && value.length > 0;
  const characterCount = typeof value === 'string' ? value.length : 0;
  const characterLimit = getCharacterLimit();
  
  return (
    <div key={fieldIndex} className="space-y-3">
      <Collapsible open={isExpanded} onOpenChange={!isMandatory ? toggleField : undefined}>
        {!isMandatory && (
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              <Label className="font-medium cursor-pointer text-gray-900 flex items-center gap-2">
                {fieldConfig.label}
                {isMandatory && <span className="text-destructive">*</span>}
                {hasValue && (
                  <CharacterCounter current={characterCount} max={characterLimit} />
                )}
              </Label>
              {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
            </div>
          </CollapsibleTrigger>
        )}
        
        <CollapsibleContent>
          <div className="space-y-3">
            {isMandatory && (
              <Label className="font-medium text-gray-900 flex items-center gap-2">
                {fieldConfig.label}
                <span className="text-destructive">*</span>
                <CharacterCounter current={characterCount} max={characterLimit} />
              </Label>
            )}
            
            {fieldConfig.type === 'textarea' ? (
              <Textarea
                placeholder={fieldConfig.placeholder}
                value={typeof value === 'string' ? value : ''}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (newValue.length <= characterLimit) {
                    onChange(newValue);
                  }
                }}
                rows={fieldConfig.rows || 4}
                className="min-h-[100px] resize-none focus:border-blue-500 focus:ring-blue-500/20"
                maxLength={characterLimit}
              />
            ) : fieldConfig.type === 'select' ? (
              <Select 
                value={typeof value === 'string' ? value : ''} 
                onValueChange={onChange}
              >
                <SelectTrigger className="focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue placeholder={fieldConfig.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {fieldConfig.options?.map((option: string) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder={fieldConfig.placeholder}
                value={typeof value === 'string' ? value : ''}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (newValue.length <= characterLimit) {
                    onChange(newValue);
                  }
                }}
                className="focus:border-blue-500 focus:ring-blue-500/20"
                maxLength={characterLimit}
              />
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}; 