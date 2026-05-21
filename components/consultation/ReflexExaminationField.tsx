import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ReflexExamData } from '@/types/consultation';


interface ReflexExaminationFieldProps {
  value: ReflexExamData;
  onChange: (value: ReflexExamData) => void;
  isReadOnly?: boolean;
}

export const ReflexExaminationField = ({
  value,
  onChange,
  isReadOnly = false
}: ReflexExaminationFieldProps) => {

  // Get default value for deep tendon reflex fields
  const getReflexValue = (reflex: string, side: 'left' | 'right') => {
    const fieldName = `${reflex}_${side}` as keyof ReflexExamData;
    const currentValue = value[fieldName];

    // If value is explicitly set to empty string, return empty string
    // Otherwise return current value or default "2" for deep tendon reflexes
    if (currentValue === '') {
      return '';
    }
    return currentValue || '2';
  };

  const handleReflexChange = (reflex: string, side: 'right' | 'left', newValue: string) => {
    const fieldName = `${reflex}_${side}` as keyof ReflexExamData;
    onChange({
      ...value,
      [fieldName]: newValue
    });
  };

  const handleAdditionalFieldChange = (field: keyof ReflexExamData, newValue: string) => {
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
          <h4 className="text-sm font-medium text-foreground mb-2">Deep Tendon Reflexes (0-4+ Scale)</h4>
          <div className="text-xs text-muted-foreground mb-3">
            0: Absent, 1+: Diminished, 2+: Normal, 3+: Brisk, 4+: Hyperactive with clonus
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-sm font-medium text-foreground bg-muted w-1/2">
                  REFLEX
                </th>
                <th className="text-center py-2 px-3 text-sm font-medium text-foreground bg-muted w-1/4">
                  R
                </th>
                <th className="text-center py-2 px-3 text-sm font-medium text-foreground bg-muted w-1/4">
                  L
                </th>
              </tr>
            </thead>
            <tbody>
              {deepTendonReflexes.map((reflex, index) => (
                <tr key={reflex.key} className={index % 2 === 0 ? 'bg-background' : 'bg-muted'}>
                  <td className="py-2 px-3 text-sm font-medium text-foreground border-b border-border w-1/2">
                    {reflex.label}
                  </td>
                  <td className="py-2 px-3 border-b border-border w-1/4">
                    <div className="flex justify-center">
                      <Input
                        placeholder=""
                        value={getReflexValue(reflex.key, 'right')}
                        onChange={(e) => handleReflexChange(reflex.key, 'right', e.target.value)}
                        className="w-16 text-center"
                        readOnly={isReadOnly}
                        disabled={isReadOnly}
                        maxLength={2}
                      />
                    </div>
                  </td>
                  <td className="py-2 px-3 border-b border-border w-1/4">
                    <div className="flex justify-center">
                      <Input
                        placeholder=""
                        value={getReflexValue(reflex.key, 'left')}
                        onChange={(e) => handleReflexChange(reflex.key, 'left', e.target.value)}
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
          <h4 className="text-sm font-medium text-foreground mb-2">Superficial Reflexes</h4>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-sm font-medium text-foreground bg-muted w-1/2">
                  REFLEX
                </th>
                <th className="text-center py-2 px-3 text-sm font-medium text-foreground bg-muted w-1/4">
                  R
                </th>
                <th className="text-center py-2 px-3 text-sm font-medium text-foreground bg-muted w-1/4">
                  L
                </th>
              </tr>
            </thead>
            <tbody>
              {superficialReflexes.map((reflex, index) => (
                <tr key={reflex.key} className={index % 2 === 0 ? 'bg-background' : 'bg-muted'}>
                  <td className="py-2 px-3 text-sm font-medium text-foreground border-b border-border w-1/2">
                    {reflex.label}
                  </td>
                  
                  <td className="py-2 px-3 border-b border-border w-1/4">
                    <div className="flex justify-center">
                      <Input
                        placeholder="Present / Absent"
                        value={value[`${reflex.key}_right` as keyof ReflexExamData] || ''}
                        onChange={(e) => handleReflexChange(reflex.key, 'right', e.target.value)}
                        className="w-20 text-center"
                        readOnly={isReadOnly}
                        disabled={isReadOnly}
                      />
                    </div>
                  </td>
                  <td className="py-2 px-3 border-b border-border w-1/4">
                    <div className="flex justify-center">
                      <Input
                        placeholder="Present / Absent"
                        value={value[`${reflex.key}_left` as keyof ReflexExamData] || ''}
                        onChange={(e) => handleReflexChange(reflex.key, 'left', e.target.value)}
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
          <Label className="text-sm font-medium text-foreground">Clonus</Label>
          <Input
            placeholder="Present / Absent"
            value={value.clonus || ''}
            onChange={(e) => handleAdditionalFieldChange('clonus', e.target.value)}
            readOnly={isReadOnly}
            disabled={isReadOnly}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Hoffmann's Sign</Label>
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
        
          <Textarea
            placeholder="Enter additional reflex examination findings..."
            value={value.notes || ''}
            onChange={(e) => handleNotesChange(e.target.value)}
            className="min-h-[60px] resize-none"
            readOnly={isReadOnly}
            disabled={isReadOnly}
          />
      </div>
    </div>
  );
};