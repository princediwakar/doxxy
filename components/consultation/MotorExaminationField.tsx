"use client";

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Chip } from '@/components/ui/chip';
import type { MotorExamData } from '@/types/consultation';
import { useMemo, memo } from 'react';

interface MotorExaminationFieldProps {
  value: MotorExamData;
  onChange: (value: MotorExamData) => void;
  isReadOnly?: boolean;
}

const muscleToneOptions = [
  'Normal',
  'Increased',
  'Decreased',
  'Spastic',
  'Rigid',
  'Flaccid'
];

const muscleBulkOptions = [
  'Normal',
  'Atrophy',
  'Hypertrophy',
  'Wasting',
  'Pseudohypertrophy'
];

const coordinationOptions = [
  'Normal',
  'Impaired',
  'Ataxia',
  'Dysmetria',
  'Dysdiadochokinesia'
];

const involuntaryMovementsOptions = [
  'None',
  'Tremors',
  'Fasciculations',
  'Myoclonus',
  'Chorea',
  'Athetosis',
  'Dystonia',
  'Tics'
];

export const MotorExaminationField = memo(({
  value,
  onChange,
  isReadOnly = false
}: MotorExaminationFieldProps) => {

  // Get default value for muscle strength fields
  const getMuscleStrengthValue = (muscle: string, side: 'left' | 'right') => {
    const fieldName = `${muscle}_${side}` as keyof MotorExamData;
    const currentValue = value[fieldName];

    // If value is explicitly set to empty string, return empty string
    // Otherwise return current value or default "5"
    if (currentValue === '') {
      return '';
    }
    return currentValue || '5';
  };

  const handleMuscleStrengthChange = (muscle: string, side: 'left' | 'right', newValue: string) => {
    const fieldName = `${muscle}_${side}` as keyof MotorExamData;
    onChange({
      ...value,
      [fieldName]: newValue
    });
  };


  const handleNotesChange = (newNotes: string) => {
    onChange({
      ...value,
      notes: newNotes
    });
  };

  const handleChipSelect = (field: keyof MotorExamData, option: string) => {
    if (isReadOnly) return;

    // If the option is already selected, deselect it
    const currentValue = value[field];
    const newValue = currentValue === option ? '' : option;

    onChange({
      ...value,
      [field]: newValue
    });
  };

  const muscleGroups = useMemo(() => [
    { key: 'shoulder', label: 'Shoulder' },
    { key: 'elbow', label: 'Elbow' },
    { key: 'wrist', label: 'Wrist' },
    { key: 'hip', label: 'Hip' },
    { key: 'knee', label: 'Knee' },
    { key: 'ankle', label: 'Ankle' }
  ], []);

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
                  R
                </th>
                <th className="text-center py-2 px-3 text-sm font-medium text-gray-700 bg-gray-50 w-1/4">
                  L
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
                        value={getMuscleStrengthValue(muscle.key, 'right')}
                        onChange={(e) => handleMuscleStrengthChange(muscle.key, 'right', e.target.value)}
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
                        value={getMuscleStrengthValue(muscle.key, 'left')}
                        onChange={(e) => handleMuscleStrengthChange(muscle.key, 'left', e.target.value)}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6 border-l-2 border-blue-200">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Muscle Tone</Label>
          <div className="flex flex-wrap gap-2">
            {muscleToneOptions.map((option) => (
              <Chip
                key={option}
                selected={value.muscle_tone === option}
                onClick={() => handleChipSelect('muscle_tone', option)}
                disabled={isReadOnly}
              >
                {option}
              </Chip>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Muscle Bulk</Label>
          <div className="flex flex-wrap gap-2">
            {muscleBulkOptions.map((option) => (
              <Chip
                key={option}
                selected={value.muscle_bulk === option}
                onClick={() => handleChipSelect('muscle_bulk', option)}
                disabled={isReadOnly}
              >
                {option}
              </Chip>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Involuntary Movements</Label>
          <div className="flex flex-wrap gap-2">
            {involuntaryMovementsOptions.map((option) => (
              <Chip
                key={option}
                selected={value.involuntary_movements === option}
                onClick={() => handleChipSelect('involuntary_movements', option)}
                disabled={isReadOnly}
              >
                {option}
              </Chip>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Coordination</Label>
          <div className="flex flex-wrap gap-2">
            {coordinationOptions.map((option) => (
              <Chip
                key={option}
                selected={value.coordination === option}
                onClick={() => handleChipSelect('coordination', option)}
                disabled={isReadOnly}
              >
                {option}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      {/* Notes section */}
      <div className="space-y-2 pl-6 border-l-2 border-blue-200">
        <Label className="text-sm font-medium text-gray-700">Additional Notes</Label>
        <Textarea
          placeholder="Enter additional motor examination findings..."
          value={value.notes || ''}
          onChange={(e) => handleNotesChange(e.target.value)}
          className="min-h-[60px] resize-none"
          readOnly={isReadOnly}
          disabled={isReadOnly}
        />
      </div>
    </div>
  );
});