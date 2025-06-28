import React from 'react';
import { format } from 'date-fns';
import { formatTimeIST } from '@/lib/utils';
import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Globe,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
  // Enhanced medical credentials
  medical_registration_number?: string;
  medical_qualifications?: string;
  medical_specializations?: string;
  years_of_experience?: number;
  medical_council?: string;
  consultation_fee?: number;
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
        <div className="prescription-list mt-2">
          <div className="prescription-table">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-1 px-2 bg-gray-50">Medicine</th>
                  <th className="text-left py-1 px-2 bg-gray-50">Dosage</th>
                  <th className="text-left py-1 px-2 bg-gray-50">Frequency</th>
                  <th className="text-left py-1 px-2 bg-gray-50">Duration</th>
                  <th className="text-left py-1 px-2 bg-gray-50">Instructions</th>
                </tr>
              </thead>
              <tbody>
                {validPrescriptions.map((medication: PrescriptionMedication, index: number) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-1 px-2 font-medium">{medication.name}</td>
                    <td className="py-1 px-2">{medication.dosage || '-'}</td>
                    <td className="py-1 px-2">{medication.frequency || '-'}</td>
                    <td className="py-1 px-2">{medication.duration || '-'}</td>
                    <td className="py-1 px-2">{medication.instructions || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
        </div>
      );
    }

    if (typeof value === 'string') {
      // Handle multi-line text
      const lines = value.split('\n').filter(line => line.trim());
      if (lines.length <= 1) {
        return <span className="text-gray-700">{value}</span>;
      }
      return (
        <div className="text-gray-700">
          {lines.map((line, index) => (
            <div key={index} className="mb-1">{line}</div>
          ))}
        </div>
      );
    }

    return <span className="text-gray-700">{String(value)}</span>;
  };

  const printStyles = showPrintStyles ? `
    <style>
      @media print {
        @page { 
          margin: 10mm; 
          size: A4; 
        }
        
        body { 
          font-size: 12px !important; 
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        /* Core print styles */
        .no-print { display: none !important; }
        .page-break { page-break-before: always; }
        .avoid-break { page-break-inside: avoid; }
        
        /* Preserve all Tailwind styles for print */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        /* Container styles */
        .max-w-4xl { 
          max-width: 100% !important; 
          margin: 0 !important;
          padding: 0 !important;
        }
        
        /* Letterhead styles */
        .letterhead { 
          padding: 1rem !important; 
          margin-bottom: 1rem !important;
          page-break-inside: avoid !important;
        }
        
        .letterhead .grid { 
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 1rem !important;
          width: 100% !important;
        }
        
        /* Info cards styles */
        .info-cards {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 1rem !important;
          margin-bottom: 1rem !important;
          page-break-inside: avoid !important;
        }
        
        /* Card content alignment */
        .grid-cols-\\[120px\\,1fr\\] {
          display: grid !important;
          grid-template-columns: 120px 1fr !important;
          gap: 0.5rem !important;
        }
        
        /* Main content styles */
        .consultation-content {
          page-break-before: auto !important;
        }
        
        .section-notes {
          page-break-inside: avoid !important;
          margin-bottom: 1rem !important;
        }
        
        /* Field group styles */
        .field-group {
          page-break-inside: avoid !important;
          margin-bottom: 0.5rem !important;
        }
        
        /* Table styles for prescriptions */
        table {
          width: 100% !important;
          border-collapse: collapse !important;
          page-break-inside: avoid !important;
        }
        
        th, td {
          padding: 4px 8px !important;
          text-align: left !important;
          border-bottom: 1px solid #e5e7eb !important;
        }
        
        th {
          background-color: #f9fafb !important;
          font-weight: 600 !important;
        }

        /* Remove shadows from card components */
        .shadow-sm, .shadow, .shadow-md, .shadow-lg { box-shadow: none !important; }
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
        
        {/* Two Column Layout - Fixed width columns */}
        <div className="grid grid-cols-2 gap-4 items-start">
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
            </div>
          </div>

          {/* Right Column - Doctor Information */}
          <div className="doctor-info text-right space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">
                Dr. {doctorInfo?.name || ''}
              </h2>
              <div className="text-sm text-gray-600 font-medium">
                {doctorInfo?.specialization && (
                  <div>{doctorInfo.specialization}</div>
                )}
                {doctorInfo?.qualification && (
                  <div>{doctorInfo.qualification}</div>
                )}
                {doctorInfo?.registration_number && (
                  <div>Reg. No: {doctorInfo.registration_number}</div>
                )}
              </div>
            </div>

            <div className="doctor-details space-y-2 text-xs text-gray-700">
              {doctorInfo?.phone && (
                <div className="contact-row flex items-center justify-end gap-3">
                  <span className="font-medium">{doctorInfo.phone}</span>
                  <Phone className="h-4 w-4 text-green-500 shrink-0" />
                </div>
              )}
              
              {doctorInfo?.email && (
                <div className="contact-row flex items-center justify-end gap-3">
                  <span className="font-medium">{doctorInfo.email}</span>
                  <Mail className="h-4 w-4 text-blue-500 shrink-0" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Patient and Appointment Information */}
      <div className="info-cards grid grid-cols-2 gap-4 mb-4">
        {/* Patient Information */}
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Patient Information</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-[120px,1fr] gap-2">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-900">{patient?.name}</span>
              </div>
              <div className="grid grid-cols-[120px,1fr] gap-2">
                <span className="text-gray-600">Age/Gender:</span>
                <span className="font-medium text-gray-900">
                  {patient?.date_of_birth && `${getAge(patient.date_of_birth)} • `}
                  {patient?.gender}
                </span>
              </div>
              {patient?.phone && (
                <div className="grid grid-cols-[120px,1fr] gap-2">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-gray-900">{patient.phone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Appointment Information */}
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Appointment Details</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-[120px,1fr] gap-2">
                <span className="text-gray-600">Date/Time:</span>
                <span className="font-medium text-gray-900">
                  {appointment?.date && format(new Date(appointment.date), 'MMM d, yyyy')}
                  {appointment?.time && ` • ${formatTimeIST(appointment.time)}`}
                </span>
              </div>
              <div className="grid grid-cols-[120px,1fr] gap-2">
                <span className="text-gray-600">Department:</span>
                <span className="font-medium text-gray-900">{departmentType}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 consultation-content">
        {/* Consultation Notes */}
        <div className="space-y-6">
          {sections.map((section, sectionIndex) => {
            // Filter out empty fields
            const fieldsWithContent = section.fields.filter(field => {
              const value = consultationData[field.name];
              if (!value) return false;
              if (typeof value === 'string' && !value.trim()) return false;
              if (Array.isArray(value) && value.length === 0) return false;
              return true;
            });

            if (fieldsWithContent.length === 0) return null;

            return (
              <div key={sectionIndex} className="section-notes">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h3>
                <div className="space-y-4">
                  {fieldsWithContent.map((field, fieldIndex) => {
                    const value = consultationData[field.name];
                    return (
                      <div key={fieldIndex} className="field-group">
                        <div className="text-sm font-medium text-gray-700 mb-1">{field.label}</div>
                        <div className="text-sm text-gray-900">{renderFieldValue(field.name, value)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}; 