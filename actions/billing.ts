// Path: actions/billing.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/integrations/supabase/server';
import type { DbBillInsert, DbBillUpdate, Json } from '@/types/core';
import { extractInventoryItems, diffStockItems } from '@/lib/stock';

interface ServiceItemRaw {
  inventory_item_id?: string | null;
  quantity: number;
  source?: string | null;
  [key: string]: unknown;
}

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
  if (!data.patient_id) return { error: 'Patient is required.' };

  const supabase = await createServerSupabase();
  const newItems = (data.service_items as ServiceItemRaw[] | null) ?? [];

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

  // ── EDIT ──────────────────────────────────────────────────────────────────
  if (mode === 'edit' && billId) {
    // Fetch the old bill to diff stock items — must scope to clinic
    const { data: oldBill } = await supabase
      .from('bills')
      .select('service_items')
      .eq('id', billId)
      .eq('clinic_id', data.clinic_id)
      .single();

    const { data: bill, error } = await supabase
      .from('bills')
      .update(billData as DbBillUpdate)
      .eq('id', billId)
      .eq('clinic_id', data.clinic_id)
      .select()
      .single();

    if (error) return { error: error.message, code: error.code };

    // Compute stock delta and apply in one atomic bulk RPC
    const oldItems = (oldBill?.service_items as ServiceItemRaw[] | null) ?? [];
    const { toRestore, toDecrement } = diffStockItems(oldItems, newItems);

    if (toRestore.length > 0 || toDecrement.length > 0) {
      const { error: bulkError } = await supabase.rpc('bulk_process_stock_delta', {
        p_to_restore: toRestore,
        p_to_decrement: toDecrement,
        p_bill_id: billId,
        p_clinic_id: data.clinic_id,
      });
      if (bulkError) return { error: bulkError.message };
    }

    revalidatePath('/schedule');
    revalidatePath('/pharmacy');
    return { success: true, data: bill };
  }

  // ── CREATE ────────────────────────────────────────────────────────────────
  const invoiceResult = await generateInvoiceNumber(data.clinic_id);
  if (invoiceResult.error) return { error: invoiceResult.error };

  const { data: bill, error } = await supabase
    .from('bills')
    .insert({ ...billData, invoice_number: invoiceResult.data } as DbBillInsert)
    .select()
    .single();

  if (error) return { error: error.message, code: error.code };

  // Decrement stock for all inventory items in one atomic bulk RPC
  const inventoryItems = extractInventoryItems(newItems);

  if (inventoryItems.length > 0) {
    const { error: bulkError } = await supabase.rpc('bulk_process_stock_delta', {
      p_to_restore: [],
      p_to_decrement: inventoryItems,
      p_bill_id: bill.id,
      p_clinic_id: data.clinic_id,
    });
    if (bulkError) {
      // If stock was insufficient, the entire transaction rolled back.
      // Delete the bill we just created so we don't leave an orphan.
      await supabase.from('bills').delete().eq('id', bill.id);
      return { error: bulkError.message };
    }
  }

  revalidatePath('/schedule');
  revalidatePath('/pharmacy');
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
