import { User, Calendar, Phone, Mail, History, Heart, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Patient, Prescription, Consultation, PrescriptionMedication } from './types';
import { Tables } from '@/integrations/supabase/types';

interface DepartmentInfo {
  clinic_departments?: {
    department_types?: {
      name?: string | null;
    } | null;
  } | null;
}

interface PatientSidebarProps {
  patient: Patient;
  appointment: Tables<'appointments'> | null;
  departmentInfo: DepartmentInfo | null;
  previousConsultations: Consultation[];
  recentPrescriptions: Prescription[];
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

export const PatientSidebar = ({
  patient,
  appointment,
  departmentInfo,
  previousConsultations,
  recentPrescriptions
}: PatientSidebarProps) => {
  return (
    <div className="sticky top-32 space-y-4">
      {/* Patient Information */}
      <Card className="bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-base">
            <User className="h-5 w-5 text-blue-600" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
              {patient?.name?.charAt(0)?.toUpperCase() || 'P'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{patient?.name || 'Unknown Patient'}</p>
              <p className="text-sm text-gray-600">
                {patient?.date_of_birth && `${calculateAge(patient.date_of_birth)} years`}
                {patient?.gender && ` • ${patient.gender}`}
              </p>
            </div>
          </div>
          
          {patient?.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              {patient.phone}
            </div>
          )}
          
          {patient?.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              {patient.email}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointment Details */}
      <Card className="bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-base">
            <Calendar className="h-5 w-5 text-green-600" />
            Today's Appointment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Time</span>
            <span className="text-sm font-medium">{appointment?.time || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Type</span>
            <Badge variant="outline" className="text-xs">{appointment?.type}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Department</span>
            <Badge variant="secondary" className="text-xs">
              {departmentInfo?.clinic_departments?.department_types?.name || 'General'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Medical History - Previous Consultations */}
      {previousConsultations && previousConsultations.length > 0 && (
        <Card className="bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-base">
              <History className="h-5 w-5 text-orange-600" />
              Medical History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
              Recent Consultations
            </div>
            {previousConsultations.slice(0, 3).map((consultation) => (
              <div key={consultation.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">
                      {consultation.created_at ? 
                        format(new Date(consultation.created_at), 'MMM d, yyyy') : 
                        'Unknown date'
                      }
                    </p>
                    {consultation.clinical_notes && (
                      <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                        {typeof consultation.clinical_notes === 'string' && consultation.clinical_notes.length > 60 ? 
                          `${consultation.clinical_notes.substring(0, 60)}...` : 
                          String(consultation.clinical_notes)
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Prescriptions */}
      {recentPrescriptions && recentPrescriptions.length > 0 && (
        <Card className="bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-base">
              <Heart className="h-5 w-5 text-red-600" />
              Recent Medications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPrescriptions.slice(0, 3).map((prescription) => (
              <div key={prescription.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900">
                    {(() => {
                      if (Array.isArray(prescription.medications) && prescription.medications[0] && typeof prescription.medications[0] === 'object') {
                        const med = prescription.medications[0] as unknown as PrescriptionMedication;
                        return med.name || 'Medication';
                      }
                      return 'Medication';
                    })()}
                  </p>
                  <p className="text-xs text-gray-600">
                    {(() => {
                      if (Array.isArray(prescription.medications) && prescription.medications[0] && typeof prescription.medications[0] === 'object') {
                        const med = prescription.medications[0] as unknown as PrescriptionMedication;
                        const dosage = med.dosage || 'N/A';
                        const frequency = med.frequency || 'N/A';
                        const duration = med.duration ? ` • ${med.duration}` : '';
                        return `${dosage} • ${frequency}${duration}`;
                      }
                      return 'N/A • N/A';
                    })()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {prescription.created_at ? format(new Date(prescription.created_at), 'MMM d, yyyy') : 'Unknown date'}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Important Alerts */}
      <Card className="bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-base">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            Important Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Appointment Notes */}
          {appointment?.notes && (
            <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
              <div className="text-xs text-purple-600 uppercase tracking-wide font-medium mb-1">
                Appointment Notes
              </div>
              <p className="text-sm text-purple-800">
                {appointment.notes}
              </p>
            </div>
          )}
          
          <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            <p className="text-sm text-yellow-800">
              Review patient's medical history for ongoing treatments
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <p className="text-sm text-blue-800">
              Files and reports can be attached during appointment creation
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 