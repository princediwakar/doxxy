import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface MotorExaminationValue {
  // Muscle strength grading (0-5 scale)
  shoulder_left?: string;
  shoulder_right?: string;
  elbow_left?: string;
  elbow_right?: string;
  wrist_left?: string;
  wrist_right?: string;
  hip_left?: string;
  hip_right?: string;
  knee_left?: string;
  knee_right?: string;
  ankle_left?: string;
  ankle_right?: string;

  // Additional findings
  muscle_tone?: string;
  muscle_bulk?: string;
  involuntary_movements?: string;
  coordination?: string;
  notes?: string;
}

interface MotorExaminationFieldProps {
  value: MotorExaminationValue;
  onChange: (value: MotorExaminationValue) => void;
  isReadOnly?: boolean;
}

export const MotorExaminationField = ({
  value,
  onChange,
  isReadOnly = false
}: MotorExaminationFieldProps) => {
  const [showNotes, setShowNotes] = useState(!!value.notes);

  const handleMuscleStrengthChange = (muscle: string, side: 'left' | 'right', newValue: string) => {
    const fieldName = `${muscle}_${side}` as keyof MotorExaminationValue;
    onChange({
      ...value,
      [fieldName]: newValue
    });
  };

  const handleAdditionalFieldChange = (field: keyof MotorExaminationValue, newValue: string) => {
    onChange({
      ...value,
      [field]: newValue
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

  const muscleGroups = [
    { key: 'shoulder', label: 'Shoulder' },
    { key: 'elbow', label: 'Elbow' },
    { key: 'wrist', label: 'Wrist' },
    { key: 'hip', label: 'Hip' },
    { key: 'knee', label: 'Knee' },
    { key: 'ankle', label: 'Ankle' }
  ];

  return (
    <div className="space-y-4">
      {/* Muscle Strength Table */}
      <div className="pl-6 border-l-2 border-blue-200">
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Muscle Strength (0-5 Scale)</h4>
          <div className="text-xs text-gray-500 mb-3">
            0: No contraction, 1: Flicker, 2: Movement with gravity eliminated, 3: Movement against gravity,
            4: Movement against some resistance, 5: Normal power
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 bg-gray-50 w-1/2">
                  POWER
                </th>
                <th className="text-center py-2 px-3 text-sm font-medium text-gray-700 bg-gray-50 w-1/4">
                  L
                </th>
                <th className="text-center py-2 px-3 text-sm font-medium text-gray-700 bg-gray-50 w-1/4">
                  R
                </th>
              </tr>
            </thead>
            <tbody>
              {muscleGroups.map((muscle, index) => (
                <tr key={muscle.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-3 text-sm font-medium text-gray-700 border-b border-gray-200 w-1/2">
                    {muscle.label}
                  </td>
                  <td className="py-2 px-3 border-b border-gray-200 w-1/4">
                    <div className="flex justify-center">
                      <Input
                        placeholder=""
                        value={value[`${muscle.key}_left` as keyof MotorExaminationValue] || ''}
                        onChange={(e) => handleMuscleStrengthChange(muscle.key, 'left', e.target.value)}
                        className="w-16 text-center"
                        readOnly={isReadOnly}
                        disabled={isReadOnly}
                        maxLength={2}
                      />
                    </div>
                  </td>
                  <td className="py-2 px-3 border-b border-gray-200 w-1/4">
                    <div className="flex justify-center">
                      <Input
                        placeholder=""
                        value={value[`${muscle.key}_right` as keyof MotorExaminationValue] || ''}
                        onChange={(e) => handleMuscleStrengthChange(muscle.key, 'right', e.target.value)}
                        className="w-16 text-center"
                        readOnly={isReadOnly}
                        disabled={isReadOnly}
                        maxLength={2}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Findings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-blue-200">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Muscle Tone</Label>
          <Input
            placeholder="Normal / Increased / Decreased"
            value={value.muscle_tone || ''}
            onChange={(e) => handleAdditionalFieldChange('muscle_tone', e.target.value)}
            readOnly={isReadOnly}
            disabled={isReadOnly}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Muscle Bulk</Label>
          <Input
            placeholder="Normal / Atrophy / Hypertrophy"
            value={value.muscle_bulk || ''}
            onChange={(e) => handleAdditionalFieldChange('muscle_bulk', e.target.value)}
            readOnly={isReadOnly}
            disabled={isReadOnly}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Involuntary Movements</Label>
          <Input
            placeholder="Tremors / Fasciculations / Myoclonus"
            value={value.involuntary_movements || ''}
            onChange={(e) => handleAdditionalFieldChange('involuntary_movements', e.target.value)}
            readOnly={isReadOnly}
            disabled={isReadOnly}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Coordination</Label>
          <Input
            placeholder="Normal / Impaired"
            value={value.coordination || ''}
            onChange={(e) => handleAdditionalFieldChange('coordination', e.target.value)}
            readOnly={isReadOnly}
            disabled={isReadOnly}
          />
        </div>
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
            placeholder="Enter additional motor examination findings..."
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