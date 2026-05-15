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
  Consultation,
  PrescriptionMedication,
} from "./core";
import {
  ConsultationNotes,
  ConsultationMedication,
} from "@/lib/consultationNotesSchemas";

// ============================================================================
// ENHANCED DATABASE TYPES WITH RELATIONSHIPS
// ============================================================================

/** Patient with clinic relationship */
export type PatientWithClinic = DbPatient & {
  clinic?: DbClinic;
};

/** Doctor with user profile relationship */
export type DoctorWithProfile = DbDoctor & {
  profile?: {
    first_name: string | null;
    last_name: string | null;
    display_name: string | null;
    email: string | null;
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
  type?: string;
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
  left: string | null;
  right: string | null;
  notes: string | null;
}

/** Vital signs data */
export interface VitalSignsData {
  temperature: string | null;
  pulse: string | null;
  blood_pressure_systolic: string | null;
  blood_pressure_diastolic: string | null;
  respiratory_rate: string | null;
  oxygen_saturation: string | null;
  height: string | null;
  weight: string | null;
  bmi: string | null;
}

/** Motor examination data */
export interface MotorExamData {
  shoulder_left: string | null;
  shoulder_right: string | null;
  elbow_left: string | null;
  elbow_right: string | null;
  wrist_left: string | null;
  wrist_right: string | null;
  hip_left: string | null;
  hip_right: string | null;
  knee_left: string | null;
  knee_right: string | null;
  ankle_left: string | null;
  ankle_right: string | null;
  muscle_tone: string | null;
  muscle_bulk: string | null;
  involuntary_movements: string | null;
  coordination: string | null;
  notes: string | null;
}

/** Reflex examination data */
export interface ReflexExamData {
  biceps_left: string | null;
  biceps_right: string | null;
  triceps_left: string | null;
  triceps_right: string | null;
  supinator_left: string | null;
  supinator_right: string | null;
  knee_left: string | null;
  knee_right: string | null;
  ankle_left: string | null;
  ankle_right: string | null;
  plantar_right: string | null;
  plantar_left: string | null;
  abdominal_left: string | null;
  abdominal_right: string | null;
  clonus: string | null;
  hoffmann: string | null;
  notes: string | null;
}

/** Tabular eye examination data */
export interface TabularEyeValue {
  // Visual function tests
  visual_acuity_left: string | null;
  visual_acuity_right: string | null;
  refraction_left: string | null;
  refraction_right: string | null;

  // Anterior segment
  extraocular_movements_left: string | null;
  extraocular_movements_right: string | null;
  lids_left: string | null;
  lids_right: string | null;
  conjunctiva_left: string | null;
  conjunctiva_right: string | null;
  cornea_left: string | null;
  cornea_right: string | null;
  anterior_chamber_left: string | null;
  anterior_chamber_right: string | null;
  iris_left: string | null;
  iris_right: string | null;
  pupil_examination_left: string | null;
  pupil_examination_right: string | null;
  lens_left: string | null;
  lens_right: string | null;
  intraocular_pressure_left: string | null;
  intraocular_pressure_right: string | null;

  // Posterior segment
  fundus_exam_left: string | null;
  fundus_exam_right: string | null;

  // Additional findings
  notes: string | null;
}

/** Union type for all possible field values */
export type FieldValue =
  | string
  | string[]
  | PrescriptionMedication[]
  | ConsultationMedication[]
  | EyeData
  | VitalSignsData
  | MotorExamData
  | ReflexExamData
  | TabularEyeValue
  | null;

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
  registration_number: string | null;
  signature?: string | null;
  [key: string]: unknown; // Index signature for compatibility
}

/** Clinic information for printing */
export interface ClinicInfo {
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/** Department information */
export type DepartmentInfo = {
  name: string;
  description: string | null;
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
  phone: string | null;
  email: string | null;
  bio: string | null;
  user_id: string | null;
  qualification: string | null;
  specialization: string | null;
}

// ============================================================================
// EXPORTS
// ============================================================================

// Re-export core types for convenience
export type { Consultation, PrescriptionMedication };
// Re-export Zod types for convenience
export type { ConsultationNotes, ConsultationMedication };

// Export all types as namespace for easy access
export * as ConsultationTypes from "./consultation";