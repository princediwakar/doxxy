// types.ts
import { z } from 'zod';
import { consultationNotesSchema } from '@/lib/consultationNotesSchemas';
import { Tables } from '@/integrations/supabase/types';

// Use existing Supabase types
export type Patient = Tables<'patients'>;
export type Clinic = Tables<'clinics'>;
export type Doctor = Tables<'doctors'>;
export type Consultation = Tables<'consultations'>;
export type Prescription = Tables<'prescriptions'>;

export interface ConsultationFormValues {
  specialty_data: z.infer<typeof consultationNotesSchema>;
}

export interface PrescriptionMedication {
  name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  route?: string;
  instructions?: string;
}

export interface PrescriptionFieldProps {
  value: readonly PrescriptionMedication[];
  onChange: (value: PrescriptionMedication[]) => void;
  isReadOnly?: boolean;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  rows?: number;
  options?: string[];
  mandatory?: boolean;
}

// --- NEW NAMED INTERFACES ---

export interface EyeData {
  left?: string; 
  right?: string; 
  notes?: string; 
}

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

export interface TabularEyeValue {
  // Visual function tests
  visual_acuity_left?: string;
  visual_acuity_right?: string;
  refraction_left?: string;
  refraction_right?: string;

  // Anterior segment
  // Clinical flow: EOM -> Lids -> Conjunctiva -> Cornea -> Iris -> Pupil -> Lens -> IOP
  extraocular_movements_left?: string;
  extraocular_movements_right?: string;
  lids_left?: string;
  lids_right?: string;
  conjunctiva_left?: string;
  conjunctiva_right?: string;
  cornea_left?: string;
  cornea_right?: string;
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


// Union type using the named interfaces
export type FieldValue =
  | string
  | PrescriptionMedication[]
  | EyeData
  | VitalSignsData
  | MotorExamData
  | ReflexExamData
  | TabularEyeValue;