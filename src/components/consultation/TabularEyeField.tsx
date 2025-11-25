import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EyeFieldValue {
  left?: string;
  right?: string;
  notes?: string;
}

interface TabularEyeFieldProps {
  value: EyeFieldValue;
  onChange: (value: EyeFieldValue) => void;
  fieldType: 'input' | 'textarea' | 'select';
  placeholder?: string;
  options?: string[];
  isReadOnly?: boolean;
}

export const TabularEyeField = ({
  value,
  onChange,
  fieldType,
  placeholder = "Enter value",
  options = [],
  isReadOnly = false
}: TabularEyeFieldProps) => {
  const [showNotes, setShowNotes] = useState(!!value.notes);

  const handleLeftChange = (newValue: string) => {
    onChange({
      ...value,
      left: newValue
    });
  };

  const handleRightChange = (newValue: string) => {
    onChange({
      ...value,
      right: newValue
    });
  };

  const handleNotesChange = (newNotes: string) => {
    onChange({
      ...value,
      notes: newNotes
    });
  };

  const toggleNotes = () => {
    if (isReadOnly) return;
    setShowNotes(!showNotes);
    if (showNotes && !value.notes) {
      // If hiding notes and no notes exist, remove the notes field
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { notes, ...rest } = value;
      onChange(rest);
    }
  };

  const renderField = (eye: 'left' | 'right', eyeValue: string | undefined, onEyeChange: (value: string) => void) => {
    const eyeLabel = eye === 'left' ? 'Left' : 'Right';

    if (fieldType === 'textarea') {
      return (
        <div className="flex items-start gap-3">
          <Label className="text-sm font-medium text-gray-700 min-w-[60px] pt-2">{eyeLabel}</Label>
          <Textarea
            placeholder={placeholder}
            value={eyeValue || ''}
            onChange={(e) => onEyeChange(e.target.value)}
            className="min-h-[80px] resize-none flex-1"
            readOnly={isReadOnly}
            disabled={isReadOnly}
          />
        </div>
      );
    }

    if (fieldType === 'select') {
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">{eyeLabel}</Label>
          <Select
            value={eyeValue || ''}
            onValueChange={onEyeChange}
            disabled={isReadOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Default to input
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">{eyeLabel}</Label>
        <Input
          placeholder={placeholder}
          value={eyeValue || ''}
          onChange={(e) => onEyeChange(e.target.value)}
          readOnly={isReadOnly}
          disabled={isReadOnly}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4 pl-6 border-l-2 border-blue-200">
        {renderField('left', value.left, handleLeftChange)}
        {renderField('right', value.right, handleRightChange)}
      </div>

      {/* Notes section */}
      <div className="space-y-2 pl-6 border-l-2 border-blue-200">
        <button
          type="button"
          onClick={toggleNotes}
          disabled={isReadOnly}
          className={`text-sm font-medium transition-colors ${
            isReadOnly
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-600 hover:text-blue-700 cursor-pointer'
          }`}
        >
          {showNotes ? 'Hide Additional Notes' : '+ Add Additional Notes'}
        </button>

        {showNotes && (
          <Textarea
            placeholder="Enter additional notes or observations..."
            value={value.notes || ''}
            onChange={(e) => handleNotesChange(e.target.value)}
            className="min-h-[60px] resize-none"
            readOnly={isReadOnly}
            disabled={isReadOnly}
          />
        )}
      </div>
    </div>
  );
};