import { ArrowLeft, Save, Printer, Eye, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Patient } from './types';

interface AutoSaveMutation {
  isPending: boolean;
}

interface ConsultationHeaderProps {
  patient: Patient | null;
  isConsultationCompleted: boolean;
  autoSaveMutation: AutoSaveMutation;
  onBack: () => void;
  onSave: () => void;
  onPrint: () => void;
  onPreview: () => void;
  onComplete: () => void;
}

export const ConsultationHeader = ({
  patient,
  isConsultationCompleted,
  autoSaveMutation,
  onBack,
  onSave,
  onPrint,
  onPreview,
  onComplete
}: ConsultationHeaderProps) => {
  return (
    <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center gap-2"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Appointments
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Consultation
              </h1>
              <p className="text-sm text-gray-600">
                {patient?.name} • {format(new Date(), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={autoSaveMutation.isPending ? "secondary" : "outline"} className="text-xs">
              {autoSaveMutation.isPending ? "Saving..." : "Saved"}
            </Badge>
            <Button
              onClick={onSave}
              disabled={autoSaveMutation.isPending || isConsultationCompleted}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
            <Button
              onClick={onPrint}
              variant="outline"
              disabled={isConsultationCompleted}
              size="sm"
              className="flex items-center gap-1"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              onClick={onPreview}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button
              onClick={onComplete}
              disabled={autoSaveMutation.isPending || isConsultationCompleted}
              size="sm"
              className="flex items-center gap-1"
            >
              <CheckCircle className="h-4 w-4" />
              {isConsultationCompleted ? "Completed" : "Complete"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 