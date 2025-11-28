// Consultation component types

/** Tabular eye examination value */
export interface TabularEyeValue {
  visual_acuity_left?: string;
  visual_acuity_right?: string;
  refraction_left?: string;
  refraction_right?: string;
  intraocular_pressure_left?: string;
  intraocular_pressure_right?: string;
  slit_lamp_left?: string;
  slit_lamp_right?: string;
  fundus_left?: string;
  fundus_right?: string;
  notes?: string;
}

/** Motor examination value */
export interface MotorExaminationValue {
  muscle_tone?: string;
  muscle_strength?: string;
  coordination?: string;
  gait?: string;
  reflexes?: string;
  notes?: string;
}

/** Reflex examination value */
export interface ReflexExaminationValue {
  biceps?: string;
  triceps?: string;
  brachioradialis?: string;
  patellar?: string;
  achilles?: string;
  plantar?: string;
  notes?: string;
}

/** Field configuration */
export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'date' | 'checkbox' | 'radio' | 'prescription' | 'vital_signs' | 'motor_examination' | 'reflex_examination' | 'tabular_eye';
  options?: string[];
  placeholder?: string;
  mandatory?: boolean;
  section?: string;
  rows?: number;
  maxLength?: number;
}

/** Field value type */
export type FieldValue = string | number | boolean | TabularEyeValue | MotorExaminationValue | ReflexExaminationValue | any[] | null | undefined;

/** Clinic information */
export interface ClinicInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
}

/** Doctor information */
export interface DoctorInfo {
  name: string;
  qualification: string;
  registration_number: string;
  signature?: string;
}

/** Field section */
export interface FieldSection {
  name: string;
  label: string;
  fields: FieldConfig[];
}