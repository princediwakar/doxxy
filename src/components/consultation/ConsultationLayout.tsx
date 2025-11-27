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

// Field grouping logic with improved side-by-side layout
const groupRelatedFields = (fields: Field[], consultationData: ConsultationFormValues['specialty_data']) => {
  const groups: Field[][] = [];
  let currentGroup: Field[] = [];

  fields.forEach((field, index) => {
    const value = consultationData?.[field.name as keyof typeof consultationData];

    // Determine if field should be full-width
    const isFullWidthField = isFieldFullWidth(field, value);

    // Start new group if:
    // - Current group is full (3 small fields max)
    // - Field is full-width
    // - Field type changes significantly
    if (currentGroup.length === 3 || isFullWidthField || shouldStartNewGroup(field, currentGroup)) {
      if (currentGroup.length > 0) {
        groups.push([...currentGroup]);
        currentGroup = [];
      }
    }

    // Add field to current group
    if (!isFullWidthField) {
      currentGroup.push(field);
    } else {
      // Full-width fields get their own group
      groups.push([field]);
    }

    // If this is the last field, add the current group
    if (index === fields.length - 1 && currentGroup.length > 0) {
      groups.push([...currentGroup]);
    }
  });

  return groups;
};

// Determine if a field should take full width
const isFieldFullWidth = (field: Field, value: FieldValue | undefined): boolean => {
  // Core full-width fields as specified
  if (field.name === 'chief_complaint' ||
      field.name === 'history_of_present_illness' ||
      field.name === 'diagnosis' ||
      field.name === 'treatment') {
    return true;
  }

  // Additional full-width fields based on their nature
  if (field.name === 'assessment' ||
      field.name === 'physical_exam' ||
      field.name === 'systemic_examination') {
    return true;
  }

  // Large text fields
  if (typeof value === 'string' && value.length > 150) {
    return true;
  }

  // Complex field types that need full width
  if (field.type === 'vital_signs' ||
      field.type === 'prescription' ||
      field.type === 'tabular_eye') {
    return true;
  }

  return false;
};



const shouldStartNewGroup = (field: Field, currentGroup: Field[]): boolean => {
  // Start new group if field type changes significantly
  if (currentGroup.length > 0 && currentGroup[0].type !== field.type) {
    return true;
  }

  // Start new group if switching between compact and regular fields
  const currentIsCompact = currentGroup.length > 0 &&
    (currentGroup[0].type === 'reflex_examination' || currentGroup[0].type === 'motor_examination' || currentGroup[0].type === 'tabular_eye');
  const newIsCompact = field.type === 'reflex_examination' || field.type === 'motor_examination' || field.type === 'tabular_eye';

  if (currentIsCompact !== newIsCompact) {
    return true;
  }

  return false;
};

// Field group component with fresh implementation
const FieldGroup: React.FC<{ fields: Field[], consultationData: ConsultationFormValues['specialty_data'] }> = ({ fields, consultationData }) => {
  const isSingleField = fields.length === 1;
  const field = fields[0];
  const value = consultationData?.[field.name as keyof typeof consultationData];

  // Determine field layout
  const isFullWidth = isSingleField && isFieldFullWidth(field, value);
  const isCompactField = field.type === 'reflex_examination' || field.type === 'motor_examination' || field.type === 'tabular_eye';

  if (isSingleField) {
    // Single field layout
    if (isFullWidth) {
      return (
        <div className="w-full">
          <div className="text-sm font-semibold text-gray-800">{field.label}</div>
          <div className="text-sm text-gray-900">
            <FieldValueRenderer fieldName={field.name} value={value} />
          </div>
        </div>
      );
    }

    if (isCompactField) {
      return (
        <div className="gap-2">
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
      <div>
        <div className="text-sm font-semibold text-gray-800">{field.label}</div>
        <div className="text-sm text-gray-900">
          <FieldValueRenderer fieldName={field.name} value={value} />
        </div>
      </div>
    );
  }

  // Multiple fields - responsive grid layout
  const gridCols = fields.length === 2
    ? 'grid-cols-1 md:grid-cols-2'
    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`grid ${gridCols} gap-3 print:gap-2 print:grid-cols-2 lg:print:grid-cols-3`}>
      {fields.map((field, index) => {
        const value = consultationData?.[field.name as keyof typeof consultationData];
        const isCompact = field.type === 'reflex_examination' || field.type === 'motor_examination' || field.type === 'tabular_eye';

        if (isCompact) {
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