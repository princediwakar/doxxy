// src/types/billing.ts
// Billing Module - Hub & Spoke Type Architecture

import type { DbBill, DbPatient, BillStatus, Json } from "./core";
import type { UseFormReturn } from "react-hook-form";
import type { UseMutationResult } from "@tanstack/react-query";

// ============================================================================
// BILLING TYPES
// ============================================================================

/** Base bill type */
export type Bill = Omit<DbBill, 'service_items'> & {
  service_items?: ServiceItem[] | null;
};

/** Service item in a bill */
export interface ServiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

/** Billing form values */
export interface BillingFormValues {
  patient_id: string;
  appointment_id: string | null;
  invoice_number: string;
  amount?: number;
  description?: string | null;
  service_items?: ServiceItem[];
  discount_percentage: number;
  tax_percentage: number;
  notes?: string;
}

/** Enhanced appointment for billing context */
export interface AppointmentForBilling {
  id: string;
  patient_id: string;
  doctor_id: string;
  patient_name?: string;
  doctor_name?: string;
  date: string;
  time: string;
  department_name?: string;
}

// ============================================================================
// BILLING HOOK TYPES
// ============================================================================

/** Props for useBilling hook */
export interface UseBillingProps {
  bill?: Bill | null;
  patient?: DbPatient | null;
  appointment?: AppointmentForBilling | null;
  mode?: "create" | "view" | "edit";
  open: boolean;
}

/** Doctor fee information */
export interface DoctorFeeInfo {
  consultation_fee: number;
  doctor_name: string;
}

/** Calculated totals for billing */
export interface BillingTotals {
  subtotal: number;
  discountAmount: number;
  subtotalAfterDiscount: number;
  taxAmount: number;
  total: number;
}

/** Return type from useBilling hook */
export interface UseBillingReturn {
  form: UseFormReturn<BillingFormValues>;
  appointments: AppointmentForBilling[];
  patients: DbPatient[];
  isLoadingInvoiceNumber: boolean;
  isLoadingAppointments: boolean;
  isLoadingPatients: boolean;
  selectedAppointment: AppointmentForBilling | undefined;
  doctorFee: DoctorFeeInfo | null;
  calculateTotals: BillingTotals;
  addServiceItem: () => void;
  removeServiceItem: (index: number) => void;
  updateServiceItem: (
    index: number,
    field: keyof ServiceItem,
    value: string | number
  ) => void;
  saveBillMutation: UseMutationResult<DbBill, Error, BillingFormValues>;
  isSubmitting: boolean;
  refetchInvoiceNumber: () => void;
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

/** Payment transaction type */
export interface PaymentTransaction {
  id: string;
  clinic_id: string;
  bill_id?: string;
  amount: number;
  payment_method: string;
  status: "pending" | "completed" | "failed" | "refunded";
  transaction_type?: "credit_purchase" | "bill_payment";
  credits_purchased?: number;
  razorpay_payment_id?: string;
  created_at: string;
  updated_at: string;
}

/** Payment form values */
export interface PaymentFormValues {
  bill_id: string;
  amount: number;
  payment_method: string;
  notes?: string;
}

// ============================================================================
// EXPORTS
// ============================================================================

export { type BillStatus, type Json };
