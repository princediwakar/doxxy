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
  ConsultationMedication,
} from "@/lib/consultationNotesSchemas";

// ============================================================================
// ENHANCED DATABASE TYPES WITH RELATIONSHIPS
// ============================================================================

/** Patient with clinic relationship */
export type PatientWithClinic = DbPatient & {
  clinic?: DbClinic;
};

// ============================================================================
// CONSULTATION FORM & UI TYPES
// ============================================================================

/** Consultation form values */
export interface ConsultationFormValues {
  specialty_data: Record<string, unknown>;
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
  companionField?: string;
  hideFromSection?: boolean;
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
  slit_lamp_exam_left: string | null;
  slit_lamp_exam_right: string | null;

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
  fieldIndex?: number;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  isReadOnly?: boolean;
  autoFocus?: boolean;
  companionValue?: FieldValue;
  onCompanionChange?: (value: FieldValue) => void;
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
export type { ConsultationMedication };