import { Database, Json } from '@/integrations/supabase/types';

export type Patient = Database['public']['Tables']['patients']['Row'];
export type Consultation = Database['public']['Tables']['consultations']['Row'];
export type Prescription = Database['public']['Tables']['prescriptions']['Row'];
export type Appointment = Database['public']['Tables']['appointments']['Row'];

export interface SpecialtyData {
  [key: string]: Json;
}

export interface ConsultationWithAppointment extends Consultation {
  appointment: {
    id?: string;
    clinic_id?: string;
    patient_id?: string;
    doctor_id?: string;
    date: string;
    time: string;
    type?: string;
    status?: string;
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
  clinic_id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  time: string;
  type: 'Walk-in' | 'Digital';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  notes?: string;
  created_at: string;
  patient_name?: string;
  patient_gender?: string;
  patient_age?: number;
  doctor_name?: string;
  department_name?: string;
}

export interface ExportOptions {
  includeConsultations: boolean;
  includePrescriptions: boolean;
  dateRange: 'all' | '30days' | '90days' | '1year';
}
