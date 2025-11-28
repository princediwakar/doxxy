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
                  {patient?.age && `${patient.age} yrs`}
                  {patient?.gender && ` • ${patient.gender}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isConsultationCompleted && !canEditConsultation ? (
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
                disabled={autoSaveMutation.isPending || !canEditConsultation}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                title={!canEditConsultation ? "Cannot save consultation" : "Save consultation"}
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
              <Button
                    onClick={onComplete}
                    disabled={!canComplete && !canEditCompleted}
                    size="sm"
                    className={`flex items-center gap-1 transition-all ${(canComplete || canEditCompleted)
                        ? 'bg-blue-600 hover:bg-blue-700 text-secondary '
                        : 'opacity-60'
                      }`}
                    variant={(canComplete || canEditCompleted) ? "default" : "secondary"}
                  >
                    End consultation
                  </Button>
            </div>
          </div>
        </div>
      </div>
  );
}; 