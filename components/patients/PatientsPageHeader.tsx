import { Button } from '@/components/ui/button';
import { Download, Plus, User } from 'lucide-react';

interface PatientsPageHeaderProps {
  onNewPatient: () => void;
  onExport: () => void;
  isPatientSelected: boolean;
}

export const PatientsPageHeader = ({ onNewPatient, onExport, isPatientSelected }: PatientsPageHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
          <User className="w-5 h-5 " />
        </div>
        <div>
          <h1 className="text-2xl font-bold ">Patient Records</h1>
          <p className="text-muted-foreground">Comprehensive patient medical history and records</p>
        </div>
      </div>
      <div className="flex space-x-2 shrink-0">
        <Button
          onClick={onExport}
          disabled={!isPatientSelected}
          variant="outline"
        >
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
        <Button
          onClick={onNewPatient}
          className="bg-primary text-primary-foreground hover:bg-primary/90 "
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </div>
    </div>
  );
};

