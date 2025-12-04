// src/types/doctor.ts
// Doctor Module Type Definitions - Hub & Spoke Architecture

import { DbDoctor, DbClinicDepartment, DbDepartmentType } from './core';

// ============================================================================
// ENHANCED DATABASE TYPES WITH RELATIONSHIPS
// ============================================================================

/** Doctor with department relationship */
export type DoctorWithDepartment = DbDoctor & {
  clinic_department?: ClinicDepartmentWithType;
};

/** Clinic department with type relationship */
export type ClinicDepartmentWithType = DbClinicDepartment & {
  department_type?: DbDepartmentType;
};

/** Department information for medical credentials */
export type Department = {
  id: string;
  department_types: {
    name: string;
  } | null;
};

// ============================================================================
// COMPONENT-SPECIFIC TYPES
// ============================================================================

/** Medical credentials modal props */
export interface MedicalCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: DbDoctor;
}

// ============================================================================
// EXPORTS
// ============================================================================

// Export all types as namespace for easy access
export * as DoctorTypes from './doctor';