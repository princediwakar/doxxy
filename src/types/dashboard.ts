import { Enums } from "@/integrations/supabase/types";

export interface FormattedAppointment {
  id: string;
  patient: string;
  doctor: string;
  time: string;
  date: string;
  status: Enums<'appointment_status'>;
  type: Enums<'appointment_type'>;
}

export interface DatabaseAppointment {
  id: string;
  date: string;
  time: string;
  type: Enums<'appointment_type'>;
  status: Enums<'appointment_status'>;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  clinic_id: string; // Added to match AppointmentWithDetails in Appointments.tsx
}

export interface StaffDashboardData {
  total_patients: number;
  total_doctors: number;
  total_appointments: number;
  appointments_today: number;
  pending_consultations: number;
  completed_consultations: number;
  all_relevant_appointments: DatabaseAppointment[];
}

export interface EnhancedPatientForDoctorList {
  id: string;
  name: string;
  last_visit?: string;
  address?: string;
  clinic_id?: string;
  created_at?: string | null;
  date_of_birth?: string | null;
  email?: string;
  gender?: string;
  medical_id?: string;
  phone?: string;
}

export interface DoctorDashboardData {
  total_patients: number;
  total_appointments: number;
  pending_consultations: number;
  completed_consultations: number;
  upcoming_appointments: DatabaseAppointment[];
  my_patients: EnhancedPatientForDoctorList[];
}