// src/types/dashboard.ts - Dashboard Module Types
// Hub & Spoke Type Architecture - Dashboard Spoke

import type { Enums } from '@/integrations/supabase/types';
import type { DbAppointment } from './core';

// ============================================================================
// DASHBOARD-SPECIFIC TYPES
// ============================================================================

/** Formatted appointment for display in dashboard components */
export interface FormattedAppointment {
  id: string;
  patient: string;
  doctor: string;
  time: string;
  date: string;
  status: Enums<'appointment_status'>;
  type: Enums<'appointment_type'>;
}

/** Database appointment structure for dashboard queries */
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
  clinic_id: string;
}

/** Staff dashboard data from RPC function */
export interface StaffDashboardData {
  total_patients: number;
  total_doctors: number;
  total_appointments: number;
  appointments_today: number;
  pending_consultations: number;
  completed_consultations: number;
  all_relevant_appointments: DatabaseAppointment[];
}

/** Enhanced patient data for doctor dashboard */
export interface EnhancedPatientForDoctorList {
  id: string;
  name: string;
  last_visit?: string;
  address?: string;
  clinic_id?: string;
  created_at?: string | null;
  age?: number | null;
  email?: string;
  gender?: string;
  medical_id?: string;
  phone?: string;
}

/** Doctor dashboard data from RPC function */
export interface DoctorDashboardData {
  total_patients: number;
  total_appointments: number;
  pending_consultations: number;
  completed_consultations: number;
  upcoming_appointments: DatabaseAppointment[];
  my_patients: EnhancedPatientForDoctorList[];
}

/** Enhanced dashboard data for superadmins with both clinic and personal stats */
export interface EnhancedDashboardData {
  clinic: StaffDashboardData;
  doctor?: DoctorDashboardData;
  isEnhanced: boolean;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

/** Props for UpcomingAppointmentsList component */
export interface UpcomingAppointmentsListProps {
  upcomingAppointments: FormattedAppointment[];
  loading: boolean;
  appointmentsPerPage?: number;
  currentPage?: number;
  setCurrentPage?: (page: number) => void;
  totalPages?: number;
  onAppointmentClick?: (appointmentId: string) => void;
  showViewAllButton?: boolean;
  onViewAll?: () => void;
}

/** Props for WeeklyAppointmentsChart component */
export interface WeeklyAppointmentsChartProps {
  appointments: DatabaseAppointment[];
  onBarClick?: (date: string) => void;
}

/** Props for DashboardStatsCard component */
export interface DashboardStatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  onClick?: () => void;
  ariaLabel?: string;
  variant?: "default" | "primary" | "secondary";
  description?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/** Dashboard stats card configuration */
export interface DashboardStat {
  id: string;
  label: string;
  value: number | string;
  icon: string;
  color: string;
  onClick?: () => void;
  description?: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period: string;
  };
}

/** Type guard for DatabaseAppointment */
export function isValidDatabaseAppointment(obj: unknown): obj is DatabaseAppointment {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.date === 'string' &&
    typeof o.time === 'string' &&
    typeof o.type === 'string' &&
    typeof o.status === 'string' &&
    typeof o.patient_id === 'string' &&
    typeof o.patient_name === 'string' &&
    typeof o.doctor_id === 'string' &&
    typeof o.doctor_name === 'string' &&
    typeof o.clinic_id === 'string'
  );
}

// ============================================================================
// TYPE CONVERSION UTILITIES
// ============================================================================

/** Convert DatabaseAppointment to FormattedAppointment */
export function convertToFormattedAppointment(
  apt: DatabaseAppointment,
  status: Enums<'appointment_status'>,
  type: Enums<'appointment_type'>
): FormattedAppointment {
  return {
    id: apt.id,
    patient: apt.patient_name,
    doctor: apt.doctor_name,
    time: apt.time,
    date: apt.date,
    status,
    type,
  };
}

/** Convert DbAppointment to DatabaseAppointment */
export function convertDbAppointmentToDatabaseAppointment(
  apt: DbAppointment,
  patientName: string,
  doctorName: string
): DatabaseAppointment {
  return {
    id: apt.id,
    date: apt.date,
    time: apt.time,
    type: apt.type ?? 'Walk-in', // Provide default for nullable type
    status: apt.status ?? 'Scheduled', // Provide default for nullable status
    patient_id: apt.patient_id,
    patient_name: patientName,
    doctor_id: apt.doctor_id,
    doctor_name: doctorName,
    clinic_id: apt.clinic_id,
  };
}