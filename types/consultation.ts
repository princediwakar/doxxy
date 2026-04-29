// src/types/consultation.ts
// Consultation Module Type Definitions - Hub & Spoke Architecture

import {
  DbConsultation,
  DbPatient,
  DbDoctor,
  DbClinic,
  DbClinicDepartment,
  DbClinicMember,
  DbDepartmentType,
  DbAppointment,
  ClinicDepartmentWithType,
} from "./core";
import {
  ConsultationNotes,
  ConsultationMedication,
} from "@/lib/consultationNotesSchemas";

// ============================================================================
// ENHANCED DATABASE TYPES WITH RELATIONSHIPS
// ============================================================================

/** Consultation with enhanced specialty_data type */
// Fixed: Use Omit to strictly override specialty_data with null support
export type Consultation = Omit<DbConsultation, 'specialty_data'> & {
  specialty_data?: ConsultationNotes | null;
  appointment?: {
    date: string;
    time: string;
    doctor_name: string;
    department_name: string;
  } | null;
};

/** Patient with clinic relationship */
export type PatientWithClinic = DbPatient & {
  clinic?: DbClinic;
};

/** Doctor with user profile relationship */
export type DoctorWithProfile = DbDoctor & {
  profile?: {
    first_name?: string;
    last_name?: string;
    display_name?: string;
    email?: string;
  };
};

/** Clinic member with department relationship */
export type ClinicMemberWithDepartment = DbClinicMember & {
  clinic_department?: ClinicDepartmentWithType;
};

// ============================================================================
// CONSULTATION FORM & UI TYPES
// ============================================================================

/** Consultation form values */
export interface ConsultationFormValues {
  specialty_data: ConsultationNotes;
}

/** Prescription medication interface */
export interface PrescriptionMedication {
  name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  route?: string;
  instructions?: string;
}

/** Prescription field component props */
export interface PrescriptionFieldProps {
  value: readonly PrescriptionMedication[];
  onChange: (value: PrescriptionMedication[]) => void;
  isReadOnly?: boolean;
}

/** Field configuration for UI components */
export interface FieldConfig {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  rows?: number;
  options?: string[];
  mandatory?: boolean;
}

// ============================================================================
// CLINICAL DATA INTERFACES
// ============================================================================

/** Eye examination data */
export interface EyeData {
  left?: string;
  right?: string;
  notes?: string;
}

/** Vital signs data */
export interface VitalSignsData {
  temperature?: string;
  pulse?: string;
  blood_pressure_systolic?: string;
  blood_pressure_diastolic?: string;
  respiratory_rate?: string;
  oxygen_saturation?: string;
  height?: string;
  weight?: string;
  bmi?: string;
}

/** Motor examination data */
export interface MotorExamData {
  shoulder_left?: string;
  shoulder_right?: string;
  elbow_left?: string;
  elbow_right?: string;
  wrist_left?: string;
  wrist_right?: string;
  hip_left?: string;
  hip_right?: string;
  knee_left?: string;
  knee_right?: string;
  ankle_left?: string;
  ankle_right?: string;
  muscle_tone?: string;
  muscle_bulk?: string;
  involuntary_movements?: string;
  coordination?: string;
  notes?: string;
}

/** Reflex examination data */
export interface ReflexExamData {
  biceps_left?: string;
  biceps_right?: string;
  triceps_left?: string;
  triceps_right?: string;
  supinator_left?: string;
  supinator_right?: string;
  knee_left?: string;
  knee_right?: string;
  ankle_left?: string;
  ankle_right?: string;
  plantar_right?: string;
  plantar_left?: string;
  abdominal_left?: string;
  abdominal_right?: string;
  clonus?: string;
  hoffmann?: string;
  notes?: string;
}

/** Tabular eye examination data */
export interface TabularEyeValue {
  // Visual function tests
  visual_acuity_left?: string;
  visual_acuity_right?: string;
  refraction_left?: string;
  refraction_right?: string;

