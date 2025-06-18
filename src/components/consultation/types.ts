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

// Prescription medication item for forms (different from the database table)
export interface PrescriptionMedication {
  name?: string;
  dosage?: string;
  route?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  eye?: string;
}

export interface PrescriptionFieldProps {
  value: PrescriptionMedication[];
  onChange: (prescriptions: PrescriptionMedication[]) => void;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  rows?: number;
  options?: string[];
} 