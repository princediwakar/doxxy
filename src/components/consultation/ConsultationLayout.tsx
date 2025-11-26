// src/components/consultation/ConsultationLayout.tsx
import React from 'react';
import { Tables } from '@/integrations/supabase/types';
import { specialtyFieldSections, FieldSection } from '@/lib/consultationNotesSchemas';
import { ConsultationFormValues, Patient, FieldValue} from './types';
import { FieldValueRenderer } from './ConsultationRenderers';
import { ConsultationHeader, PatientInfoCards, PrintStyles, ClinicInfo, DoctorInfo } from './ConsultationParts';

interface Field {
  name: string;
  label: string;
  type?: string;
}

// Field grouping logic
const groupRelatedFields = (fields: Field[], consultationData: ConsultationFormValues['specialty_data']) => {
  const groups: Field[][] = [];
  let currentGroup: Field[] = [];

  fields.forEach((field, index) => {
    const value = consultationData?.[field.name as keyof typeof consultationData];

    // Determine field size
    const isSmallField = isFieldSmall(field, value);

    // Start new group if:
    // - Current group is full (2 small fields)
    // - Field is large
    // - Field type changes
    if (currentGroup.length === 2 || !isSmallField || shouldStartNewGroup(field, currentGroup)) {
      if (currentGroup.length > 0) {
        groups.push([...currentGroup]);
        currentGroup = [];
      }
    }

    // Add field to current group
    currentGroup.push(field);

    // If this is the last field, add the current group
    if (index === fields.length - 1 && currentGroup.length > 0) {
      groups.push([...currentGroup]);
    }
  });

  return groups;
};

const isFieldSmall = (field: Field, value: FieldValue | undefined): boolean => {
  // Ophthalmology small fields
  if (['visual_acuity', 'refraction', 'pupil_examination', 'intraocular_pressure'].includes(field.name)) {
    return true;
  }

  // Reflex and motor examination fields
  if (field.type === 'reflex_examination' || field.type === 'motor_examination') {
    return true;
  }

  // Small text fields
  if (typeof value === 'string' && value.length <= 50) {
    return true;
  }

  return false;
};

const shouldStartNewGroup = (field: Field, currentGroup: Field[]): boolean => {
  // Start new group for large fields
  if (field.name === 'history_of_present_illness' ||
      field.name === 'assessment' ||
      field.name === 'treatment' ||
      field.name === 'diagnosis' ||
      field.name === 'physical_exam' ||
      field.name === 'systemic_examination') {
    return true;
  }

  // Start new group if field type changes
  if (currentGroup.length > 0 && currentGroup[0].type !== field.type) {
    return true;
  }

  // Start new group if switching between compact and regular fields
  const currentIsCompact = currentGroup.length > 0 &&
    (currentGroup[0].type === 'reflex_examination' || currentGroup[0].type === 'motor_examination');
  const newIsCompact = field.type === 'reflex_examination' || field.type === 'motor_examination';

  if (currentIsCompact !== newIsCompact) {
    return true;
  }

  return false;
};

// Field group component
const FieldGroup: React.FC<{ fields: Field[], consultationData: ConsultationFormValues['specialty_data'] }> = ({ fields, consultationData }) => {
  if (fields.length === 1) {
    const field = fields[0];
    const value = consultationData?.[field.name as keyof typeof consultationData];

    // Determine if this single field should be full width
    const isLargeField = field.name === 'history_of_present_illness' ||
                        field.name === 'assessment' ||
                        field.name === 'treatment' ||
                        field.name === 'diagnosis' ||
                        field.name === 'physical_exam' ||
                        field.name === 'systemic_examination' ||
                        (typeof value === 'string' && value.length > 150) ||
                        field.type === 'vital_signs' ||
                        field.type === 'prescription' ||
                        field.type === 'tabular_eye' ||
                        field.type === 'motor_examination' ||
                        field.type === 'reflex_examination';

    return (
      <div className={isLargeField ? 'w-full' : ''}>
        <div className="text-sm font-semibold text-gray-800">{field.label}</div>
        <div className="text-sm text-gray-900">
          <FieldValueRenderer fieldName={field.name} value={value} />
        </div>
      </div>
    );
  }

  // Multiple small fields - display horizontally
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 print:gap-2 print:grid-cols-2 lg:print:grid-cols-3">
      {fields.map((field, index) => {
        const value = consultationData?.[field.name as keyof typeof consultationData];

        // Special compact layout for reflex and motor examination fields
        if (field.type === 'reflex_examination' || field.type === 'motor_examination') {
          return (
            <div key={index} className="flex items-center gap-2">
              <div className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                {field.label}:
              </div>
              <div className="text-sm text-gray-900">
                <FieldValueRenderer fieldName={field.name} value={value} />
              </div>
            </div>
          );
        }

        return (
          <div key={index}>
            <div className="text-sm font-semibold text-gray-800">{field.label}</div>
            <div className="text-sm text-gray-900">
              <FieldValueRenderer fieldName={field.name} value={value} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

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
  const sections = specialtySections || specialtyFieldSections[departmentType] || specialtyFieldSections.General;

  return (
    <div className={`max-w-4xl mx-auto bg-white min-h-screen ${className}`}>
      {showPrintStyles && <PrintStyles />}

      {/* Header */}
      <ConsultationHeader clinicInfo={clinicInfo} doctorInfo={doctorInfo} />

      {/* Patient Info */}
      <PatientInfoCards
        patient={patient}
        appointment={appointment}
        departmentType={departmentType}
      />

      {/* Consultation Content */}
      <div className="space-y-4 print:space-y-3">
        {sections.map((section, sectionIndex) => {
          const fieldsWithContent = section.fields.filter(field => {
            const value = consultationData?.[field.name as keyof typeof consultationData] as FieldValue;
            if (!value) return false;
            if (typeof value === 'string' && !value.trim()) return false;
            if (Array.isArray(value) && value.length === 0) return false;
            return true;
          });

          if (fieldsWithContent.length === 0) return null;

          // Group related small fields
          const groupedFields = groupRelatedFields(fieldsWithContent as Field[], consultationData);

          return (
            <div
              key={sectionIndex}
              className="break-inside-avoid print:break-inside-avoid"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2 print:mb-1 break-after-avoid">
                {section.title}
              </h3>
              <div className="space-y-2 print:space-y-1">
                {groupedFields.map((fieldGroup, groupIndex) => (
                  <FieldGroup
                    key={groupIndex}
                    fields={fieldGroup}
                    consultationData={consultationData}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};