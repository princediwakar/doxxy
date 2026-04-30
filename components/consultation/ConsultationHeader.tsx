import { ArrowLeft, Save, Eye, CheckCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PatientWithClinic, AutoSaveMutation, MandatoryFieldsStatus } from '@/types/consultation';

interface ConsultationHeaderProps {
  patient: PatientWithClinic | null;
  isConsultationCompleted: boolean;
  canEditConsultation: boolean;
  autoSaveMutation: AutoSaveMutation;
  mandatoryFieldsStatus: MandatoryFieldsStatus;
  onBack: () => void;
  onSave: () => void;
  onPreview: () => void;
  onComplete: () => void;
  onPrint?: () => void;
}

export const ConsultationHeader = ({
  patient,
  isConsultationCompleted,
  canEditConsultation,
  autoSaveMutation,
  mandatoryFieldsStatus,
  onBack,
  onSave,
  onPreview,
  onComplete
}: ConsultationHeaderProps) => {
  const canComplete = mandatoryFieldsStatus.allCompleted && !autoSaveMutation.isPending && !isConsultationCompleted;
  const canEditCompleted = isConsultationCompleted && canEditConsultation;



  return (
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-4">
            {/* Left: Back + Patient info */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center gap-1 sm:gap-2 shrink-0"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                    {patient?.name}
                  </h1>
                  {isConsultationCompleted && (
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 shrink-0">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                  {isConsultationCompleted && !canEditConsultation && (
                    <Badge variant="outline" className="text-xs border-green-200 text-green-700 shrink-0">
                      <Lock className="h-3 w-3 mr-1" />
                      Read Only
                    </Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  {patient?.age && `${patient.age} yrs`}
                  {patient?.gender && ` • ${patient.gender}`}
                </p>
              </div>
            </div>

            {/* Right: Status + Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {!isConsultationCompleted && canEditConsultation && (
                <Badge variant={autoSaveMutation.isPending ? "secondary" : "outline"} className="text-xs hidden sm:inline-flex">
                  {autoSaveMutation.isPending ? "Saving..." : "Saved"}
                </Badge>
              )}

              <Button
                onClick={onSave}
                disabled={autoSaveMutation.isPending || !canEditConsultation}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                title={!canEditConsultation ? "Cannot save consultation" : "Save consultation"}
              >
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Save</span>
              </Button>
              <Button
                onClick={onPreview}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                <span className="">Preview</span>
              </Button>
              <Button
                onClick={onComplete}
                disabled={!canComplete && !canEditCompleted}
                size="sm"
                className={`flex items-center gap-1 transition-all shrink-0 ${(canComplete || canEditCompleted)
                    ? 'bg-blue-600 hover:bg-blue-700 text-secondary '
                    : 'opacity-60'
                  }`}
                variant={(canComplete || canEditCompleted) ? "default" : "secondary"}
              >
                <span className="hidden sm:inline">End consultation</span>
                <span className="sm:hidden">End consultation</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
  );
}; 