// components/billing/billingPrintUtils.ts
import { DbPatient } from '@/types/core';
import { Bill } from '@/types/billing';

type BillWithPotentialDetails = Bill & {
  patient?: { name?: string } | null;
  patient_name?: string;
};

function getPatientName(bill: Bill, patient: DbPatient | null): string {
  if (patient?.name) return patient.name;
  const enhancedBill = bill as BillWithPotentialDetails;
  return enhancedBill.patient?.name || enhancedBill.patient_name || 'Patient';
}

export function generateBillFilename(bill: Bill, patient: DbPatient | null, clinicName?: string | null): string {
  const name = getPatientName(bill, patient);
  const safeName = name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
  const dateStr = bill.created_at ? new Date(bill.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  return `${safeName}_${dateStr}_Bill`;
}
