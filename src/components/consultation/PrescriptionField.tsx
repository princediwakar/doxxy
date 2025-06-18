import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CharacterCounter } from './CharacterCounter';
import { CHARACTER_LIMITS } from './constants';
import { PrescriptionMedication, PrescriptionFieldProps } from './types';

export const PrescriptionField = ({ value = [], onChange }: PrescriptionFieldProps) => {
  const addMedication = () => {
    onChange([...value, {
      name: '',
      dosage: '',
      route: 'Oral',
      frequency: 'BD',
      duration: '',
      instructions: '',
      eye: 'N/A',
    }]);
  };

  const removeMedication = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: string, val: string) => {
    // Apply character limits
    const limits = CHARACTER_LIMITS.prescription;
    let maxLength = 1000; // default
    
    if (field === 'name') maxLength = limits.name;
    else if (field === 'dosage') maxLength = limits.dosage;
    else if (field === 'duration') maxLength = limits.duration;
    else if (field === 'instructions') maxLength = limits.instructions;
    
    if (val.length <= maxLength) {
      const updated = [...value];
      updated[index] = { ...updated[index], [field]: val };
      onChange(updated);
    }
  };

  return (
    <div className="space-y-6">
      {value.map((medication, index) => (
        <Card key={index} className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md">
          <div className="flex justify-between items-start mb-6 p-4 pb-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>
              <h4 className="font-semibold text-blue-900 text-lg">Medication {index + 1}</h4>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeMedication(index)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="p-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-medium text-gray-700">Medication Name *</Label>
                  <CharacterCounter 
                    current={medication.name?.length || 0} 
                    max={CHARACTER_LIMITS.prescription.name} 
                  />
                </div>
                <Input
                  value={medication.name || ''}
                  onChange={(e) => updateMedication(index, 'name', e.target.value)}
                  placeholder="Enter medication name"
                  required
                  className="border-2 focus:border-blue-500 focus:ring-blue-500/20"
                  maxLength={CHARACTER_LIMITS.prescription.name}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-medium text-gray-700">Dosage</Label>
                  <CharacterCounter 
                    current={medication.dosage?.length || 0} 
                    max={CHARACTER_LIMITS.prescription.dosage} 
                  />
                </div>
                <Input
                  value={medication.dosage || ''}
                  onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                  placeholder="e.g., 500mg"
                  className="border-2 focus:border-blue-500 focus:ring-blue-500/20"
                  maxLength={CHARACTER_LIMITS.prescription.dosage}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="font-medium text-gray-700">Route</Label>
                <Select
                  value={medication.route || 'Oral'}
                  onValueChange={(val) => updateMedication(index, 'route', val)}
                >
                  <SelectTrigger className="border-2 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Oral', 'Topical', 'IV', 'IM', 'Eye Drops', 'Subcutaneous', 'Inhaled'].map(route => (
                      <SelectItem key={route} value={route}>{route}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="font-medium text-gray-700">Frequency</Label>
                <Select
                  value={medication.frequency || 'BD'}
                  onValueChange={(val) => updateMedication(index, 'frequency', val)}
                >
                  <SelectTrigger className="border-2 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['OD', 'BD', 'TDS', 'QID', 'PRN', 'Q4H', 'Q6H', 'Q8H', 'Q12H'].map(freq => (
                      <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-medium text-gray-700">Duration</Label>
                  <CharacterCounter 
                    current={medication.duration?.length || 0} 
                    max={CHARACTER_LIMITS.prescription.duration} 
                  />
                </div>
                <Input
                  value={medication.duration || ''}
                  onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                  placeholder="e.g., 7 days"
                  className="border-2 focus:border-blue-500 focus:ring-blue-500/20"
                  maxLength={CHARACTER_LIMITS.prescription.duration}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="font-medium text-gray-700">Eye (if applicable)</Label>
                <Select
                  value={medication.eye || 'N/A'}
                  onValueChange={(val) => updateMedication(index, 'eye', val)}
                >
                  <SelectTrigger className="border-2 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Left', 'Right', 'Both', 'N/A'].map(eye => (
                      <SelectItem key={eye} value={eye}>{eye}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-medium text-gray-700">Instructions</Label>
                <CharacterCounter 
                  current={medication.instructions?.length || 0} 
                  max={CHARACTER_LIMITS.prescription.instructions} 
                />
              </div>
              <div className="relative">
                <Textarea
                  value={medication.instructions || ''}
                  onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                  placeholder="Special instructions for this medication"
                  className="border-2 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                  rows={3}
                  maxLength={CHARACTER_LIMITS.prescription.instructions}
                />
              </div>
            </div>
          </div>
        </Card>
      ))}
      
      <Button
        type="button"
        variant="outline"
        onClick={addMedication}
        className="w-full flex items-center gap-3 border-dashed border-2 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 py-6 text-base font-medium transition-all duration-200"
      >
        <Plus className="h-5 w-5" />
        Add New Medication
      </Button>
    </div>
  );
}; 