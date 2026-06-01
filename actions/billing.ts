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
    if (error) return { error: error.message };
    revalidatePath('/schedule');
    return { success: true, data: bill };
  }

  const { data: invoice_number } = await generateInvoiceNumber(data.clinic_id);

  const { data: bill, error } = await supabase
    .from('bills')
    .insert({ ...billData, invoice_number } as DbBillInsert)
    .select()
    .single();
  if (error) return { error: error.message };

  revalidatePath('/schedule');
  return { success: true, data: bill };
}

async function generateInvoiceNumber(clinicId: string) {
  const supabase = await createServerSupabase();

  try {
    const { data, error } = await supabase.rpc('generate_invoice_number', {
      clinic_id_arg: clinicId,
    });
    if (!error && data) return { data: data as string };
  } catch {
    // fall through to fallback
  }

  try {
    const { data: latestBill } = await supabase
      .from('bills')
      .select('invoice_number')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestBill?.invoice_number) {
      const seq = parseInt(latestBill.invoice_number.slice(-6), 10) + 1;
      const prefix = latestBill.invoice_number.slice(0, -6);
      return { data: prefix + String(seq).padStart(6, '0') };
    }
  } catch {
    // fall through to last resort
  }

  const clinic = await supabase
    .from('clinics')
    .select('name')
    .eq('id', clinicId)
    .single();

  const clinicPrefix = (clinic.data?.name?.charAt(0) || 'C').toUpperCase();
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, '0');

  return { data: `${clinicPrefix}${year}${timestamp}${random}` };
}
