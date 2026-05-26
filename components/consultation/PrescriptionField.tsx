// components/consultation/PrescriptionField.tsx
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PrescriptionFieldProps, PrescriptionMedication } from '@/types/consultation';
import { MedicineCombobox } from '@/components/ui/medicine-combobox';

export const PrescriptionField = ({ value = [], onChange, isReadOnly = false }: PrescriptionFieldProps) => {

  const addMedication = () => {
    if (isReadOnly) return;
    onChange([...value, {
      name: '',
      dosage: '',
      frequency: 'BD',
      duration: '',
      instructions: '',
    }]);
  };

  const removeMedication = (index: number) => {
    if (isReadOnly) return;
    const newValue = value.filter((_: PrescriptionMedication, i: number) => i !== index);
    onChange(newValue);
  };

  const updateMedication = (index: number, field: string, val: string) => {
    if (isReadOnly) return;
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  };

  // Handle medicine selection with auto-fill
  const handleMedicineSelect = (index: number, medicine: { name: string }, autoFillData?: { dosage: string; route: string; suggestedFrequency?: string }) => {
    if (isReadOnly) return;
    const updated = [...value];
    updated[index] = {
      ...updated[index],
      name: medicine.name,
      dosage: autoFillData?.dosage || updated[index].dosage,
      frequency: autoFillData?.suggestedFrequency || updated[index].frequency
    };
    onChange(updated);
  };

  // Handle clearing medicine
  const handleMedicineClear = (index: number) => {
    if (isReadOnly) return;
    const updated = [...value];
    updated[index] = {
      ...updated[index],
      name: '',
      dosage: '',
      frequency: 'BD'
    };
    onChange(updated);
  };

  // Don't show medications with empty names in read-only mode unless there are no valid medications
  const displayMedications = isReadOnly
    ? value.filter((med: PrescriptionMedication) => med.name && med.name.trim().length > 0)
    : value;

  if (isReadOnly && displayMedications.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic p-4 bg-muted rounded-lg">
        No prescriptions recorded
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {displayMedications.map((medication: PrescriptionMedication, index: number) => (
        <div key={index} className={`border rounded-lg p-4 space-y-4 transition-colors ${
          isReadOnly ? 'bg-muted border-border' : 'bg-background border-border hover:border-border'
        } ${!medication.name?.trim() && !isReadOnly ? 'border-destructive/30 bg-destructive/5' : ''}`}>
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-medium">
                {index + 1}
              </Badge>
              <span className="text-sm font-medium text-foreground">
                {medication.name || 'New Medication'}
              </span>
              {isReadOnly && (
                <Badge variant="secondary" className="text-xs">Read Only</Badge>
              )}
            </div>
            {!isReadOnly && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeMedication(index)}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Medicine Name */}
          <div className="space-y-1.5">
            <Label className={`text-sm font-medium ${isReadOnly ? 'text-muted-foreground' : 'text-foreground'}`}>
              Medicine Name
            </Label>
            {isReadOnly ? (
              <div className="text-sm text-muted-foreground p-2 bg-background rounded border">
                {medication.name || 'No medicine specified'}
              </div>
            ) : (
              <MedicineCombobox
                value={medication.name || ''}
                onValueChange={(value) => updateMedication(index, 'name', value)}
                onMedicineSelect={(medicine, autoFillData) => handleMedicineSelect(index, medicine, autoFillData)}
                onClear={() => handleMedicineClear(index)}
                placeholder="Search for medicine..."
                className={`${
                  !medication.name || medication.name.trim().length === 0
                    ? 'border-destructive/30 focus:border-destructive/60'
                    : ''
                }`}
              />
            )}
          </div>

          {/* Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Dosage */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Label className={`text-sm font-medium ${isReadOnly ? 'text-muted-foreground' : 'text-foreground'}`}>
                  Dosage
                </Label>
                {!isReadOnly && medication.dosage && (
                  <Badge variant="secondary" className="text-xs">Auto-filled</Badge>
                )}
              </div>
              <Input
                value={medication.dosage || ''}
                onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                placeholder={isReadOnly ? "No dosage" : "e.g., 500mg"}
                className={`text-sm ${
                  isReadOnly ? 'bg-muted text-muted-foreground border-border' : ''
                }`}
                readOnly={isReadOnly}
                disabled={isReadOnly}
              />
            </div>

            {/* Frequency */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Label className={`text-sm font-medium ${isReadOnly ? 'text-muted-foreground' : 'text-foreground'}`}>
                  Frequency
                </Label>
                {!isReadOnly && medication.frequency && (
                  <Badge variant="secondary" className="text-xs">Suggested</Badge>
                )}
              </div>
              <Select 
                value={medication.frequency || ''} 
                onValueChange={(val) => updateMedication(index, 'frequency', val)}
                disabled={isReadOnly}
              >
                <SelectTrigger className={`text-sm ${
                  isReadOnly ? 'bg-muted text-muted-foreground border-border' : ''
                }`}>
                  <SelectValue placeholder={isReadOnly ? "No frequency" : "Select"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OD">OD (Once Daily)</SelectItem>
                  <SelectItem value="BD">BD (Twice Daily)</SelectItem>
                  <SelectItem value="TDS">TDS (Three Times Daily)</SelectItem>
                  <SelectItem value="QID">QID (Four Times Daily)</SelectItem>
                  <SelectItem value="PRN">PRN (As Needed)</SelectItem>
                  <SelectItem value="SOS">SOS (As Required)</SelectItem>
                  <SelectItem value="Q4H">Q4H (Every 4 Hours)</SelectItem>
                  <SelectItem value="Q6H">Q6H (Every 6 Hours)</SelectItem>
                  <SelectItem value="Q8H">Q8H (Every 8 Hours)</SelectItem>
                  <SelectItem value="Q12H">Q12H (Every 12 Hours)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <Label className={`text-sm font-medium ${isReadOnly ? 'text-muted-foreground' : 'text-foreground'}`}>
                Duration
              </Label>
              <Input
                value={medication.duration || ''}
                onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                placeholder={isReadOnly ? "No duration" : "e.g., 7 days"}
                className={`text-sm ${
                  isReadOnly ? 'bg-muted text-muted-foreground border-border' : ''
                }`}
                readOnly={isReadOnly}
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-1.5">
            <Label className={`text-sm font-medium ${isReadOnly ? 'text-muted-foreground' : 'text-foreground'}`}>
              Special Instructions
            </Label>
            <Textarea
              value={medication.instructions || ''}
              onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
              placeholder={isReadOnly ? "No special instructions" : "Special instructions for patient..."}
              rows={2}
              className={`text-sm resize-none ${
                isReadOnly ? 'bg-muted text-muted-foreground border-border' : ''
              }`}
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
          </div>
        </div>
      ))}
      
      {!isReadOnly && (
        <Button
          type="button"
          variant="outline"
          onClick={addMedication}
          className="w-full h-10 text-sm font-medium border-dashed border-border text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/10"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Medication
        </Button>
      )}
    </div>
  );
}; 