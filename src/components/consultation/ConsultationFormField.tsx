import { ChevronDown, ChevronRight, Activity } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CharacterCounter } from './CharacterCounter';
import { CHARACTER_LIMITS } from './constants';
import { PrescriptionField } from './PrescriptionField';
import { TabularEyeField } from './TabularEyeField';
import { VitalSignsField } from './VitalSignsField';
import { MotorExaminationField } from './MotorExaminationField';
import { ReflexExaminationField } from './ReflexExaminationField';
import type { FieldConfig, FieldValue, TabularEyeValue, MotorExaminationValue, ReflexExaminationValue } from '@/types/consultation';
import { useState, useRef, useEffect, useMemo, memo } from 'react';

interface ConsultationFormFieldProps {
  fieldConfig: FieldConfig;
  fieldIndex: number;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  isReadOnly?: boolean;
  autoFocus?: boolean;
}

export const ConsultationFormField = memo(({
  fieldConfig,
  fieldIndex,
  value,
  onChange,
  isReadOnly = false,
  autoFocus = false
}: ConsultationFormFieldProps) => {
  const isMandatory = fieldConfig.mandatory || false;
  // First field of each section should be expanded by default
  const [isExpanded, setIsExpanded] = useState(isMandatory || fieldIndex === 0);

  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectRef = useRef<HTMLButtonElement>(null);
  const initialRender = useRef(true);

  // Memoized values for field display
  const hasValue = useMemo(() => value && typeof value === 'string' && value.length > 0, [value]);
  const characterCount = useMemo(() => typeof value === 'string' ? value.length : 0, [value]);

  // Mark initial render as complete
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
    }
  }, []);

  // Auto-focus the input when field is expanded
  useEffect(() => {
    if (isExpanded && !isReadOnly) {
      // Focus the appropriate input element based on field type
      const focusElement = () => {
        if (fieldConfig.type === 'textarea' && textareaRef.current) {
          textareaRef.current.focus();
        } else if (fieldConfig.type === 'select' && selectRef.current) {
          selectRef.current.focus();
        } else if (inputRef.current) {
          inputRef.current.focus();
        }
      };

      // Small delay to ensure the element is rendered and ready
      const timer = setTimeout(focusElement, 50);
      return () => clearTimeout(timer);
    }
  }, [isExpanded, isReadOnly, fieldConfig.type]);

  const toggleField = () => {
    if (isReadOnly) return; // Don't allow expansion changes in read-only mode
    setIsExpanded(!isExpanded);
  };

  // Get character limit for this field
  const characterLimit = useMemo(() => {
    if (fieldConfig.type === 'textarea') {
      return CHARACTER_LIMITS.textarea.default;
    }
    return CHARACTER_LIMITS.input.default;
  }, [fieldConfig.type]);

  // Special handling for prescriptions
  if (fieldConfig.name === 'prescriptions') {
    return (
      <div key={fieldIndex} className="space-y-3" data-field-name={fieldConfig.name}>
        <Collapsible open={isExpanded} onOpenChange={toggleField}>
          <CollapsibleTrigger asChild disabled={isReadOnly}>
            <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              isReadOnly
                ? 'bg-gray-50 cursor-not-allowed opacity-70'
                : 'hover:bg-gray-50 cursor-pointer'
            }`}>
              <Label className={`font-medium flex items-center gap-2 ${
                isReadOnly ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer text-gray-900'
              }`}>
                <Activity className="h-4 w-4 text-blue-600" />
                {fieldConfig.label}
                {isMandatory && <span className="text-destructive">*</span>}
                <span className="text-xs text-gray-500">
                  ({Array.isArray(value) ? value.filter(med => med.name && med.name.trim().length > 0).length : 0} medication{Array.isArray(value) && value.filter(med => med.name && med.name.trim().length > 0).length !== 1 ? 's' : ''})
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
                isReadOnly={isReadOnly}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  // Special handling for tabular eye fields
  if (fieldConfig.type === 'tabular_eye') {
    const eyeValue = typeof value === 'object' && value !== null && !Array.isArray(value)
      ? value as TabularEyeValue
      : {};

    const handleEyeFieldChange = (newValue: TabularEyeValue) => {
      onChange(newValue);
    };

    return (
      <div key={fieldIndex} className="space-y-3" data-field-name={fieldConfig.name}>
        <Collapsible open={isExpanded} onOpenChange={toggleField}>
          <CollapsibleTrigger asChild disabled={isReadOnly}>
            <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              isReadOnly
                ? 'bg-gray-50 cursor-not-allowed opacity-70'
                : 'hover:bg-gray-50 cursor-pointer'
            }`}>
              <Label className={`font-medium flex items-center gap-2 ${
                isReadOnly ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer text-gray-900'
              }`}>
                {fieldConfig.label}
                {isMandatory && <span className="text-destructive">*</span>}
              </Label>
              {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pt-2">
              <TabularEyeField
                value={eyeValue}
                onChange={handleEyeFieldChange}
                isReadOnly={isReadOnly}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  // Special handling for vital signs
  if (fieldConfig.type === 'vital_signs') {
    const vitalSignsValue = typeof value === 'object' && value !== null && !Array.isArray(value)
      ? value as {
          temperature?: string;
          pulse?: string;
          blood_pressure_systolic?: string;
          blood_pressure_diastolic?: string;
          respiratory_rate?: string;
          oxygen_saturation?: string;
          height?: string;
          weight?: string;
          bmi?: string;
        }
      : {};

    const handleVitalSignsChange = (newValue: {
      temperature?: string;
      pulse?: string;
      blood_pressure_systolic?: string;
      blood_pressure_diastolic?: string;
      respiratory_rate?: string;
      oxygen_saturation?: string;
      height?: string;
      weight?: string;
      bmi?: string;
    }) => {
      onChange(newValue);
    };

    return (
      <div key={fieldIndex} className="space-y-3" data-field-name={fieldConfig.name}>
        <Collapsible open={isExpanded} onOpenChange={toggleField}>
          <CollapsibleTrigger asChild disabled={isReadOnly}>
            <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              isReadOnly
                ? 'bg-gray-50 cursor-not-allowed opacity-70'
                : 'hover:bg-gray-50 cursor-pointer'
            }`}>
              <Label className={`font-medium flex items-center gap-2 ${
                isReadOnly ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer text-gray-900'
              }`}>
                {fieldConfig.label}
                {isMandatory && <span className="text-destructive">*</span>}
              </Label>
              {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pt-2">
              <VitalSignsField
                value={vitalSignsValue}
                onChange={handleVitalSignsChange}
                isReadOnly={isReadOnly}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  // Special handling for motor examination
  if (fieldConfig.type === 'motor_examination') {
    const motorExaminationValue = typeof value === 'object' && value !== null && !Array.isArray(value)
      ? value as MotorExaminationValue
      : {};

    const handleMotorExaminationChange = (newValue: MotorExaminationValue) => {
      onChange(newValue);
    };

    return (
      <div key={fieldIndex} className="space-y-3" data-field-name={fieldConfig.name}>
        <Collapsible open={isExpanded} onOpenChange={toggleField}>
          <CollapsibleTrigger asChild disabled={isReadOnly}>
            <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              isReadOnly
                ? 'bg-gray-50 cursor-not-allowed opacity-70'
                : 'hover:bg-gray-50 cursor-pointer'
            }`}>
              <Label className={`font-medium flex items-center gap-2 ${
                isReadOnly ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer text-gray-900'
              }`}>
                {fieldConfig.label}
                {isMandatory && <span className="text-destructive">*</span>}
              </Label>
              {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pt-2">
              <MotorExaminationField
                value={motorExaminationValue}
                onChange={handleMotorExaminationChange}
                isReadOnly={isReadOnly}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  // Special handling for reflex examination
  if (fieldConfig.type === 'reflex_examination') {
    const reflexExaminationValue = typeof value === 'object' && value !== null && !Array.isArray(value)
      ? value as ReflexExaminationValue
      : {};

    const handleReflexExaminationChange = (newValue: ReflexExaminationValue) => {
      onChange(newValue);
    };

    return (
      <div key={fieldIndex} className="space-y-3" data-field-name={fieldConfig.name}>
        <Collapsible open={isExpanded} onOpenChange={toggleField}>
          <CollapsibleTrigger asChild disabled={isReadOnly}>
            <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              isReadOnly
                ? 'bg-gray-50 cursor-not-allowed opacity-70'
                : 'hover:bg-gray-50 cursor-pointer'
            }`}>
              <Label className={`font-medium flex items-center gap-2 ${
                isReadOnly ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer text-gray-900'
              }`}>
                {fieldConfig.label}
                {isMandatory && <span className="text-destructive">*</span>}
              </Label>
              {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pt-2">
              <ReflexExaminationField
                value={reflexExaminationValue}
                onChange={handleReflexExaminationChange}
                isReadOnly={isReadOnly}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  // For other field types
  
  return (
    <div key={fieldIndex} className="space-y-3" data-field-name={fieldConfig.name}>
      <Collapsible open={isExpanded} onOpenChange={toggleField}>
        {!isMandatory && (
          <CollapsibleTrigger asChild disabled={isReadOnly}>
            <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              isReadOnly 
                ? 'bg-gray-50 cursor-not-allowed opacity-70' 
                : 'hover:bg-gray-50 cursor-pointer'
            }`}>
              <Label className={`font-medium flex items-center gap-2 ${
                isReadOnly ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer text-gray-900'
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
                isReadOnly ? 'text-gray-500' : 'text-gray-900'
              }`}>
                {fieldConfig.label}
                <span className="text-destructive">*</span>
                <CharacterCounter current={characterCount} max={characterLimit} />
                {!hasValue && !isReadOnly && (
                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    Required for completion
                  </span>
                )}
              </Label>
            )}
            
            {fieldConfig.type === 'textarea' ? (
              <Textarea
                ref={textareaRef}
                placeholder={isReadOnly ? "No data entered" : fieldConfig.placeholder}
                value={typeof value === 'string' ? value : ''}
                onChange={(e) => {
                  if (isReadOnly) return;
                  const newValue = e.target.value;
                  if (newValue.length <= characterLimit) {
                    onChange(newValue);
                  }
                }}
                rows={fieldConfig.rows || 4}
                className={`min-h-[100px] resize-none transition-colors ${
                  isReadOnly
                    ? 'bg-gray-50 cursor-not-allowed opacity-70 border-gray-200'
                    : 'focus:border-blue-500 focus:ring-blue-500/20'
                } ${isMandatory && !hasValue && !isReadOnly ? 'border-amber-300 bg-amber-50/30' : ''}`}
                maxLength={characterLimit}
                readOnly={isReadOnly}
                disabled={isReadOnly}
                autoFocus={autoFocus}
              />
            ) : fieldConfig.type === 'select' ? (
              <Select
                value={typeof value === 'string' ? value : ''}
                onValueChange={isReadOnly ? undefined : onChange}
                disabled={isReadOnly}
              >
                <SelectTrigger
                  ref={selectRef}
                  className={`transition-colors ${
                    isReadOnly
                      ? 'bg-gray-50 cursor-not-allowed opacity-70 border-gray-200'
                      : 'focus:border-blue-500 focus:ring-blue-500/20'
                  } ${isMandatory && !hasValue && !isReadOnly ? 'border-amber-300 bg-amber-50/30' : ''}`}
                  autoFocus={autoFocus}
                >
                  <SelectValue placeholder={isReadOnly ? "No selection" : fieldConfig.placeholder} />
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
                ref={inputRef}
                placeholder={isReadOnly ? "No data entered" : fieldConfig.placeholder}
                value={typeof value === 'string' ? value : ''}
                onChange={(e) => {
                  if (isReadOnly) return;
                  const newValue = e.target.value;
                  if (newValue.length <= characterLimit) {
                    onChange(newValue);
                  }
                }}
                className={`transition-colors ${
                  isReadOnly
                    ? 'bg-gray-50 cursor-not-allowed opacity-70 border-gray-200'
                    : 'focus:border-blue-500 focus:ring-blue-500/20'
                } ${isMandatory && !hasValue && !isReadOnly ? 'border-amber-300 bg-amber-50/30' : ''}`}
                maxLength={characterLimit}
                readOnly={isReadOnly}
                disabled={isReadOnly}
                autoFocus={autoFocus}
              />
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}); 