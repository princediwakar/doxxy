import React from 'react';
import { format } from 'date-fns';
import { formatTimeIST, getAge } from '@/lib/utils';
import { User, Calendar, Phone, Mail, MapPin, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tables } from '@/integrations/supabase/types';
import { Patient } from './types';

// Define these here to avoid circular dependency issues if they aren't in 'types.ts' yet
export interface ClinicInfo {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
}

export interface DoctorInfo {
  name?: string;
  specialization?: string;
  qualification?: string;
  registration_number?: string;
  phone?: string;
  email?: string;
  medical_registration_number?: string;
  medical_qualifications?: string;
  medical_specializations?: string;
  years_of_experience?: number;
  medical_council?: string;
  consultation_fee?: number;
}

export const PrintStyles: React.FC = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @media print {
      @page { margin: 10mm; size: A4; }
      body { font-size: 12px !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; margin: 0 !important; padding: 0 !important; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
      .avoid-break { page-break-inside: avoid; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .max-w-4xl { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
      .letterhead { padding: 0.5rem !important; margin-bottom: 0.5rem !important; page-break-inside: avoid !important; }
      .letterhead .grid { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 1rem !important; width: 100% !important; }
      .info-cards { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 0.75rem !important; margin-bottom: 0.5rem !important; page-break-inside: avoid !important; }
      .grid-cols-\\[120px\\,1fr\\] { display: grid !important; grid-template-columns: 120px 1fr !important; gap: 0.5rem !important; }
      .consultation-content { page-break-before: auto !important; }
      .space-y-6 > * + * { margin-top: 0.75rem !important; }
      .section-notes { page-break-inside: avoid !important; margin-bottom: 0.75rem !important; }
      .section-notes h3 { margin-bottom: 0.5rem !important; }
      .field-group { page-break-inside: avoid !important; margin-bottom: 0.25rem !important; }
      .space-y-4 > * + * { margin-top: 0.5rem !important; }
      table { width: 100% !important; border-collapse: collapse !important; page-break-inside: avoid !important; }
      th, td { padding: 4px 8px !important; text-align: left !important; border-bottom: 1px solid #e5e7eb !important; }
      th { background-color: #f9fafb !important; font-weight: 600 !important; }
      .shadow-sm, .shadow, .shadow-md, .shadow-lg { box-shadow: none !important; }
    }
  `}} />
);

export const ConsultationHeader: React.FC<{ clinicInfo: ClinicInfo | null, doctorInfo: DoctorInfo | null }> = ({ clinicInfo, doctorInfo }) => {
  return (
    <div className="letterhead relative border-b-2 border-blue-600 bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4 mb-4 print:p-2 print:mb-2">
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-green-500 to-blue-600"></div>
      
      <div className="grid grid-cols-2 gap-4 items-start">
        <div className="clinic-info space-y-4">
          <div className="space-y-2">
            <h1 className="clinic-name text-xl font-bold text-primary tracking-tight leading-tight">
              {clinicInfo?.name || 'MEDICAL CLINIC'}
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-green-500 rounded-full"></div>
          </div>
          
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

        <div className="doctor-info text-right space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">{doctorInfo?.name || ''}</h2>
            <div className="text-sm text-gray-600 font-medium">
              {doctorInfo?.specialization && <div>{doctorInfo.specialization}</div>}
              {doctorInfo?.qualification && <div>{doctorInfo.qualification}</div>}
              {doctorInfo?.registration_number && <div>Reg. No: {doctorInfo.registration_number}</div>}
            </div>
          </div>
          <div className="doctor-details space-y-2 text-xs text-gray-700">
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
  );
};

export const PatientInfoCards: React.FC<{ 
  patient: Patient, 
  appointment: Tables<'appointments'> | null,
  departmentType: string 
}> = ({ patient, appointment, departmentType }) => {
  return (
    <div className="info-cards grid grid-cols-2 gap-4 mb-4 print:gap-3 print:mb-2">
      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <User className="h-5 w-5 text-primary" />
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

      <Card className="bg-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="h-5 w-5 text-success" />
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
  );
};