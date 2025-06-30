import { ArrowLeft, Save, Printer, Eye, CheckCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { Patient } from './types';
import { getAge } from '@/lib/utils';

interface AutoSaveMutation {
  isPending: boolean;
}

interface MandatoryFieldsStatus {
  isValid: boolean;
  errors: string[];
  missingFields: number;
  validationMessage: string;
}

interface ConsultationHeaderProps {
  patient: Patient | null;
  isConsultationCompleted: boolean;
  autoSaveMutation: AutoSaveMutation;
  mandatoryFieldsStatus: MandatoryFieldsStatus;
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
  mandatoryFieldsStatus,
  onBack,
  onSave,
  onPrint,
  onPreview,
  onComplete
}: ConsultationHeaderProps) => {
  const canComplete = mandatoryFieldsStatus.isValid && !autoSaveMutation.isPending && !isConsultationCompleted;

  const getCompleteButtonTooltip = () => {
    if (isConsultationCompleted) return "Consultation already completed";
    if (autoSaveMutation.isPending) return "Please wait for auto-save to complete";
    if (!mandatoryFieldsStatus.isValid) {
      return `Missing ${mandatoryFieldsStatus.missingFields} required field${mandatoryFieldsStatus.missingFields > 1 ? 's' : ''}: ${mandatoryFieldsStatus.errors.join(', ')}`;
    }
    return "Complete consultation";
  };

  return (
    <TooltipProvider>
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
                Back
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-gray-900">
                    {patient?.name}
                  </h1>
                  {isConsultationCompleted && (
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {patient?.date_of_birth && `${getAge(patient.date_of_birth, true)}`}
                  {patient?.gender && ` • ${patient.gender}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isConsultationCompleted ? (
                <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                  <Lock className="h-3 w-3 mr-1" />
                  Read Only
                </Badge>
              ) : (
                <Badge variant={autoSaveMutation.isPending ? "secondary" : "outline"} className="text-xs">
                  {autoSaveMutation.isPending ? "Saving..." : "Saved"}
                </Badge>
              )}

              <Button
                onClick={onSave}
                disabled={autoSaveMutation.isPending || isConsultationCompleted}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                title={isConsultationCompleted ? "Cannot save completed consultation" : "Save consultation"}
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
              {/* 
              <Button
                onClick={onPrint}
                variant="outline"
                disabled={isConsultationCompleted}
                size="sm"
                className="flex items-center gap-1"
                title={isConsultationCompleted ? "Cannot print completed consultation" : "Print consultation"}
              >
                <Printer className="h-4 w-4" />
                Print
              </Button> */}
              <Button
                onClick={onPreview}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onComplete}
                    disabled={!canComplete}
                    size="sm"
                    className={`flex items-center gap-1 transition-all ${canComplete
                        ? 'bg-green-600 hover:bg-green-700 text-secondary '
                        : 'opacity-60'
                      }`}
                    variant={canComplete ? "default" : "secondary"}
                  >
                    <CheckCircle className="h-4 w-4" />
                    {isConsultationCompleted ? "Completed" : "Complete"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">{getCompleteButtonTooltip()}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}; 