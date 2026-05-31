// src/types/prescriptions.ts
// Prescriptions Module - Hub & Spoke Type Architecture

import type {
  DbPrescription,
  DbAppointment,
  DbPatient,
  DbDoctor,
  DbAppointmentWithDetails,
  DbProfile,
  PrescriptionMedication,
} from "./core";
import type { ConsultationMedication } from "@/lib/consultationNotesSchemas";

// ============================================================================
// PRESCRIPTION TYPES
// ============================================================================

/** Enhanced prescription with related entities */
export type Prescription = DbPrescription & {
  patients?: DbPatient;
  doctors?: DbDoctor;
  appointments?: DbAppointment;
};

/** Prescription with enhanced patient and doctor details */
export type PrescriptionWithDetails = Prescription & {
  patients: DbPatient;
  doctors: DbDoctor & {
    profiles?: DbProfile;
  };
  doctor_department?: string;
};

/** Prescription form values for creating/editing prescriptions */
export interface PrescriptionFormValues {
  medications: PrescriptionMedication[];
  notes?: string;
}

/** Medication frequency options */
export type MedicationFrequency =
  | "OD"
  | "BD"
  | "TDS"
  | "QID"
  | "PRN"
  | "Q4H"
  | "Q6H"
  | "Q8H"
  | "Q12H";


/** Enhanced appointment with details for prescription selection */
export type AppointmentForPrescription = DbAppointmentWithDetails;

// ============================================================================
// PRESCRIPTION MODAL TYPES
// ============================================================================

/** Props for PrescriptionViewModal */
export interface PrescriptionViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescription: Prescription | null;
}

/** Formatted medication for display */
export interface FormattedMedication {
  medication: string;
  instructions: string | null;
}

// ============================================================================
// PRESCRIPTION UTILITY TYPES
// ============================================================================

/** Medicine entity from database */
export interface Medicine {
  id: number;
  name: string;
  price: number | null;
  is_discontinued: boolean | null;
  manufacturer_name: string | null;
  pack_size_label: string | null;
  pack_type: string | null;
  short_composition1: string | null;
  short_composition2: string | null;
}

/** Medication auto-fill data for medicine selection */
export interface MedicationAutoFillData {
  dosage: string;
  route: string;
  suggestedFrequency?: string;
}

/** Medicine selection handler parameters */
export interface MedicineSelectHandlerParams {
  index: number;
  medicine: { name: string };
  autoFillData: MedicationAutoFillData;
}

// ============================================================================
// EXPORTS
// ============================================================================

export { type ConsultationMedication, type PrescriptionMedication };
