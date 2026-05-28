// File: components/consultation/ConsultationLayout.tsx
import React from 'react';
import { specialtyFieldSections } from '@/lib/consultationNotesSchemas';
import type { FieldValue, ClinicInfo, DoctorInfo, MotorExamData, ReflexExamData } from '@/types/consultation';
import { FieldValueRenderer } from './ConsultationRenderers';
import { ConsultationHeader, ConcisePatientInfo, PrintStyles, ConsultationSignatureFooter } from './ConsultationParts';
import type { DbAppointment, DbPatient } from '@/types/core';

interface Field {
  name: string;
  label: string;
  type?: string;
}

interface Section {
  title: string;
  fields: Field[];
}

// Utility function to populate default values for motor and reflex examination data
const populateDefaultValues = (fieldName: string, value: FieldValue | undefined): FieldValue | undefined => {
  if (!value) {
    if (fieldName === 'motor_examination') {
      const defaultMotorData: MotorExamData = {
        shoulder_left: '5',
        shoulder_right: '5',
        elbow_left: '5',
        elbow_right: '5',
        wrist_left: '5',
        wrist_right: '5',
        hip_left: '5',
        hip_right: '5',
        knee_left: '5',
        knee_right: '5',
        ankle_left: '5',
        ankle_right: '5',
        muscle_tone: null,
        muscle_bulk: null,
        involuntary_movements: null,
        notes: null,
      };
      return defaultMotorData;
    }

    if (fieldName === 'reflexes') {
      const defaultReflexData: ReflexExamData = {
        biceps_left: '2',
        biceps_right: '2',
        triceps_left: '2',
        triceps_right: '2',
        supinator_left: '2',
        supinator_right: '2',
        knee_left: '2',
        knee_right: '2',
        ankle_left: '2',
        ankle_right: '2',
        plantar_right: null,
        plantar_left: null,
        abdominal_left: null,
        abdominal_right: null,
        clonus: null,
        hoffmann: null,
        notes: null,
      };
      return defaultReflexData;
    }
  }

  return value;
};

// Field grouping logic with improved side-by-side layout
const groupRelatedFields = (fields: Field[], consultationData: Record<string, FieldValue> | undefined) => {
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
  // Core full-width fields that are always important and need full width
  if (field.name === 'chief_complaint' ||
      field.name === 'history_of_present_illness' ||
      field.name === 'diagnosis' ||
      field.name === 'treatment') {
    return true;
  }

  // Complex field types that need full width
  if (field.type === 'vital_signs' ||
      field.type === 'prescription' ||
      field.type === 'tabular_eye') {
    return true;
  }

  // Large text fields (only if they have substantial content)
  if (typeof value === 'string' && value.length > 300) {
    return true;
  }

  // Most textarea fields can be side-by-side if they're compact
  // Allow fields like physical_exam, systemic_examination, cranial_nerves to be side-by-side
  if (field.type === 'textarea' && typeof value === 'string' && value.length <= 150) {
    return false;
  }

  // Motor examination and reflexes can be side-by-side since they're compact
  if (field.type === 'motor_examination' ||
      field.type === 'reflex_examination') {
    return false;
  }

  return false;
};



const shouldStartNewGroup = (field: Field, currentGroup: Field[]): boolean => {
  if (currentGroup.length === 0) return false;

  // Start new group if field type changes significantly
  if (currentGroup[0].type !== field.type) {
    // Allow motor examination and reflexes to be grouped together
    const currentIsExam = currentGroup[0].type === 'motor_examination' || currentGroup[0].type === 'reflex_examination';
    const newIsExam = field.type === 'motor_examination' || field.type === 'reflex_examination';

    if (currentIsExam && newIsExam) {
      return false; // Allow grouping of motor and reflex examinations
    }

    // Allow textarea fields to be grouped together
    const currentIsTextarea = currentGroup[0].type === 'textarea';
    const newIsTextarea = field.type === 'textarea';

    if (currentIsTextarea && newIsTextarea) {
      return false; // Allow grouping of textarea fields
    }

    return true;
  }

  // Start new group if switching between compact and regular fields
  const currentIsCompact = currentGroup[0].type === 'reflex_examination' ||
                          currentGroup[0].type === 'motor_examination' ||
                          currentGroup[0].type === 'tabular_eye';
  const newIsCompact = field.type === 'reflex_examination' ||
                      field.type === 'motor_examination' ||
                      field.type === 'tabular_eye';

  if (currentIsCompact !== newIsCompact) {
    return true;
  }

  return false;
};

