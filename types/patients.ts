// src/types/patients.ts
import type {
  DbPatient,
  DbConsultation,
  DbPrescription,
  DbAppointment,
  AppointmentStatus,
  AppointmentType,
  Json,
  Consultation,
} from './core';

// If ConsultationMedication isn't exported from core, we define a fallback or import it
// assuming it's available based on the usage in core.ts
export interface ConsultationMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

// ============================================================================
// PATIENT TYPES
// ============================================================================

/** Base patient type */
export type Patient = DbPatient;

/** Base appointment type */
export type Appointment = DbAppointment;

/** Specialty data interface */
export interface SpecialtyData {
  [key: string]: Json | undefined;
  chief_complaint?: string;
}

export interface ConsultationWithAppointment extends Consultation {
  appointment: {
    id?: string;
    clinic_id?: string;
    patient_id?: string;
    doctor_id?: string;
    date: string;
    time: string;
    type?: AppointmentType;
    status?: AppointmentStatus;
    notes?: string;
    created_at?: string;
    doctor_name: string;
    department_name: string;
  };
}

export interface PatientWithConsultations extends Patient {
  consultations: ConsultationWithAppointment[];
  prescriptions: Prescription[];
}

export interface AppointmentData {
  id: string;
  clinic_id?: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
  patient_name?: string;
  patient_gender?: string | null;
  patient_age?: number | null;
  doctor_name?: string;
  department_name?: string;
}

/** Prescription with doctor details for timeline display */
export type Prescription = DbPrescription & {
  doctor_name?: string;
  // Ensure medications is typed strictly
  medications?: ConsultationMedication[] | object[]; 
};

export interface ExportOptions {
  includeConsultations: boolean;
  includePrescriptions: boolean;
  dateRange: 'all' | '30days' | '90days' | '1year';
}

// Helper type for the Doctor Fallback Query in Patients.tsx
export interface DoctorWithDepartmentInfo {
  id: string;
  name: string;
  department_name?: string;
  primary_specialization?: string | null;
  clinic_members: {
    department_id: string | null;
    clinic_departments: {
      department_type_id: string | null;
      department_types: {
        name: string;
      } | null;
    } | null;
  }[];
}

// Re-export core types for convenience
export type { AppointmentStatus, AppointmentType, Consultation };