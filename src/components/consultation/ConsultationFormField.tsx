import React from 'react';
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
  isConsultationCompleted?: boolean;
}

export const ConsultationFormField = ({
  fieldConfig,
  fieldIndex,
  value,
  onChange,
  expandedFields,
  setExpandedFields,
  isConsultationCompleted = false
}: ConsultationFormFieldProps) => {
  const isMandatory = fieldConfig.mandatory || false;
  const isExpanded = expandedFields[fieldConfig.name] ?? isMandatory;
  
  const toggleField = () => {
    if (isConsultationCompleted) return; // Don't allow expansion changes in read-only mode
    setExpandedFields({
      ...expandedFields,
      [fieldConfig.name]: !expandedFields[fieldConfig.name]
    });
  };

  // Get character limit for this field
  const getCharacterLimit = () => {
    if (fieldConfig.type === 'textarea') {
      return CHARACTER_LIMITS.textarea.default;
    }
    return CHARACTER_LIMITS.input.default;
  };

  // Special handling for prescriptions
  if (fieldConfig.name === 'prescriptions') {
    return (
      <div key={fieldIndex} className="space-y-3">
        <Collapsible open={isExpanded} onOpenChange={toggleField}>
          <CollapsibleTrigger asChild disabled={isConsultationCompleted}>
            <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              isConsultationCompleted 
                ? 'bg-gray-50 cursor-not-allowed opacity-70' 
                : 'hover:bg-gray-50 cursor-pointer'
            }`}>
              <Label className={`font-medium flex items-center gap-2 ${
                isConsultationCompleted ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer text-gray-900'
              }`}>
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
                isReadOnly={isConsultationCompleted}
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
      <Collapsible open={isExpanded} onOpenChange={toggleField}>
        {!isMandatory && (
          <CollapsibleTrigger asChild disabled={isConsultationCompleted}>
            <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              isConsultationCompleted 
                ? 'bg-gray-50 cursor-not-allowed opacity-70' 
                : 'hover:bg-gray-50 cursor-pointer'
            }`}>
              <Label className={`font-medium flex items-center gap-2 ${
                isConsultationCompleted ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer text-gray-900'
              }`}>
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
              <Label className={`font-medium flex items-center gap-2 ${
                isConsultationCompleted ? 'text-gray-500' : 'text-gray-900'
              }`}>
                {fieldConfig.label}
                <span className="text-destructive">*</span>
                <CharacterCounter current={characterCount} max={characterLimit} />
                {!hasValue && !isConsultationCompleted && (
                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    Required for completion
                  </span>
                )}
              </Label>
            )}
            
            {fieldConfig.type === 'textarea' ? (
              <Textarea
                placeholder={isConsultationCompleted ? "No data entered" : fieldConfig.placeholder}
                value={typeof value === 'string' ? value : ''}
                onChange={(e) => {
                  if (isConsultationCompleted) return;
                  const newValue = e.target.value;
                  if (newValue.length <= characterLimit) {
                    onChange(newValue);
                  }
                }}
                rows={fieldConfig.rows || 4}
                className={`min-h-[100px] resize-none transition-colors ${
                  isConsultationCompleted 
                    ? 'bg-gray-50 cursor-not-allowed opacity-70 border-gray-200' 
                    : 'focus:border-blue-500 focus:ring-blue-500/20'
                } ${isMandatory && !hasValue && !isConsultationCompleted ? 'border-amber-300 bg-amber-50/30' : ''}`}
                maxLength={characterLimit}
                readOnly={isConsultationCompleted}
                disabled={isConsultationCompleted}
              />
            ) : fieldConfig.type === 'select' ? (
              <Select 
                value={typeof value === 'string' ? value : ''} 
                onValueChange={isConsultationCompleted ? undefined : onChange}
                disabled={isConsultationCompleted}
              >
                <SelectTrigger className={`transition-colors ${
                  isConsultationCompleted 
                    ? 'bg-gray-50 cursor-not-allowed opacity-70 border-gray-200' 
                    : 'focus:border-blue-500 focus:ring-blue-500/20'
                } ${isMandatory && !hasValue && !isConsultationCompleted ? 'border-amber-300 bg-amber-50/30' : ''}`}>
                  <SelectValue placeholder={isConsultationCompleted ? "No selection" : fieldConfig.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {fieldConfig.options?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder={isConsultationCompleted ? "No data entered" : fieldConfig.placeholder}
                value={typeof value === 'string' ? value : ''}
                onChange={(e) => {
                  if (isConsultationCompleted) return;
                  const newValue = e.target.value;
                  if (newValue.length <= characterLimit) {
                    onChange(newValue);
                  }
                }}
                className={`transition-colors ${
                  isConsultationCompleted 
                    ? 'bg-gray-50 cursor-not-allowed opacity-70 border-gray-200' 
                    : 'focus:border-blue-500 focus:ring-blue-500/20'
                } ${isMandatory && !hasValue && !isConsultationCompleted ? 'border-amber-300 bg-amber-50/30' : ''}`}
                maxLength={characterLimit}
                readOnly={isConsultationCompleted}
                disabled={isConsultationCompleted}
              />
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}; 