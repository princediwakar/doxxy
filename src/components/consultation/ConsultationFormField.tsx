// src/components/consultation/ConsultationFormField.tsx
import { ChevronDown, ChevronRight, Activity } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { CharacterCounter } from './CharacterCounter';
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
  const headerRef = useRef<HTMLDivElement>(null);
  
  // Track if interaction is coming from mouse to prevent fighting with onFocus
  const isMouseInteraction = useRef(false);

  // Memoized values for field display
  const hasValue = useMemo(() => value && typeof value === 'string' && value.length > 0, [value]);
  const characterCount = useMemo(() => typeof value === 'string' ? value.length : 0, [value]);

  // --- FOCUS HELPER LOGIC ---
  const focusAndPositionCursor = useCallback(() => {
    // Small timeout to allow the Collapsible animation to render the input into the DOM
    requestAnimationFrame(() => {
      setTimeout(() => {
        let element: HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement | null = null;

        if (fieldConfig.type === 'textarea') element = textareaRef.current;
        else if (fieldConfig.type === 'select') element = selectRef.current;
        else element = inputRef.current;

        if (element) {
          element.focus();
          
          // Position cursor at the end for text inputs
          if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
             const length = element.value.length;
             element.setSelectionRange(length, length);
          }
        }
      }, 100); 
    });
  }, [fieldConfig.type]);

  // --- INTERACTION HANDLERS ---

  const handleMouseDown = () => {
    // Flag that we are clicking, so onFocus (Tab logic) doesn't interfere
    isMouseInteraction.current = true;
    // Reset flag shortly after
    setTimeout(() => { isMouseInteraction.current = false; }, 200);
  };

  const handleRowClick = (e: React.MouseEvent) => {
    if (isReadOnly) return;
    
    // Prevent toggling if clicking specific interactive children
    if ((e.target as HTMLElement).closest('button') && (e.target as HTMLElement) !== e.currentTarget) {
      return;
    }

    if (isExpanded) {
      // User wants to CLOSE the field
      setIsExpanded(false);
    } else {
      // User wants to OPEN the field
      setIsExpanded(true);
      focusAndPositionCursor();
    }
  };

  const handleHeaderFocus = () => {
    if (isReadOnly) return;

    // If this focus event was triggered by a mouse click, IGNORE IT.
    // Let the onClick handler manage the state (toggling).
    if (isMouseInteraction.current) return;

    // If this is a KEYBOARD focus (Tab), allow it to expand and focus inner input.
    if (!isExpanded) {
      setIsExpanded(true);
    }
    focusAndPositionCursor();
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    if (autoFocus && !isReadOnly) {
      setIsExpanded(true);
      focusAndPositionCursor();
    }
  }, [autoFocus, isReadOnly, focusAndPositionCursor]);

  const characterLimit = useMemo(() => {
    if (fieldConfig.type === 'textarea') return CHARACTER_LIMITS.textarea.default;
    return CHARACTER_LIMITS.input.default;
  }, [fieldConfig.type]);


  // --- COMPLEX FIELD RENDERING ---
  
  if (fieldConfig.name === 'prescriptions') {
    return (
      <div key={fieldIndex} className="space-y-3" data-field-name={fieldConfig.name}>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
           <div 
             onClick={() => !isReadOnly && setIsExpanded(!isExpanded)}
             className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
             isReadOnly ? 'bg-gray-50 opacity-70' : 'hover:bg-gray-50 cursor-pointer'
           }`}>
             <Label className="font-medium flex items-center gap-2 cursor-pointer">
               <Activity className="h-4 w-4 text-blue-600" />
               {fieldConfig.label}
               {isMandatory && <span className="text-destructive">*</span>}
             </Label>
             {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
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

  // Group other complex objects that default to {}
  if (['tabular_eye', 'vital_signs', 'motor_examination', 'reflex_examination'].includes(fieldConfig.type)) {
     const safeObjectValue = (typeof value === 'object' && value !== null && !Array.isArray(value)) ? value : {};

     return (
       <div key={fieldIndex} className="space-y-3" data-field-name={fieldConfig.name}>
         <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <div 
              onClick={() => !isReadOnly && setIsExpanded(!isExpanded)}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              isReadOnly ? 'bg-gray-50 opacity-70' : 'hover:bg-gray-50 cursor-pointer'
            }`}>
              <Label className="font-medium flex items-center gap-2 cursor-pointer">
                {fieldConfig.label}
                {isMandatory && <span className="text-destructive">*</span>}
              </Label>
              {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
            </div>
           <CollapsibleContent>
             <div className="pt-2">
               {fieldConfig.type === 'tabular_eye' && (
                 <TabularEyeField value={safeObjectValue as TabularEyeValue} onChange={onChange} isReadOnly={isReadOnly} />
               )}
               {fieldConfig.type === 'vital_signs' && (
                 <VitalSignsField value={safeObjectValue as VitalSignsData} onChange={onChange} isReadOnly={isReadOnly} />
               )}
               {fieldConfig.type === 'motor_examination' && (
                 <MotorExaminationField value={safeObjectValue as MotorExaminationValue} onChange={onChange} isReadOnly={isReadOnly} />
               )}
               {fieldConfig.type === 'reflex_examination' && (
                 <ReflexExaminationField value={safeObjectValue as ReflexExaminationValue} onChange={onChange} isReadOnly={isReadOnly} />
               )}
             </div>
           </CollapsibleContent>
         </Collapsible>
       </div>
     );
  }

  // --- STANDARD INPUT FIELDS ---
  
  return (
    <div key={fieldIndex} className="space-y-3" data-field-name={fieldConfig.name}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        {!isMandatory && (
          <div
            ref={headerRef}
            tabIndex={isReadOnly ? -1 : 0}
            onMouseDown={handleMouseDown}
            onClick={handleRowClick}
            onFocus={handleHeaderFocus}
            className={`flex items-center justify-between p-3 rounded-lg transition-colors w-full text-left outline-none ${
              isReadOnly
                ? 'bg-gray-50 cursor-not-allowed opacity-70'
                : 'hover:bg-gray-50 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            <Label className={`font-medium flex items-center gap-2 pointer-events-none ${
              isReadOnly ? 'text-gray-500' : 'text-gray-900'
            }`}>
              {fieldConfig.label}
              {isMandatory && <span className="text-destructive">*</span>}
              {hasValue && (
                <CharacterCounter current={characterCount} max={characterLimit} />
              )}
            </Label>
            
            <button 
              type="button"
              onClick={handleToggle}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
            </button>
          </div>
        )}
        
        <CollapsibleContent>
          <div className="space-y-3 px-1"> 
            {isMandatory && (
              <Label className={`font-medium flex items-center gap-2 mb-2 ${
                isReadOnly ? 'text-gray-500' : 'text-gray-900'
              }`}>
                {fieldConfig.label}
                <span className="text-destructive">*</span>
                <CharacterCounter current={characterCount} max={characterLimit} />
              </Label>
            )}
            
            {fieldConfig.type === 'textarea' ? (
              <Textarea
                ref={textareaRef}
                placeholder={isReadOnly ? "No data entered" : fieldConfig.placeholder}
                value={typeof value === 'string' ? value : ''}
                onChange={(e) => {
                  if (isReadOnly) return;
                  if (e.target.value.length <= characterLimit) onChange(e.target.value);
                }}
                rows={fieldConfig.rows || 4}
                className={`min-h-[100px] resize-none transition-colors ${
                  isReadOnly
                    ? 'bg-gray-50 cursor-not-allowed opacity-70 border-gray-200'
                    : 'focus:border-blue-500 focus:ring-blue-500/20'
                }`}
                maxLength={characterLimit}
                readOnly={isReadOnly}
                disabled={isReadOnly}
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
                  }`}
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
                  if (e.target.value.length <= characterLimit) onChange(e.target.value);
                }}
                className={`transition-colors ${
                  isReadOnly
                    ? 'bg-gray-50 cursor-not-allowed opacity-70 border-gray-200'
                    : 'focus:border-blue-500 focus:ring-blue-500/20'
                }`}
                maxLength={characterLimit}
                readOnly={isReadOnly}
                disabled={isReadOnly}
              />
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
});

ConsultationFormField.displayName = 'ConsultationFormField';