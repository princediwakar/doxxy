'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/integrations/supabase/server';
import type { DbBillInsert, DbBillUpdate, Json } from '@/types/core';

interface SaveBillParams {
  patient_id: string;
  appointment_id: string | null;
  clinic_id: string;
  amount: number;
  description?: string | null;
  service_items?: Json;
  discount_percentage?: number;
  tax_percentage?: number;
  notes?: string;
}

export async function saveBill(
  mode: 'create' | 'edit',
  data: SaveBillParams,
  billId?: string,
) {
  const supabase = await createServerSupabase();

  const billData = {
    patient_id: data.patient_id,
    appointment_id: data.appointment_id,
    clinic_id: data.clinic_id,
    amount: data.amount,
    description: data.description,
    service_items: data.service_items as Json,
    discount_percentage: data.discount_percentage,
    tax_percentage: data.tax_percentage,
    notes: data.notes,
  };

  if (mode === 'edit' && billId) {
    const { data: bill, error } = await supabase
      .from('bills')
      .update(billData as DbBillUpdate)
      .eq('id', billId)
      .select()
      .single();
    if (error) return { error: error.message, code: error.code };
    revalidatePath('/schedule');
    return { success: true, data: bill };
  }

  const invoiceResult = await generateInvoiceNumber(data.clinic_id);
  if (invoiceResult.error) return { error: invoiceResult.error };

  const { data: bill, error } = await supabase
    .from('bills')
    .insert({ ...billData, invoice_number: invoiceResult.data } as DbBillInsert)
    .select()
    .single();
  if (error) return { error: error.message, code: error.code };

  revalidatePath('/schedule');
  return { success: true, data: bill };
}

async function generateInvoiceNumber(clinicId: string) {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase.rpc('generate_invoice_number', {
    clinic_id_arg: clinicId,
  });

  if (error || !data) {
    return { error: 'Failed to generate invoice number. Please try again.' };
  }

  return { data: data as string };
}
