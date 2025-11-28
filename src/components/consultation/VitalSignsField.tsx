import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useEffect, useCallback } from 'react';

interface VitalSignsValue {
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

interface VitalSignsFieldProps {
  value: VitalSignsValue;
  onChange: (value: VitalSignsValue) => void;
  isReadOnly?: boolean;
}

export const VitalSignsField = ({
  value,
  onChange,
  isReadOnly = false
}: VitalSignsFieldProps) => {
  const handleFieldChange = useCallback((field: keyof VitalSignsValue, newValue: string) => {
    onChange({
      ...value,
      [field]: newValue
    });
  }, [value, onChange]);

  const calculateBMI = useCallback(() => {
    // Clear BMI if either height or weight is empty
    if (!value.height || !value.weight) {
      handleFieldChange('bmi', '');
      return;
    }

    // Calculate BMI only if both height and weight have valid values
    const heightInMeters = parseFloat(value.height) / 100; // Convert cm to meters
    const weightInKg = parseFloat(value.weight);

    if (heightInMeters > 0 && weightInKg > 0) {
      const bmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
      handleFieldChange('bmi', bmi);
    } else {
      // Clear BMI if values are invalid
      handleFieldChange('bmi', '');
    }
  }, [value.height, value.weight, handleFieldChange]);

  // Calculate BMI whenever height or weight changes
  useEffect(() => {
    calculateBMI();
  }, [value.height, value.weight]);


  return (
    <div className="pl-6 border-l-2 border-blue-200">
      {/* All Vital Signs - Compact Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* Temperature */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-gray-700">Temperature</Label>
          <div className="flex items-center gap-1">
            <Input
              placeholder="°C"
              value={value.temperature || ''}
              onChange={(e) => handleFieldChange('temperature', e.target.value)}
              className="flex-1 text-sm h-8"
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
            <span className="text-xs text-gray-500 whitespace-nowrap">°C</span>
          </div>
        </div>

        {/* Pulse */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-gray-700">Pulse</Label>
          <div className="flex items-center gap-1">
            <Input
              placeholder="bpm"
              value={value.pulse || ''}
              onChange={(e) => handleFieldChange('pulse', e.target.value)}
              className="flex-1 text-sm h-8"
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
            <span className="text-xs text-gray-500 whitespace-nowrap">bpm</span>
          </div>
        </div>

        {/* Blood Pressure */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-gray-700">B.P.</Label>
          <div className="flex items-center gap-1">
            <Input
              placeholder="Systolic"
              value={value.blood_pressure_systolic || ''}
              onChange={(e) => handleFieldChange('blood_pressure_systolic', e.target.value)}
              className="w-16 text-sm h-8"
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
            <span className="text-xs text-gray-500">/</span>
            <Input
              placeholder="Diastolic"
              value={value.blood_pressure_diastolic || ''}
              onChange={(e) => handleFieldChange('blood_pressure_diastolic', e.target.value)}
              className="w-16 text-sm h-8"
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
            <span className="text-xs text-gray-500 whitespace-nowrap">mmHg</span>
          </div>
        </div>

        {/* Respiratory Rate */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-gray-700">Resp. Rate</Label>
          <div className="flex items-center gap-1">
            <Input
              placeholder="breaths/min"
              value={value.respiratory_rate || ''}
              onChange={(e) => handleFieldChange('respiratory_rate', e.target.value)}
              className="flex-1 text-sm h-8"
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
            <span className="text-xs text-gray-500 whitespace-nowrap">/min</span>
          </div>
        </div>

        {/* Oxygen Saturation */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-gray-700">O₂ Sat</Label>
          <div className="flex items-center gap-1">
            <Input
              placeholder="%"
              value={value.oxygen_saturation || ''}
              onChange={(e) => handleFieldChange('oxygen_saturation', e.target.value)}
              className="flex-1 text-sm h-8"
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
            <span className="text-xs text-gray-500 whitespace-nowrap">%</span>
          </div>
        </div>

        {/* Height */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-gray-700">Height</Label>
          <div className="flex items-center gap-1">
            <Input
              placeholder="cm"
              value={value.height || ''}
              onChange={(e) => handleFieldChange('height', e.target.value)}
              className="flex-1 text-sm h-8"
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
            <span className="text-xs text-gray-500 whitespace-nowrap">cm</span>
          </div>
        </div>

        {/* Weight */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-gray-700">Weight</Label>
          <div className="flex items-center gap-1">
            <Input
              placeholder="kg"
              value={value.weight || ''}
              onChange={(e) => handleFieldChange('weight', e.target.value)}
              className="flex-1 text-sm h-8"
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
            <span className="text-xs text-gray-500 whitespace-nowrap">kg</span>
          </div>
        </div>

        {/* BMI (calculated) */}
        <div className="space-y-1">
          <Label className="text-xs font-medium text-gray-700">BMI</Label>
          <Input
            placeholder="Auto-calculated"
            value={value.bmi || ''}
            onChange={(e) => handleFieldChange('bmi', e.target.value)}
            className="flex-1 text-sm h-8"
            readOnly={true}
            disabled={true}
          />
        </div>
      </div>
    </div>
  );
};