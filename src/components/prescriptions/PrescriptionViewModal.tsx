import React from 'react';
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, parseISO } from "date-fns";
import { 
  Pill, 
  Calendar,
  User,
  FileText,
  Clock,
  Stethoscope,
  Building2,
  Printer,
  Download,
  Eye,
  Activity
} from "lucide-react";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tables } from "@/integrations/supabase/types";
import { toast } from 'sonner';
import { getAge } from '@/lib/utils';

const supabase = getSupabase();

// Define proper types
type Prescription = Tables<"prescriptions">;

interface Medication {
  name?: string;
  dosage?: string;
  route?: string;
  frequency?: string;
  duration?: string;
  eye?: string;
  instructions?: string;
}

interface FormattedMedication {
  medication: string;
  instructions: string | null;
}

interface PrescriptionViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescription: Prescription | null;
}

export function PrescriptionViewModal({ open, onOpenChange, prescription }: PrescriptionViewModalProps) {
  const { activeClinic } = useAuth();

  // Fetch enhanced prescription data with patient and doctor details
  const { data: enhancedPrescription, isLoading } = useQuery({
    queryKey: ['prescriptionDetails', prescription?.id],
    queryFn: async () => {
      if (!prescription?.id) return null;
      
      // Fetch prescription with patient and doctor details
      const { data: prescriptionData, error: prescriptionError } = await supabase
        .from('prescriptions')
        .select(`
          *,
          patients!inner(id, name, gender, date_of_birth, phone, email, medical_id),
          doctors!inner(id, name, user_id)
        `)
        .eq('id', prescription.id)
        .single();

      if (prescriptionError) throw prescriptionError;

      // Get doctor's profile information
      const { data: doctorProfile } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', prescriptionData.doctors.user_id)
        .single();

      // Get doctor's department information
      const { data: doctorDepartment } = await supabase
        .from('clinic_members')
        .select(`
          clinic_departments(
            department_types(name)
          )
        `)
        .eq('user_id', prescriptionData.doctors.user_id)
        .eq('clinic_id', activeClinic?.clinic_id)
        .single();

      return {
        ...prescriptionData,
        doctor_profile: doctorProfile,
        doctor_department: doctorDepartment?.clinic_departments?.department_types?.name || 'General Medicine'
      };
    },
    enabled: open && !!prescription?.id && !!activeClinic?.clinic_id,
  });

  if (!prescription) return null;

  const formatMedications = (medications: unknown): FormattedMedication[] | string => {
    if (typeof medications === 'string') {
      return medications;
    } else if (Array.isArray(medications)) {
      return medications.map((med, index) => {
        if (typeof med === 'string') return { medication: med, instructions: null };
        
        const parts = [];
        if (med.name) parts.push(med.name);
        if (med.dosage) parts.push(med.dosage);
        if (med.route) parts.push(`(${med.route})`);
        if (med.frequency) parts.push(`- ${med.frequency}`);
        if (med.duration) parts.push(`for ${med.duration}`);
        if (med.eye && med.eye !== 'N/A') parts.push(`[${med.eye} eye]`);
        
        return {
          medication: parts.join(' '),
          instructions: med.instructions || null
        };
      });
    } else if (typeof medications === 'object' && medications !== null) {
      try {
        const medObj = medications as Medication;
        if (medObj.name) {
          const parts = [];
          if (medObj.name) parts.push(medObj.name);
          if (medObj.dosage) parts.push(medObj.dosage);
          if (medObj.route) parts.push(`(${medObj.route})`);
          if (medObj.frequency) parts.push(`- ${medObj.frequency}`);
          if (medObj.duration) parts.push(`for ${medObj.duration}`);
          if (medObj.eye && medObj.eye !== 'N/A') parts.push(`[${medObj.eye} eye]`);
          
          return [{
            medication: parts.join(' '),
            instructions: medObj.instructions || null
          }];
        }
        return [{ medication: 'Medication details available', instructions: null }];
      } catch {
        return [{ medication: 'Medication details available', instructions: null }];
      }
    }
    return [{ medication: 'No medication details available', instructions: null }];
  };

  const prescriptionData = enhancedPrescription || prescription;
  const patient = enhancedPrescription?.patients;
  const doctor = enhancedPrescription?.doctors;
  const doctorProfile = enhancedPrescription?.doctor_profile;
  const medications = formatMedications(prescriptionData.medications);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Pill className="h-5 w-5 text-primary" />
            <span>Prescription Details</span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh] pr-4">
          <div className="space-y-6">
            {/* Header Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Patient Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-foreground">
                    <User className="h-4 w-4" />
                    <span>Patient Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {isLoading ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                    </div>
                  ) : patient ? (
                    <>
                      <div>
                        <span className="font-semibold text-lg">{patient.name}</span>
                        {patient.medical_id && (
                          <span className="ml-2 text-sm text-muted-foreground">#{patient.medical_id}</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {patient.gender} • {patient.date_of_birth ? `${getAge(patient.date_of_birth, true)} old` : 'Age unknown'}
                      </div>
                      {patient.phone && (
                        <div className="text-sm">{patient.phone}</div>
                      )}
                    </>
                  ) : (
                    <div>
                      <span className="font-semibold">{'Unknown Patient'}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Doctor Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-foreground">
                    <Stethoscope className="h-4 w-4" />
                    <span>Prescribed By</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {isLoading ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                    </div>
                  ) : (
                    <>
                      <div className="font-semibold">
                       Dr. {doctorProfile?.name || doctor?.name || ''}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {enhancedPrescription?.doctor_department || 'General Medicine'}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Prescribed on {format(parseISO(prescriptionData.created_at), 'PPP')}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Medications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-foreground">
                  <Pill className="h-4 w-4" />
                  <span>Medications</span>
                  <Badge variant="secondary">{Array.isArray(medications) ? medications.length : 1} item(s)</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(medications) ? medications.map((med, index) => (
                    <div key={index} className="p-4 bg-muted/30 rounded-lg">
                      <div className="font-medium text-foreground mb-2">
                        Medication {index + 1}
                      </div>
                      <div className="text-sm font-mono bg-background p-3 rounded border">
                        {typeof med === 'string' ? med : med.medication}
                      </div>
                      {typeof med === 'object' && med.instructions && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium text-muted-foreground">Instructions:</span>
                          <p className="mt-1 text-muted-foreground">{med.instructions}</p>
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="text-sm font-mono">{medications}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Instructions */}
              {'instructions' in prescriptionData && prescriptionData.instructions && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>General Instructions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{String(prescriptionData.instructions)}</p>
                  </CardContent>
                </Card>
              )}

              {/* Follow-up */}
              {'follow_up_date' in prescriptionData && prescriptionData.follow_up_date && (
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
                      <span className="font-medium">{format(parseISO(String(prescriptionData.follow_up_date)), 'PPP')}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Clinic Information */}
            <Card className="bg-muted/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>Prescription Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Date Issued:</span>
                    <p>{format(parseISO(prescriptionData.created_at), 'PPP')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Time:</span>
                    <p>{format(parseISO(prescriptionData.created_at), 'p')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 