// src/components/consultation/ConsultationFormField.tsx
"use client";
import { ChevronDown, Activity } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { CHARACTER_LIMITS } from './constants';
import { PrescriptionField } from './PrescriptionField';
import { TabularEyeField } from './TabularEyeField';
import { VitalSignsField } from './VitalSignsField';
import { MotorExaminationField } from './MotorExaminationField';
import { ReflexExaminationField } from './ReflexExaminationField';
import type { FieldConfig, FieldValue, TabularEyeValue, MotorExaminationValue, ReflexExaminationValue, VitalSignsData } from '@/types/consultation';
import { useState, useRef, useEffect, useMemo, memo, useCallback } from 'react';

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
  const [isExpanded, setIsExpanded] = useState(isMandatory || fieldIndex === 0);

  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectRef = useRef<HTMLButtonElement>(null);

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const el = textareaRef.current ?? inputRef.current ?? selectRef.current;
        el?.focus();
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
          el.setSelectionRange(el.value.length, el.value.length);
        }
      }, 100);
    });
  }, []);

  useEffect(() => {
    if (autoFocus && !isReadOnly) {
      setIsExpanded(true);
      focusInput();
    }
  }, [autoFocus, isReadOnly, focusInput]);

  const characterLimit = useMemo(() => {
    if (fieldConfig.type === 'textarea') return CHARACTER_LIMITS.textarea.default;
    return CHARACTER_LIMITS.input.default;
  }, [fieldConfig.type]);


  // --- COMPLEX FIELD RENDERING ---
  
  const complexHeaderClass = isReadOnly
    ? "bg-muted/30 cursor-not-allowed opacity-70"
    : "hover:bg-muted/50 cursor-pointer";

  if (fieldConfig.name === 'prescriptions') {
    return (
      <div key={fieldIndex} className="space-y-3" data-field-name={fieldConfig.name}>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <div
            onClick={() => !isReadOnly && setIsExpanded(!isExpanded)}
            className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${complexHeaderClass}`}
          >
            <Label className="font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              {fieldConfig.label}
              {isMandatory && <span className="text-destructive">*</span>}
            </Label>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </div>
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

  if (['tabular_eye', 'vital_signs', 'motor_examination', 'reflex_examination'].includes(fieldConfig.type ?? '')) {
    const safeObjectValue = (typeof value === 'object' && value !== null && !Array.isArray(value)) ? value : {};

    return (
      <div key={fieldIndex} className="space-y-3" data-field-name={fieldConfig.name}>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <div
            onClick={() => !isReadOnly && setIsExpanded(!isExpanded)}
            className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors ${complexHeaderClass}`}
          >
            <Label className="font-medium flex items-center gap-2">
              {fieldConfig.label}
              {isMandatory && <span className="text-destructive">*</span>}
            </Label>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </div>
          <CollapsibleContent>
            <div className="pt-2">
              {fieldConfig.type === 'tabular_eye' && <TabularEyeField value={safeObjectValue as TabularEyeValue} onChange={onChange} isReadOnly={isReadOnly} />}
              {fieldConfig.type === 'vital_signs' && <VitalSignsField value={safeObjectValue as VitalSignsData} onChange={onChange} isReadOnly={isReadOnly} />}
              {fieldConfig.type === 'motor_examination' && <MotorExaminationField value={safeObjectValue as MotorExaminationValue} onChange={onChange} isReadOnly={isReadOnly} />}
              {fieldConfig.type === 'reflex_examination' && <ReflexExaminationField value={safeObjectValue as ReflexExaminationValue} onChange={onChange} isReadOnly={isReadOnly} />}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  // --- STANDARD INPUT FIELDS ---

  const readOnlyInputClass = "bg-muted/30 cursor-not-allowed opacity-70";

  const renderInput = () => {
    if (fieldConfig.type === 'textarea') {
      return (
        <Textarea
          ref={textareaRef}
          placeholder={isReadOnly ? "No data entered" : fieldConfig.placeholder}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => {
            if (isReadOnly) return;
            if (e.target.value.length <= characterLimit) onChange(e.target.value);
          }}
          rows={fieldConfig.rows || 4}
          className={`min-h-[100px] resize-none ${isReadOnly ? readOnlyInputClass : ""}`}
          maxLength={characterLimit}
          readOnly={isReadOnly}
          disabled={isReadOnly}
        />
      );
    }
    if (fieldConfig.type === 'select') {
      return (
        <Select
          value={typeof value === 'string' ? value : ''}
          onValueChange={isReadOnly ? undefined : onChange}
          disabled={isReadOnly}
        >
          <SelectTrigger ref={selectRef} className={isReadOnly ? readOnlyInputClass : ""}>
            <SelectValue placeholder={isReadOnly ? "No selection" : fieldConfig.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {fieldConfig.options?.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    return (
      <Input
        ref={inputRef}
        placeholder={isReadOnly ? "No data entered" : fieldConfig.placeholder}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => {
          if (isReadOnly) return;
          if (e.target.value.length <= characterLimit) onChange(e.target.value);
        }}
        className={isReadOnly ? readOnlyInputClass : ""}
        maxLength={characterLimit}
        readOnly={isReadOnly}
        disabled={isReadOnly}
      />
    );
  };

  const header = (
    <div
      onClick={() => { if (!isReadOnly && !isMandatory) { setIsExpanded(!isExpanded); if (!isExpanded) focusInput(); } }}
      className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors w-full ${
        isReadOnly
          ? "bg-muted/30 cursor-not-allowed opacity-70"
          : isMandatory
            ? "bg-muted/20"
            : "hover:bg-muted/50 cursor-pointer"
      }`}
    >
      <Label className="font-medium flex items-center gap-2">
        {fieldConfig.label}
        {isMandatory && <span className="text-destructive">*</span>}
      </Label>
      {!isMandatory && (
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      )}
    </div>
  );

  return (
    <div key={fieldIndex} className="space-y-3" data-field-name={fieldConfig.name}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        {header}
        <CollapsibleContent>
          <div className="space-y-3 px-1 pt-2">
            {renderInput()}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
});

ConsultationFormField.displayName = 'ConsultationFormField';