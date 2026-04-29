// src/types/doctor.ts
import { DbDoctor, DbClinicDepartment, DbDepartmentType, ClinicDepartmentWithType } from './core';

// ============================================================================
// ENHANCED DATABASE TYPES WITH RELATIONSHIPS
// ============================================================================

/** Doctor with department relationship */
export type DoctorWithDepartment = DbDoctor & {
  clinic_department?: ClinicDepartmentWithType;
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
  open: boolean;           // Fixed: Changed from isOpen to match component
  onClose: () => void;
  doctorProfile?: DbDoctor; // Fixed: Changed from doctor to match component & made optional
  onSuccess?: () => void;  // Fixed: Added missing prop
}

// ============================================================================
// EXPORTS
// ============================================================================

export * as DoctorTypes from './doctor';