import { Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ConsultationFormValues, Patient, PrescriptionMedication } from './types';
import { UseFormReturn, FieldPath } from 'react-hook-form';
import { specialtyFieldSections } from '@/lib/consultationNotesSchemas';
import { Tables } from '@/integrations/supabase/types';
import { FieldSection } from '@/lib/consultationNotesSchemas';

interface ConsultationPreviewModalProps {
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  form: UseFormReturn<ConsultationFormValues>;
  patient: Patient;
  appointment: Tables<'appointments'> | null;
  specialtySections: FieldSection[];
}

const calculateAge = (dateOfBirth: string) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const ConsultationPreviewModal = ({
  showPreview,
  setShowPreview,
  form,
  patient,
  appointment,
  specialtySections
}: ConsultationPreviewModalProps) => {
  return (
    <Dialog open={showPreview} onOpenChange={setShowPreview}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Consultation Preview
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Patient Info */}
          <div className="bg-primary/5 p-4 rounded-lg">
            <h3 className="font-medium text-primary mb-2">Patient Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span> {patient?.name || 'N/A'}
              </div>
              <div>
                <span className="text-muted-foreground">Age:</span> {patient?.date_of_birth ? calculateAge(patient.date_of_birth) : 'N/A'}
              </div>
              <div>
                <span className="text-muted-foreground">Gender:</span> {patient?.gender || 'N/A'}
              </div>
              <div>
                <span className="text-muted-foreground">Appointment:</span> {appointment?.date ? format(new Date(appointment.date), 'MMM d, yyyy h:mm a') : 'N/A'}
              </div>
            </div>
          </div>
          
          {/* Consultation Content */}
          {specialtySections.map((section, sectionIndex) => {
            const specialtyData = form.watch('specialty_data');

            const sectionHasContent = section.fields.some((field) => {
              const value = (specialtyData as Record<string, unknown>)[field.name];
              return value && (typeof value === 'string'
                ? value.length > 0
                : Array.isArray(value)
                ? value.length > 0
                : !!value);
            });

            if (!sectionHasContent) return null;

            return (
              <div key={sectionIndex} className="border rounded-lg p-4">
                <h3 className="font-medium text-lg mb-4 text-primary">{section.title}</h3>
                <div className="space-y-4">
                  {section.fields.map((field, fieldIndex) => {
                    const value = (specialtyData as Record<string, unknown>)[field.name];

                    if (
                      !value ||
                      (typeof value === 'string' && value.length === 0) ||
                      (Array.isArray(value) && value.length === 0)
                    )
                      return null;
                    
                    if (field.type === 'prescription') {
                      const prescriptions = form.watch('specialty_data.prescriptions') || [];
                      if (prescriptions.length === 0) return null;
                      
                      return (
                        <div key={fieldIndex}>
                          <h4 className="font-medium mb-2">{field.label}</h4>
                          <div className="space-y-2">
                            {prescriptions.map((prescription: PrescriptionMedication, index: number) => (
                              <div key={index} className="bg-muted/50 p-3 rounded">
                                <div className="font-medium">{prescription.name || 'Unnamed medication'}</div>
                                <div className="text-sm text-muted-foreground">
                                  {prescription.dosage} • {prescription.frequency}
                                  {prescription.duration && ` • ${prescription.duration}`}
                                </div>
                                {prescription.instructions && (
                                  <div className="text-sm mt-1">{prescription.instructions}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div key={fieldIndex}>
                        <h4 className="font-medium mb-2">{field.label}</h4>
                        <div className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded">
                          {typeof value === 'string' ? value : JSON.stringify(value)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 