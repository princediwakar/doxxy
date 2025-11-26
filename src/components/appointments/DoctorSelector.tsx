import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDoctors } from '@/hooks/useDoctors';
import { User } from 'lucide-react';

interface DoctorSelectorProps {
  selectedDoctorId: string | null;
  onDoctorChange: (doctorId: string | null) => void;
}

export const DoctorSelector: React.FC<DoctorSelectorProps> = ({
  selectedDoctorId,
  onDoctorChange,
}) => {
  const { doctors, isLoading } = useDoctors();

  if (isLoading) {
    return (
      <div className="w-48">
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Loading doctors..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <User className="h-4 w-4 text-muted-foreground" />
      <Select
        value={selectedDoctorId || 'all'}
        onValueChange={(value) => onDoctorChange(value === 'all' ? null : value)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select Doctor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Doctors</SelectItem>
          {doctors.map((doctor) => (
            <SelectItem key={doctor.id} value={doctor.id}>
              {doctor.name}
              {doctor.primary_specialization && ` - ${doctor.primary_specialization}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};