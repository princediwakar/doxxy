import React from 'react';
import { Tables } from '@/integrations/supabase/types';
import { specialtyFieldSections, FieldSection } from '@/lib/consultationNotesSchemas';
import { ConsultationFormValues, Patient, FieldValue} from './types';

// Import New Components
import { FieldValueRenderer } from './ConsultationRenderers';
import { ConsultationHeader, PatientInfoCards, PrintStyles, ClinicInfo, DoctorInfo } from './ConsultationParts';

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

  return (
    <div className={`max-w-4xl mx-auto bg-white min-h-screen flex flex-col ${className}`}>
      {showPrintStyles && <PrintStyles />}
      
      <ConsultationHeader clinicInfo={clinicInfo} doctorInfo={doctorInfo} />
      
      <PatientInfoCards 
        patient={patient} 
        appointment={appointment} 
        departmentType={departmentType} 
      />

      <div className="flex-1 consultation-content">
        <div className="space-y-6 print:space-y-3">
          {sections.map((section, sectionIndex) => {
            // Filter out empty fields
            const fieldsWithContent = section.fields.filter(field => {
              const value = consultationData?.[field.name as keyof typeof consultationData] as FieldValue;
              if (!value) return false;
              if (typeof value === 'string' && !value.trim()) return false;
              if (Array.isArray(value) && value.length === 0) return false;
              return true;
            });

            if (fieldsWithContent.length === 0) return null;

            return (
              <div key={sectionIndex} className="section-notes print:mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 print:mb-2">{section.title}</h3>
                <div className="space-y-4 print:space-y-2">
                  {fieldsWithContent.map((field, fieldIndex) => {
                    const value = consultationData?.[field.name as keyof typeof consultationData];
                    return (
                      <div key={fieldIndex} className="field-group print:mb-2">
                        <div className="text-sm font-semibold text-gray-800 mb-1">{field.label}</div>
                        <div className="text-sm text-gray-900">
                          <FieldValueRenderer fieldName={field.name} value={value} />
                        </div>
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