// Field group component with fresh implementation
const FieldGroup: React.FC<{ fields: Field[], consultationData: Record<string, FieldValue> | undefined }> = ({ fields, consultationData }) => {
  const isSingleField = fields.length === 1;
  const field = fields[0];
  const rawValue = consultationData?.[field.name as keyof typeof consultationData];
  const value = populateDefaultValues(field.name, rawValue);

  // Determine field layout
  const isFullWidth = isSingleField && isFieldFullWidth(field, value);
  const isCompactField = field.type === 'tabular_eye'; // Only tabular eye fields are compact now

  if (isSingleField) {
    // Single field layout
    if (isFullWidth) {
      return (
        <div className="w-full">
          <div className="text-sm font-bold text-foreground">{field.label}</div>
          <div className="text-sm text-foreground">
            <FieldValueRenderer fieldName={field.name} value={value} />
          </div>
        </div>
      );
    }

    if (isCompactField) {
      return (
        <div className="flex gap-2 items-start">
          <div className="text-sm font-bold text-foreground whitespace-nowrap">
            {field.label}:
          </div>
          <div className="text-sm text-foreground flex-1">
            <FieldValueRenderer fieldName={field.name} value={value} />
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="text-sm font-bold text-foreground">{field.label}</div>
        <div className="text-sm text-foreground">
          <FieldValueRenderer fieldName={field.name} value={value} />
        </div>
      </div>
    );
  }

// UPDATED: Multiple fields - responsive grid layout with specific print marker classes
const gridClassConfig = fields.length === 2
? 'grid-cols-1 md:grid-cols-2 print-grid-2-cols' // Added marker class
: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 print-grid-3-cols'; // Added marker class

return (
<div className={`grid ${gridClassConfig} gap-3 print:gap-2`}>
  {fields.map((field, index) => {
    const rawValue = consultationData?.[field.name as keyof typeof consultationData];
    const value = populateDefaultValues(field.name, rawValue);
    const isCompact = field.type === 'tabular_eye'; // Only tabular eye fields are compact now

        if (isCompact) {
          return (
            <div key={index} className="flex gap-2 items-start">
              <div className="text-sm font-bold text-foreground whitespace-nowrap">
                {field.label}:
              </div>
              <div className="text-sm text-foreground flex-1">
                <FieldValueRenderer fieldName={field.name} value={value} />
              </div>
            </div>
          );
        }

        return (
          <div key={index}>
            <div className="text-sm font-bold text-foreground">{field.label}</div>
            <div className="text-sm text-foreground">
              <FieldValueRenderer fieldName={field.name} value={value} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface ConsultationLayoutProps {
  patient: DbPatient;
  appointment: DbAppointment | null;
  clinicInfo: ClinicInfo | null;
  doctorInfo: DoctorInfo | null;
  consultationData?: Record<string, FieldValue>;
  specialtySections?: Section[];
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
    <div className={`max-w-4xl mx-auto bg-background min-h-screen print:block print:min-h-0 print:h-auto print:max-w-none ${className}`}>
      
      {/* The master table structure */}
      <table className="w-full border-collapse border-0">
        <tbody>
          <tr>
            <td className="p-0 align-top border-0">
              
              {/* Header */}
              <ConsultationHeader clinicInfo={clinicInfo} doctorInfo={doctorInfo} />

              {/* Patient Info */}
              <ConcisePatientInfo
                patient={patient}
                appointment={appointment}
              />

              {/* Consultation Content */}
              <div className="space-y-4 print:space-y-3">
                {sections.map((section: Section, sectionIndex: number) => {
                  const fieldsWithContent = section.fields.filter((field: Field) => {
                    const value = consultationData?.[field.name as keyof typeof consultationData] as FieldValue;
                    if (field.type === 'motor_examination' || field.name === 'reflexes') return true;
                    if (!value) return false;
                    if (typeof value === 'string') return value.trim().length > 0;
                    if (Array.isArray(value)) return value.length > 0;
                    if (typeof value === 'object' && value !== null) {
                      const obj = value as unknown as Record<string, unknown>;
                      return Object.values(obj).some(val => {
                        if (typeof val === 'string') return val.trim().length > 0;
                        if (Array.isArray(val)) return val.length > 0;
                        if (typeof val === 'object' && val !== null) {
                          return Object.values(val as Record<string, unknown>).some(
                            nestedVal => typeof nestedVal === 'string' && nestedVal.trim().length > 0
                          );
                        }
                        return false;
                      });
                    }
                    return true;
                  });

                  if (fieldsWithContent.length === 0) return null;
                  const groupedFields = groupRelatedFields(fieldsWithContent as Field[], consultationData);

                  return (
                    <div key={sectionIndex} className="mb-4 print:mb-4">
                      <h3 className="text-lg font-semibold text-foreground mb-2 print:mb-1 break-after-avoid">
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

            </td>
          </tr>
        </tbody>

        {/* The Table Footer - Automatically repeats and reserves space natively */}
        <tfoot className="print:table-footer-group">
          <tr>
            <td className="p-0 border-0 align-bottom">
              {/* Spacer to guarantee the text never rides exactly on the signature line */}
              <div className="h-4 print:h-8"></div>
              <ConsultationSignatureFooter signature={doctorInfo?.signature} />
            </td>
          </tr>
        </tfoot>
      </table>

    </div>
  );

};