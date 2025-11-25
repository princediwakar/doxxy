import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface ReflexExaminationValue {
  // Deep tendon reflexes (0-4+ scale)
  biceps_left?: string;
  biceps_right?: string;
  triceps_left?: string;
  triceps_right?: string;
  supinator_left?: string;
  supinator_right?: string;
  knee_left?: string;
  knee_right?: string;
  ankle_left?: string;
  ankle_right?: string;

  // Superficial reflexes
  plantar_left?: string;
  plantar_right?: string;
  abdominal_left?: string;
  abdominal_right?: string;

  // Additional findings
  clonus?: string;
  hoffmann?: string;
  notes?: string;
}

interface ReflexExaminationFieldProps {
  value: ReflexExaminationValue;
  onChange: (value: ReflexExaminationValue) => void;
  isReadOnly?: boolean;
}

export const ReflexExaminationField = ({
  value,
  onChange,
  isReadOnly = false
}: ReflexExaminationFieldProps) => {
  const [showNotes, setShowNotes] = useState(!!value.notes);

  const handleReflexChange = (reflex: string, side: 'left' | 'right', newValue: string) => {
    const fieldName = `${reflex}_${side}` as keyof ReflexExaminationValue;
    onChange({
      ...value,
      [fieldName]: newValue
    });
  };

  const handleAdditionalFieldChange = (field: keyof ReflexExaminationValue, newValue: string) => {
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

  const deepTendonReflexes = [
    { key: 'biceps', label: 'Biceps (B)' },
    { key: 'triceps', label: 'Triceps (T)' },
    { key: 'supinator', label: 'Supinator (S)' },
    { key: 'knee', label: 'Knee (K)' },
    { key: 'ankle', label: 'Ankle (A)' }
  ];

  const superficialReflexes = [
    { key: 'plantar', label: 'Plantar' },
    { key: 'abdominal', label: 'Abdominal' }
  ];

  return (
    <div className="space-y-4">
      {/* Deep Tendon Reflexes Table */}
      <div className="pl-6 border-l-2 border-blue-200">
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Deep Tendon Reflexes (0-4+ Scale)</h4>
          <div className="text-xs text-gray-500 mb-3">
            0: Absent, 1+: Diminished, 2+: Normal, 3+: Brisk, 4+: Hyperactive with clonus
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 bg-gray-50 w-1/2">
                  REFLEX
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
              {deepTendonReflexes.map((reflex, index) => (
                <tr key={reflex.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-3 text-sm font-medium text-gray-700 border-b border-gray-200 w-1/2">
                    {reflex.label}
                  </td>
                  <td className="py-2 px-3 border-b border-gray-200 w-1/4">
                    <div className="flex justify-center">
                      <Input
                        placeholder="0-4+"
                        value={value[`${reflex.key}_left` as keyof ReflexExaminationValue] || ''}
                        onChange={(e) => handleReflexChange(reflex.key, 'left', e.target.value)}
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
                        placeholder="0-4+"
                        value={value[`${reflex.key}_right` as keyof ReflexExaminationValue] || ''}
                        onChange={(e) => handleReflexChange(reflex.key, 'right', e.target.value)}
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

      {/* Superficial Reflexes Table */}
      <div className="pl-6 border-l-2 border-blue-200">
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Superficial Reflexes</h4>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 bg-gray-50 w-1/2">
                  REFLEX
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
              {superficialReflexes.map((reflex, index) => (
                <tr key={reflex.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-3 text-sm font-medium text-gray-700 border-b border-gray-200 w-1/2">
                    {reflex.label}
                  </td>
                  <td className="py-2 px-3 border-b border-gray-200 w-1/4">
                    <div className="flex justify-center">
                      <Input
                        placeholder="Present / Absent"
                        value={value[`${reflex.key}_left` as keyof ReflexExaminationValue] || ''}
                        onChange={(e) => handleReflexChange(reflex.key, 'left', e.target.value)}
                        className="w-20 text-center"
                        readOnly={isReadOnly}
                        disabled={isReadOnly}
                      />
                    </div>
                  </td>
                  <td className="py-2 px-3 border-b border-gray-200 w-1/4">
                    <div className="flex justify-center">
                      <Input
                        placeholder="Present / Absent"
                        value={value[`${reflex.key}_right` as keyof ReflexExaminationValue] || ''}
                        onChange={(e) => handleReflexChange(reflex.key, 'right', e.target.value)}
                        className="w-20 text-center"
                        readOnly={isReadOnly}
                        disabled={isReadOnly}
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
          <Label className="text-sm font-medium text-gray-700">Clonus</Label>
          <Input
            placeholder="Present / Absent"
            value={value.clonus || ''}
            onChange={(e) => handleAdditionalFieldChange('clonus', e.target.value)}
            readOnly={isReadOnly}
            disabled={isReadOnly}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Hoffmann's Sign</Label>
          <Input
            placeholder="Present / Absent"
            value={value.hoffmann || ''}
            onChange={(e) => handleAdditionalFieldChange('hoffmann', e.target.value)}
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
            placeholder="Enter additional reflex examination findings..."
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