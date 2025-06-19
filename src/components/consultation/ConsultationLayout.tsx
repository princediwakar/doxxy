import React from 'react';
import { format } from 'date-fns';
import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Globe,
  Stethoscope,
  FileText,
  Building2,
  Award,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getAge } from '@/lib/utils';
import { ConsultationFormValues, Patient, PrescriptionMedication } from './types';
import { Tables } from '@/integrations/supabase/types';
import { specialtyFieldSections, FieldSection } from '@/lib/consultationNotesSchemas';

// Types
interface ClinicInfo {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
}

interface DoctorInfo {
  name?: string;
  specialization?: string;
  qualification?: string;
  registration_number?: string;
  phone?: string;
  email?: string;
}

interface ConsultationLayoutProps {
  patient: Patient;
  appointment: Tables<'appointments'> | null;
  clinicInfo: ClinicInfo | null;
  doctorInfo: DoctorInfo | null;
  consultationData?: ConsultationFormValues['specialty_data'];
  specialtySections?: FieldSection[];
  departmentType?: string;
  showPrintStyles?: boolean;
  className?: string;
}

export const ConsultationLayout: React.FC<ConsultationLayoutProps> = ({
  patient,
  appointment,
  clinicInfo,
  doctorInfo,
  consultationData = {},
  specialtySections,
  departmentType = 'General',
  showPrintStyles = false,
  className = ''
}) => {
  // Get field sections for the department
  const sections = specialtySections || specialtyFieldSections[departmentType] || specialtyFieldSections.General;

  // Helper function to render field value
  const renderFieldValue = (fieldName: string, value: unknown) => {
    if (!value) return null;

    if (fieldName === 'prescriptions' && Array.isArray(value)) {
      const validPrescriptions = value.filter((med: PrescriptionMedication) => 
        med.name && med.name.trim().length > 0
      );
      
      if (validPrescriptions.length === 0) return null;

      return (
        <div className="space-y-3">
          {validPrescriptions.map((prescription: PrescriptionMedication, index: number) => (
            <div key={index} className="prescription-item border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="prescription-name font-semibold text-gray-900 mb-2">
                {prescription.name}
              </div>
              <div className="prescription-details grid grid-cols-2 gap-2 text-sm text-gray-600">
                {prescription.dosage && (
                  <div><span className="font-medium">Dosage:</span> {prescription.dosage}</div>
                )}
                {prescription.frequency && (
                  <div><span className="font-medium">Frequency:</span> {prescription.frequency}</div>
                )}
                {prescription.duration && (
                  <div><span className="font-medium">Duration:</span> {prescription.duration}</div>
                )}
                {prescription.route && (
                  <div><span className="font-medium">Route:</span> {prescription.route}</div>
                )}
              </div>
              {prescription.instructions && (
                <div className="prescription-instructions mt-2 text-sm text-gray-700">
                  <span className="font-medium">Instructions:</span> {prescription.instructions}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === 'string') {
      return <div className="field-value whitespace-pre-wrap text-gray-700 leading-relaxed">{value}</div>;
    }

    return <div className="field-value text-gray-700">{JSON.stringify(value)}</div>;
  };

  const printStyles = showPrintStyles ? `
    <style>
      @media print {
        @page { margin: 10mm; size: A4; }
        body { 
          font-size: 12px !important; 
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .no-print { display: none !important; }
        .page-break { page-break-before: always; }
        .avoid-break { page-break-inside: avoid; }
        
        /* Preserve all Tailwind styles for print - no overrides */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        /* Force layout consistency for print */
        .max-w-4xl { 
          max-width: 100% !important; 
          margin: 0 !important;
          padding: 0 !important;
          min-height: 100vh !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .mx-auto { margin-left: 0 !important; margin-right: 0 !important; }
        
        /* Ensure footer positioning */
        .footer { 
          margin-top: auto !important;
          position: relative !important;
        }
        
        /* Force two-column layouts to work in print */
        .info-cards { 
          display: grid !important; 
          grid-template-columns: 1fr 1fr !important; 
          gap: 1rem !important; 
        }
        
        /* Force letterhead grid to stay two-column */
        .letterhead .grid { 
          display: grid !important; 
          grid-template-columns: 1fr 1fr !important; 
          gap: 1rem !important; 
        }
        
        /* Reduce letterhead padding for print */
        .letterhead { 
          padding: 1rem !important; 
          margin-bottom: 1rem !important; 
        }
        
        /* Ensure main content takes available space */
        .flex-1 { 
          flex: 1 !important; 
        }
      }
    </style>
  ` : '';

  return (
    <div className={`max-w-4xl mx-auto bg-white min-h-screen flex flex-col ${className}`}>
      {showPrintStyles && <div dangerouslySetInnerHTML={{ __html: printStyles }} />}
      
      {/* Enhanced Professional Clinic Letterhead */}
      <div className="letterhead relative border-b-2 border-blue-600 bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4 mb-4">
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-green-500 to-blue-600"></div>
        
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {/* Left Column - Clinic Information */}
          <div className="clinic-info space-y-4">
            <div className="space-y-2">
              <h1 className="clinic-name text-xl font-bold text-blue-600 tracking-tight leading-tight">
                {clinicInfo?.name || 'MEDICAL CLINIC'}
              </h1>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-green-500 rounded-full"></div>
            </div>
            
            {/* Complete Clinic Contact Details */}
            <div className="clinic-details space-y-2 text-xs text-gray-700">
              {clinicInfo?.address && (
                <div className="contact-row flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <div className="font-medium leading-relaxed">{clinicInfo.address}</div>
                </div>
              )}
              
              {clinicInfo?.phone && (
                <div className="contact-row flex items-center gap-3">
                  <Phone className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="font-medium">{clinicInfo.phone}</span>
                </div>
              )}
              
              {clinicInfo?.email && (
                <div className="contact-row flex items-center gap-3">
                  <Mail className="h-4 w-4 text-blue-500 shrink-0" />
                  <span className="font-medium">{clinicInfo.email}</span>
                </div>
              )}
              
              {clinicInfo?.website && (
                <div className="contact-row flex items-center gap-3">
                  <Globe className="h-4 w-4 text-purple-500 shrink-0" />
                  <span className="font-medium">{clinicInfo.website}</span>
                </div>
              )}
              
              {/* Additional clinic info if available */}
              {(clinicInfo as Record<string, unknown>)?.fax && typeof (clinicInfo as Record<string, unknown>).fax === 'string' && (
                <div className="contact-row flex items-center gap-3">
                  <Phone className="h-4 w-4 text-orange-500 shrink-0" />
                  <span className="font-medium">Fax: {(clinicInfo as Record<string, unknown>).fax as string}</span>
                </div>
              )}
              
              {(clinicInfo as Record<string, unknown>)?.registration && typeof (clinicInfo as Record<string, unknown>).registration === 'string' && (
                <div className="contact-row flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-gray-500 shrink-0" />
                  <span className="font-medium">Registration: {(clinicInfo as Record<string, unknown>).registration as string}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Doctor Information */}
          <div className="doctor-info space-y-4 text-right lg:text-right">
            <div className="space-y-2">
              <div className="doctor-name text-lg font-bold text-green-600 leading-tight">
                {doctorInfo?.name || 'Doctor Name'}
              </div>
              
              {doctorInfo?.qualification && (
                <div className="doctor-qualification text-sm text-gray-600 font-medium">
                  {doctorInfo.qualification}
                </div>
              )}
              
              {doctorInfo?.specialization && (
                <div className="text-sm font-medium text-gray-700 flex items-center justify-end gap-2">
                  <span>{doctorInfo.specialization} Specialist</span>
                  <Award className="h-4 w-4 text-blue-500" />
                </div>
              )}
            </div>
            
            {/* Doctor Registration */}
            {doctorInfo?.registration_number && (
              <div className="registration-number text-xs text-gray-500 font-medium">
                Medical Registration No: {doctorInfo.registration_number}
              </div>
            )}
            
            {/* Doctor Contact (if available) */}
            <div className="doctor-contact space-y-1 text-xs text-gray-600">
              {doctorInfo?.phone && (
                <div className="flex items-center justify-end gap-2">
                  <span className="font-medium">{doctorInfo.phone}</span>
                  <Phone className="h-4 w-4 text-green-500" />
                </div>
              )}
              
              {doctorInfo?.email && (
                <div className="flex items-center justify-end gap-2">
                  <span className="font-medium">{doctorInfo.email}</span>
                  <Mail className="h-4 w-4 text-blue-500" />
                </div>
              )}
            </div>
          </div>
        </div>
        
        
      </div>

      {/* Patient & Appointment Information - Concise Layout */}
      <div className="info-cards grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        {/* Patient Information Card */}
        <Card className="info-card border border-gray-200 shadow-sm">
          <CardContent className="p-3">
            <div className="info-card-header flex items-center gap-2 mb-2 pb-1 border-b border-gray-200">
              <User className="h-3 w-3 text-blue-600" />
              <h3 className="info-card-title text-sm font-semibold text-gray-900">Patient</h3>
            </div>
            <div className="space-y-1 text-xs">
              <div className="info-row flex justify-between">
                <span className="info-label text-gray-600 font-medium">Name:</span>
                <span className="info-value text-gray-900 font-semibold">{patient?.name || 'N/A'}</span>
              </div>
              <div className="info-row flex justify-between">
                <span className="info-label text-gray-600 font-medium">Age/Gender:</span>
                <span className="info-value text-gray-900">
                  {patient?.date_of_birth ? getAge(patient.date_of_birth, true) : 'N/A'} / {patient?.gender || 'N/A'}
                </span>
              </div>
              {patient?.phone && (
                <div className="info-row flex justify-between">
                  <span className="info-label text-gray-600 font-medium">Phone:</span>
                  <span className="info-value text-gray-900">{patient.phone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Appointment Information Card */}
        <Card className="info-card border border-gray-200 shadow-sm">
          <CardContent className="p-3">
            <div className="info-card-header flex items-center gap-2 mb-2 pb-1 border-b border-gray-200">
              <Calendar className="h-3 w-3 text-green-600" />
              <h3 className="info-card-title text-sm font-semibold text-gray-900">Appointment</h3>
            </div>
            <div className="space-y-1 text-xs">
              <div className="info-row flex justify-between">
                <span className="info-label text-gray-600 font-medium">Date/Time:</span>
                <span className="info-value text-gray-900">
                  {appointment?.date ? format(new Date(appointment.date), 'MMM d, yyyy') : 'N/A'}
                  {appointment?.time && ` • ${appointment.time}`}
                </span>
              </div>

              <div className="info-row flex justify-between">
                <span className="info-label text-gray-600 font-medium">Department:</span>
                <span className="info-value text-gray-900">{departmentType}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

              {/* Main Content Area - Consultation Notes */}
        <div className="flex-1">
          {/* Consultation Notes - Natural Doctor's Format */}
          <div className="consultation-notes">
            
            
            <div className="notes-content space-y-2 text-sm leading-relaxed text-gray-900">
              {sections.map((section, sectionIndex) => {
                // Get all fields with content for this section
                const fieldsWithContent = section.fields.filter((field: { name: string }) => {
                  const value = consultationData[field.name];
                  return value && (
                    typeof value === 'string' ? value.trim().length > 0 :
                    Array.isArray(value) ? value.length > 0 : !!value
                  );
                });

                if (fieldsWithContent.length === 0) return null;

                return (
                  <div key={sectionIndex} className="section-notes">
                    {fieldsWithContent.map((field: { name: string; label: string }, fieldIndex: number) => {
                      const value = consultationData[field.name];
                      
                      return (
                        <div key={fieldIndex} className="note-line mb-1">
                          <span className="field-label font-medium text-gray-700">{field.label}: </span>
                          <span className="field-content text-gray-900">
                            {field.name === 'prescriptions' && Array.isArray(value) ? (
                              <div className="prescriptions-inline">
                                {value.filter((med: PrescriptionMedication) => med.name && med.name.trim().length > 0)
                                  .map((prescription: PrescriptionMedication, index: number) => (
                                    <span key={index} className="prescription-item">
                                      {index > 0 && ', '}
                                      {prescription.name}
                                      {prescription.dosage && ` ${prescription.dosage}`}
                                      {prescription.frequency && ` ${prescription.frequency}`}
                                      {prescription.duration && ` for ${prescription.duration}`}
                                      {prescription.instructions && ` (${prescription.instructions})`}
                                    </span>
                                  ))}
                              </div>
                            ) : (
                              typeof value === 'string' ? value : JSON.stringify(value)
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Professional Footer with Doctor Signature - Fixed at Bottom */}
        <div className="footer mt-auto pt-4 border-t border-gray-200">
          <div className="flex justify-end">
            <div className="text-right space-y-2 max-w-sm">
              <div className="signature-line "></div>
              <div className="signature-details space-y-1">
                <div className="doctor-signature text-sm font-bold text-gray-900">
                  {doctorInfo?.name || 'Doctor Name'}
                </div>
                <div className="text-xs text-gray-600">
                  {doctorInfo?.qualification}
                </div>
                {doctorInfo?.specialization && (
                  <div className="text-xs text-gray-600">
                    {doctorInfo.specialization} Specialist
                  </div>
                )}
                {doctorInfo?.registration_number && (
                  <div className="text-xs text-gray-500">
                    Reg. No: {doctorInfo.registration_number}
                  </div>
                )}
                <div className="text-xs text-gray-600 mt-2">
                  Date: {format(new Date(), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}; 