  // Anterior segment
  extraocular_movements_left?: string;
  extraocular_movements_right?: string;
  lids_left?: string;
  lids_right?: string;
  conjunctiva_left?: string;
  conjunctiva_right?: string;
  cornea_left?: string;
  cornea_right?: string;
  anterior_chamber_left?: string;
  anterior_chamber_right?: string;
  iris_left?: string;
  iris_right?: string;
  pupil_examination_left?: string;
  pupil_examination_right?: string;
  lens_left?: string;
  lens_right?: string;
  intraocular_pressure_left?: string;
  intraocular_pressure_right?: string;

  // Posterior segment
  fundus_exam_left?: string;
  fundus_exam_right?: string;

  // Additional findings
  notes?: string;
}

/** Union type for all possible field values */
export type FieldValue =
  | string
  | PrescriptionMedication[]
  | EyeData
  | VitalSignsData
  | MotorExamData
  | ReflexExamData
  | TabularEyeValue;

// ============================================================================
// COMPONENT-SPECIFIC TYPES
// ============================================================================

/** Motor examination value type (alias for MotorExamData) */
export type MotorExaminationValue = MotorExamData;

/** Reflex examination value type (alias for ReflexExamData) */
export type ReflexExaminationValue = ReflexExamData;

/** Consultation preview modal props */
export interface ConsultationPreviewModalProps {
  consultation: Consultation;
  isOpen: boolean;
  onClose: () => void;
}

/** Consultation table props */
export interface ConsultationTableProps {
  data: Record<string, unknown>;
}

/** Patient sidebar props */
export interface PatientSidebarProps {
  consultation: Consultation;
  patient: PatientWithClinic;
  appointment: DbAppointment;
}

/** Consultation layout props */
export interface ConsultationLayoutProps {
  fields: FieldConfig[];
  values: Record<string, FieldValue>;
  onChange: (name: string, value: FieldValue) => void;
  isReadOnly?: boolean;
}

/** Character counter props */
export interface CharacterCounterProps {
  value: string;
  maxLength: number;
}

/** Consultation header props */
export interface ConsultationHeaderProps {
  consultation: Consultation;
  onSave: () => void;
  isSaving: boolean;
  mandatoryFields: string[];
}

/** Auto-save mutation interface */
export interface AutoSaveMutation {
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
}

/** Mandatory fields status */
export interface MandatoryFieldsStatus {
  completed: number;
  total: number;
  allCompleted: boolean;
}

/** Reflex examination field props */
export interface ReflexExaminationFieldProps {
  value: ReflexExamData;
  onChange: (value: ReflexExamData) => void;
  isReadOnly?: boolean;
}

/** Motor examination field props */
export interface MotorExaminationFieldProps {
  value: MotorExamData;
  onChange: (value: MotorExamData) => void;
  isReadOnly?: boolean;
}

/** Tabular eye field props */
export interface TabularEyeFieldProps {
  value: TabularEyeValue;
  onChange: (value: TabularEyeValue) => void;
  isReadOnly?: boolean;
}

/** Vital signs field props */
export interface VitalSignsFieldProps {
  value: VitalSignsData;
  onChange: (value: VitalSignsData) => void;
  isReadOnly?: boolean;
}

/** Consultation form field props */
export interface ConsultationFormFieldProps {
  fieldConfig: FieldConfig;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  isReadOnly?: boolean;
}

// ============================================================================
// PRINT & EXPORT TYPES
// ============================================================================

/** Doctor information for printing */
export interface DoctorInfo {
  name: string;
  qualification: string;
  specialization: string;
  registration_number?: string;
  [key: string]: unknown; // Index signature for compatibility
}

/** Clinic information for printing */
export interface ClinicInfo {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/** Department information */
export type DepartmentInfo = {
  name: string;
  description?: string;
  clinic_departments?: {
    department_types?: {
      name: string;
    } | null;
  } | null;
};

/** Transformed doctor data for display */
export interface TransformedDoctorData {
  id: string;
  name: string;
  department_name: string;
  phone?: string;
  email?: string;
  bio?: string;
  user_id?: string;
  qualification?: string;
  specialization?: string;
}

// ============================================================================
// EXPORTS
// ============================================================================

// Re-export Zod types for convenience
export type { ConsultationNotes, ConsultationMedication };

// Export all types as namespace for easy access
export * as ConsultationTypes from "./consultation";