import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format, parseISO } from "date-fns";
import { 
  Pill, 
  Calendar,
  User,
  FileText,
  Clock
} from "lucide-react";

interface PrescriptionViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescription: any | null;
}

export function PrescriptionViewModal({ open, onOpenChange, prescription }: PrescriptionViewModalProps) {
  if (!prescription) return null;

  const formatMedications = (medications: any) => {
    if (typeof medications === 'string') {
      return medications;
    } else if (typeof medications === 'object' && medications !== null) {
      try {
        return JSON.stringify(medications, null, 2);
      } catch {
        return 'Medication details available';
      }
    }
    return 'No medication details available';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Pill className="h-5 w-5" />
            <span>Prescription Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold">
                      {format(parseISO(prescription.created_at), 'PPP')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Prescribed by {prescription.doctor_name || 'Unknown Doctor'}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Prescription</Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Pill className="h-4 w-4" />
                <span>Medications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 p-4 rounded-md">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {formatMedications(prescription.medications)}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          {prescription.instructions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Instructions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{prescription.instructions}</p>
              </CardContent>
            </Card>
          )}

          {/* Follow-up Date */}
          {prescription.follow_up_date && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Follow-up</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(parseISO(prescription.follow_up_date), 'PPP')}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Prescription Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Prescription ID:</span>
                  <p className="font-mono">{prescription.id}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Date Issued:</span>
                  <p>{format(parseISO(prescription.created_at), 'PPP')}</p>
                </div>
                {prescription.medical_record_id && (
                  <div>
                    <span className="font-medium text-muted-foreground">Medical Record ID:</span>
                    <p className="font-mono">{prescription.medical_record_id}</p>
                  </div>
                )}
                {prescription.consultation_id && (
                  <div>
                    <span className="font-medium text-muted-foreground">Related Consultation:</span>
                    <p className="font-mono">{prescription.consultation_id}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
} 