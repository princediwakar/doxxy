// src/types/core.ts
// Hub & Spoke Type Architecture - Core Foundation
// Generated from src/integrations/supabase/types.ts

import type { Database } from '@/integrations/supabase/types';
import type { ConsultationMedication } from '@/lib/consultationNotesSchemas';
import type { GooglePlaceData } from './google-places';

// ============================================================================
// APPLICATION USER TYPE (lean — only fields we actually use)
// ============================================================================

export interface AppUser {
  id: string;
  email?: string;
  phone?: string;
  user_metadata?: {
    name?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

// ============================================================================
// DATABASE TABLE WRAPPERS
// ============================================================================

// Core Clinical Entities
/** Wrapper type for appointment_billing table */
export type DbAppointmentBilling = Database['public']['Tables']['appointment_billing']['Row'];
/** Insert type for appointment_billing table */
export type DbAppointmentBillingInsert = Database['public']['Tables']['appointment_billing']['Insert'];
/** Update type for appointment_billing table */
export type DbAppointmentBillingUpdate = Database['public']['Tables']['appointment_billing']['Update'];

/** Wrapper type for appointments table */
export type DbAppointment = Database['public']['Tables']['appointments']['Row'];
/** Insert type for appointments table */
export type DbAppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
/** Update type for appointments table */
export type DbAppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

/** Wrapper type for bills table */
export type DbBill = Database['public']['Tables']['bills']['Row'];
/** Insert type for bills table */
export type DbBillInsert = Database['public']['Tables']['bills']['Insert'];
/** Update type for bills table */
export type DbBillUpdate = Database['public']['Tables']['bills']['Update'];

/** Wrapper type for clinic_credits table */
export type DbClinicCredit = Database['public']['Tables']['clinic_credits']['Row'];
/** Insert type for clinic_credits table */
export type DbClinicCreditInsert = Database['public']['Tables']['clinic_credits']['Insert'];
/** Update type for clinic_credits table */
export type DbClinicCreditUpdate = Database['public']['Tables']['clinic_credits']['Update'];

/** Wrapper type for clinic_departments table */
export type DbClinicDepartment = Database['public']['Tables']['clinic_departments']['Row'];
/** Insert type for clinic_departments table */
export type DbClinicDepartmentInsert = Database['public']['Tables']['clinic_departments']['Insert'];
/** Update type for clinic_departments table */
export type DbClinicDepartmentUpdate = Database['public']['Tables']['clinic_departments']['Update'];

/** Wrapper type for clinic_members table */
export type DbClinicMember = Database['public']['Tables']['clinic_members']['Row'];
/** Insert type for clinic_members table */
export type DbClinicMemberInsert = Database['public']['Tables']['clinic_members']['Insert'];
/** Update type for clinic_members table */
export type DbClinicMemberUpdate = Database['public']['Tables']['clinic_members']['Update'];

/** Wrapper type for clinics table */
export type DbClinic = Database['public']['Tables']['clinics']['Row'];
/** Insert type for clinics table */
export type DbClinicInsert = Database['public']['Tables']['clinics']['Insert'];
/** Update type for clinics table */
export type DbClinicUpdate = Database['public']['Tables']['clinics']['Update'];

// Consultation & Prescription - Special Override Types
// These will be enhanced with Zod-inferred types in Phase 2

/** Base consultation type (will be enhanced with Zod schema) */
export type DbConsultationBase = Database['public']['Tables']['consultations']['Row'];
/** Base consultation insert type */
export type DbConsultationBaseInsert = Database['public']['Tables']['consultations']['Insert'];
/** Base consultation update type */
export type DbConsultationBaseUpdate = Database['public']['Tables']['consultations']['Update'];

/** Base prescription type (will be enhanced with Zod schema) */
export type DbPrescriptionBase = Database['public']['Tables']['prescriptions']['Row'];
/** Base prescription insert type */
export type DbPrescriptionBaseInsert = Database['public']['Tables']['prescriptions']['Insert'];
/** Base prescription update type */
export type DbPrescriptionBaseUpdate = Database['public']['Tables']['prescriptions']['Update'];

// Consultation & Prescription - Enhanced with Zod Schema Types

/** Enhanced consultation type with specialty_data override */
export type DbConsultation = Omit<DbConsultationBase, 'specialty_data'> & {
  specialty_data?: Record<string, unknown> | null;
};

/** Prescription medication — canonical definition used by both consultation forms and prescription records */
export interface PrescriptionMedication {
  name?: string;
  medicine_id?: number | null;
  dosage?: string;
  formulation?: string;
  frequency?: string;
  duration?: string;
  route?: string;
  instructions?: string;
}

/** Consultation with appointment relationship — canonical definition */
export type Consultation = DbConsultation & {
  appointment?: {
    date: string;
    time: string;
    doctor_name: string;
    department_name: string;
    status?: string;
    doctor_id?: string;
  } | null;
};

/** Enhanced prescription type with medications override */
export type DbPrescription = Omit<DbPrescriptionBase, 'medications'> & {
  medications?: ConsultationMedication[] | null; // Fixed: Allow null
};

// Additional Entities
/** Wrapper type for contact_messages table */
export type DbContactMessage = Database['public']['Tables']['contact_messages']['Row'];
/** Insert type for contact_messages table */
export type DbContactMessageInsert = Database['public']['Tables']['contact_messages']['Insert'];
/** Update type for contact_messages table */
export type DbContactMessageUpdate = Database['public']['Tables']['contact_messages']['Update'];

/** Wrapper type for department_types table */
export type DbDepartmentType = Database['public']['Tables']['department_types']['Row'];
/** Insert type for department_types table */
export type DbDepartmentTypeInsert = Database['public']['Tables']['department_types']['Insert'];
/** Update type for department_types table */
export type DbDepartmentTypeUpdate = Database['public']['Tables']['department_types']['Update'];

/** Wrapper type for doctors table */
export type DbDoctor = Database['public']['Tables']['doctors']['Row'];
/** Insert type for doctors table */
export type DbDoctorInsert = Database['public']['Tables']['doctors']['Insert'];
/** Update type for doctors table */
export type DbDoctorUpdate = Database['public']['Tables']['doctors']['Update'];

/** Wrapper type for medicines table */
export type DbMedicine = Database['public']['Tables']['medicines']['Row'];
/** Insert type for medicines table */
export type DbMedicineInsert = Database['public']['Tables']['medicines']['Insert'];
/** Update type for medicines table */
export type DbMedicineUpdate = Database['public']['Tables']['medicines']['Update'];

/** Wrapper type for inventory_items table */
export type DbInventoryItem = Database['public']['Tables']['inventory_items']['Row'];
/** Insert type for inventory_items table */
export type DbInventoryItemInsert = Database['public']['Tables']['inventory_items']['Insert'];
/** Update type for inventory_items table */
export type DbInventoryItemUpdate = Database['public']['Tables']['inventory_items']['Update'];

export type InventoryItemWithMedicine = DbInventoryItem & {
  medicines: Pick<DbMedicine, 'name' | 'manufacturer_name'> | null;
};

/** Wrapper type for procurements table */
export type DbProcurement = Database['public']['Tables']['procurements']['Row'];
/** Insert type for procurements table */
export type DbProcurementInsert = Database['public']['Tables']['procurements']['Insert'];
/** Update type for procurements table */
export type DbProcurementUpdate = Database['public']['Tables']['procurements']['Update'];

/** Wrapper type for procurement_items table */
export type DbProcurementItem = Database['public']['Tables']['procurement_items']['Row'];
/** Insert type for procurement_items table */
export type DbProcurementItemInsert = Database['public']['Tables']['procurement_items']['Insert'];
/** Update type for procurement_items table */
export type DbProcurementItemUpdate = Database['public']['Tables']['procurement_items']['Update'];

/** Wrapper type for stock_transactions table */
export type DbStockTransaction = Database['public']['Tables']['stock_transactions']['Row'];
/** Insert type for stock_transactions table */
export type DbStockTransactionInsert = Database['public']['Tables']['stock_transactions']['Insert'];

/** Stock transaction type discriminator */
export type StockTransactionType = 'sale' | 'procurement' | 'manual_adjustment' | 'sale_reversal';

/** Wrapper type for monthly_billing_cycles table */
export type DbMonthlyBillingCycle = Database['public']['Tables']['monthly_billing_cycles']['Row'];
/** Insert type for monthly_billing_cycles table */
export type DbMonthlyBillingCycleInsert = Database['public']['Tables']['monthly_billing_cycles']['Insert'];
/** Update type for monthly_billing_cycles table */
export type DbMonthlyBillingCycleUpdate = Database['public']['Tables']['monthly_billing_cycles']['Update'];

/** Wrapper type for patients table */
export type DbPatient = Database['public']['Tables']['patients']['Row'];
/** Insert type for patients table */
export type DbPatientInsert = Database['public']['Tables']['patients']['Insert'];
/** Update type for patients table */
export type DbPatientUpdate = Database['public']['Tables']['patients']['Update'];

/** Wrapper type for payment_transactions table */
export type DbPaymentTransaction = Database['public']['Tables']['payment_transactions']['Row'];
/** Insert type for payment_transactions table */
export type DbPaymentTransactionInsert = Database['public']['Tables']['payment_transactions']['Insert'];
/** Update type for payment_transactions table */
export type DbPaymentTransactionUpdate = Database['public']['Tables']['payment_transactions']['Update'];

/** Wrapper type for pending_invitations table */
export type DbPendingInvitation = Database['public']['Tables']['pending_invitations']['Row'];
/** Insert type for pending_invitations table */
export type DbPendingInvitationInsert = Database['public']['Tables']['pending_invitations']['Insert'];
/** Update type for pending_invitations table */
export type DbPendingInvitationUpdate = Database['public']['Tables']['pending_invitations']['Update'];

/** Wrapper type for profiles table */
export type DbProfile = Database['public']['Tables']['profiles']['Row'];
/** Insert type for profiles table */
export type DbProfileInsert = Database['public']['Tables']['profiles']['Insert'];
/** Update type for profiles table */
export type DbProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// ============================================================================
// DATABASE ENUMS
// ============================================================================

/** Appointment status enum */
export type AppointmentStatus = Database['public']['Enums']['appointment_status'];
/** Appointment type enum */
export type AppointmentType = Database['public']['Enums']['appointment_type'];

/** Procurement status enum */
export type ProcurementStatus = Database['public']['Enums']['procurement_status'];
/** User role enum */
export type UserRole = Database['public']['Enums']['user_role'];

// ============================================================================
// DATABASE VIEWS
// ============================================================================


// ============================================================================
// DATABASE FUNCTIONS (Key Functions Only)
// ============================================================================

/** Get appointments with details function return type */
export type DbAppointmentWithDetails = Database['public']['Functions']['get_appointments_with_details_by_clinic']['Returns'][0];

/** Get patients by clinic function return type */
export type DbPatientByClinic = Database['public']['Functions']['get_patients_by_clinic']['Returns'][0];

/** Get dashboard data function return type */
export type DbDashboardData = Database['public']['Functions']['get_dashboard_data']['Returns'][0];

/** Get doctor dashboard data function return type */
export type DbDoctorDashboardData = Database['public']['Functions']['get_doctor_dashboard_data']['Returns'][0];

/** Get clinic analytics function return type */
export type DbClinicAnalytics = Database['public']['Functions']['get_clinic_analytics']['Returns'][0];

/** Get doctor analytics function return type */
export type DbDoctorAnalytics = Database['public']['Functions']['get_doctor_analytics']['Returns'][0];

/** Get aggregated demographics function return type */
export type DbAggregatedDemographics = Database['public']['Functions']['get_aggregated_demographics']['Returns'][0];

/** Get provider performance matrix function return type */
export type DbProviderPerformanceRow = Database['public']['Functions']['get_provider_performance_matrix']['Returns'][0];

// ============================================================================
// ENHANCED RELATIONSHIP TYPES (shared across spokes)
// ============================================================================

/** Clinic department with department type relationship */
export type ClinicDepartmentWithType = DbClinicDepartment & {
  department_type?: DbDepartmentType;
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

/** General-purpose JSON type for database jsonb columns */
export type { Json } from '@/integrations/supabase/types';
/** Alias for Json — kept for backward compatibility */
export type { Json as DbJson } from '@/integrations/supabase/types';

/** Type for table relationships */
export type TableRelationship = Database['public']['Tables']['appointments']['Relationships'][0];

// ============================================================================
// EXPORT ALL TYPES FOR EASY IMPORT
// ============================================================================

export {
  // Re-export Database for compatibility during migration
  type Database,
};

// Voice Scribe re-exports
export type { AIStructuredOutput, AIExtractedPrescription } from './voice';

// ============================================================================
// FINANCIALS TYPES
// ============================================================================

export interface MonthlyData {
  month: string;
  monthLabel: string;
  revenue: number;
  billCount: number;
  avgBill: number;
}

export interface DailyData {
  day: number;
  dayLabel: string;
  revenue: number;
  billCount: number;
}

// ============================================================================
// PATIENT TYPES
// ============================================================================

export interface PatientDetail {
  patient: DbPatientByClinic | null;
  consultations: Array<Record<string, unknown>>;
  bills: Array<Record<string, unknown>>;
  hasFutureAppointment?: boolean;
}

// ============================================================================
// SUPERADMIN / CLINIC MANAGEMENT TYPES
// ============================================================================

export interface ProfileData {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export type DepartmentWithDetails = DbClinicDepartment & {
  department_types: DbDepartmentType | DbDepartmentType[] | null;
};

export interface DoctorMemberFields {
  id: string;
  primary_specialization: string | null;
  consultation_fee: number | null;
  bio: string | null;
  signature: string | null;
  google_place_id: string | null;
  google_place_data: unknown | null;
  phone: string | null;
}

export interface MemberWithDetails {
  id: string;
  user_id: string | null;
  clinic_id: string | null;
  role: UserRole;
  department_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  profile: ProfileData | null;
  department: DepartmentWithDetails | null;
  hasDoctor: boolean;
  doctor: DoctorMemberFields | null;
}

export interface InviteMemberData {
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  department_id?: string;
}

// ============================================================================
// APP STATE TYPES
// ============================================================================

export type ClinicMemberWithClinic = {
  id: string;
  user_id: string;
  clinic_id: string;
  role: UserRole;
  department_id: string | null;
  created_at: string;
  clinics: DbClinic | null;
  clinic_name?: string;
  joined_at?: string;
};

