import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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
  const handleFieldChange = (field: keyof VitalSignsValue, newValue: string) => {
    onChange({
      ...value,
      [field]: newValue
    });
  };

  const calculateBMI = () => {
    if (value.height && value.weight) {
      const heightInMeters = parseFloat(value.height) / 100; // Convert cm to meters
      const weightInKg = parseFloat(value.weight);
      if (heightInMeters > 0 && weightInKg > 0) {
        const bmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
        handleFieldChange('bmi', bmi);
      }
    }
  };


  return (
    <div className="space-y-4 pl-6 border-l-2 border-blue-200">
      {/* All Vital Signs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Temperature */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Temperature</Label>
          <div className="flex items-center gap-2">
            <Input
              placeholder="°C"
              value={value.temperature || ''}
              onChange={(e) => handleFieldChange('temperature', e.target.value)}
              className="flex-1"
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
            <span className="text-sm text-gray-500 whitespace-nowrap">°C</span>
          </div>
        </div>

        {/* Pulse */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Pulse</Label>
          <div className="flex items-center gap-2">
            <Input
              placeholder="bpm"
              value={value.pulse || ''}
              onChange={(e) => handleFieldChange('pulse', e.target.value)}
              className="flex-1"
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
            <span className="text-sm text-gray-500 whitespace-nowrap">bpm</span>
          </div>
        </div>

        {/* Blood Pressure */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Blood Pressure</Label>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Systolic"
              value={value.blood_pressure_systolic || ''}
              onChange={(e) => handleFieldChange('blood_pressure_systolic', e.target.value)}
              className="flex-1"
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
            <span className="text-sm text-gray-500">/</span>
            <Input
              placeholder="Diastolic"
              value={value.blood_pressure_diastolic || ''}
              onChange={(e) => handleFieldChange('blood_pressure_diastolic', e.target.value)}
              className="flex-1"
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
            <span className="text-sm text-gray-500 whitespace-nowrap">mmHg</span>
          </div>
        </div>

        {/* Respiratory Rate */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Respiratory Rate</Label>
          <div className="flex items-center gap-2">
            <Input
              placeholder="breaths/min"
              value={value.respiratory_rate || ''}
              onChange={(e) => handleFieldChange('respiratory_rate', e.target.value)}
              className="flex-1"
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
            <span className="text-sm text-gray-500 whitespace-nowrap">/min</span>
          </div>
        </div>

        {/* Oxygen Saturation */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">O₂ Saturation</Label>
          <div className="flex items-center gap-2">
            <Input
              placeholder="%"
              value={value.oxygen_saturation || ''}
              onChange={(e) => handleFieldChange('oxygen_saturation', e.target.value)}
              className="flex-1"
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
            <span className="text-sm text-gray-500 whitespace-nowrap">%</span>
          </div>
        </div>

        {/* Height */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Height</Label>
          <div className="flex items-center gap-2">
            <Input
              placeholder="cm"
              value={value.height || ''}
              onChange={(e) => {
                handleFieldChange('height', e.target.value);
                // Auto-calculate BMI when height changes
                setTimeout(calculateBMI, 100);
              }}
              className="flex-1"
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
            <span className="text-sm text-gray-500 whitespace-nowrap">cm</span>
          </div>
        </div>

        {/* Weight */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Weight</Label>
          <div className="flex items-center gap-2">
            <Input
              placeholder="kg"
              value={value.weight || ''}
              onChange={(e) => {
                handleFieldChange('weight', e.target.value);
                // Auto-calculate BMI when weight changes
                setTimeout(calculateBMI, 100);
              }}
              className="flex-1"
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
            <span className="text-sm text-gray-500 whitespace-nowrap">kg</span>
          </div>
        </div>

        {/* BMI (calculated) */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">BMI</Label>
          <Input
            placeholder="Auto-calculated"
            value={value.bmi || ''}
            onChange={(e) => handleFieldChange('bmi', e.target.value)}
            className="flex-1"
            readOnly={true}
            disabled={true}
          />
        </div>
      </div>
    </div>
  );
};