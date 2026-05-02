// src/types/doctor.ts
import { DbDoctor, DbClinicDepartment, DbDepartmentType, ClinicDepartmentWithType } from './core';

// ============================================================================
// ENHANCED DATABASE TYPES WITH RELATIONSHIPS
// ============================================================================

/** Doctor with department relationship */
export type DoctorWithDepartment = DbDoctor & {
  clinic_department?: ClinicDepartmentWithType;
};

