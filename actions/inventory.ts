// Path: actions/inventory.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/integrations/supabase/server';
import type { DbMedicineInsert, DbMedicineUpdate, DbProcurementInsert, DbInventoryItemUpdate, DbProcurementItemInsert } from '@/types/core';

export async function addMedicine(data: DbMedicineInsert) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('medicines').insert(data);
  if (error) return { error: error.message };
  revalidatePath('/pharmacy');
  return { success: true };
}

export async function updateMedicine(id: number, data: DbMedicineUpdate) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('medicines').update(data).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/pharmacy');
  return { success: true };
}

export async function deleteMedicine(id: number) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('medicines').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/pharmacy');
  return { success: true };
}

export async function createProcurement(data: DbProcurementInsert) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('procurements').insert(data);
  if (error) return { error: error.message };
  revalidatePath('/pharmacy');
  return { success: true };
}

export async function updateStock(itemId: string, newStock: number) {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from('inventory_items')
    .update({ current_stock: newStock } as DbInventoryItemUpdate)
    .eq('id', itemId);
  if (error) return { error: error.message };
  revalidatePath('/pharmacy');
  return { success: true };
}

export async function updateItem(item: {
  id: string;
  batch_number: string;
  expiry_date: string;
  current_stock: number;
  reorder_level: number;
  unit_cost_price: number;
  mrp: number;
}) {
  const supabase = await createServerSupabase();
  const { id, ...fields } = item;
  const { error } = await supabase
    .from('inventory_items')
    .update(fields as DbInventoryItemUpdate)
    .eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/pharmacy');
  return { success: true };
}

interface ProcurementItemInput {
  extracted_name?: string;
  medicine_id?: number | null;
  batch_number?: string;
  expiry_date?: string;
  quantity: number;
  unit_price: number;
  mrp?: number;
  total_price: number;
}

interface SaveFullProcurementInput {
  clinicId: string;
  userId: string;
  supplier_name: string;
  invoice_number: string;
  invoice_date: string;
  total_amount: number;
  procurement_type?: 'INVOICE' | 'OPENING_BALANCE' | 'RECONCILIATION';
  items: ProcurementItemInput[];
}

export async function saveFullProcurement(input: SaveFullProcurementInput) {
  const supabase = await createServerSupabase();

  // 1. Create procurement header
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: procurement, error: procError } = await (supabase as any)
    .from('procurements')
    .insert({
      clinic_id: input.clinicId,
      supplier_name: input.supplier_name,
      invoice_number: input.invoice_number,
      invoice_date: input.invoice_date,
      total_amount: input.total_amount,
      status: 'Completed',
      created_by: input.userId,
      procurement_type: input.procurement_type ?? 'INVOICE',
    })
    .select()
    .single();

  if (procError) return { error: procError.message };
  if (!input.items || input.items.length === 0) {
    revalidatePath('/pharmacy');
    return { procurement, createdCount: 0 };
  }

  // 2. Batch-create unmapped medicines
  const unmappedNames = input.items
    .filter((item) => !item.medicine_id && item.extracted_name?.trim())
    .map((item) => item.extracted_name!.trim());

  const uniqueUnmapped = unmappedNames.filter(
    (name, i) => unmappedNames.indexOf(name) === i,
  );
  const nameToIdMap = new Map<string, number>();

  if (uniqueUnmapped.length > 0) {
    const { data: allMeds, error: medError } = await supabase
      .rpc('get_or_create_medicines', { med_names: uniqueUnmapped });

    if (medError) return { error: medError.message };

    for (const med of allMeds ?? []) {
      nameToIdMap.set(med.name, med.id);
    }
  }

  // 3. Insert procurement_items
  const itemInserts: DbProcurementItemInsert[] = [];
  const inventoryUpserts: {
    clinic_id: string;
    medicine_id: number;
    batch_number: string;
    expiry_date: string;
    current_stock: number;
    unit_cost_price: number;
    mrp: number;
  }[] = [];

  for (const item of input.items) {
    const medicineId =
      item.medicine_id ?? nameToIdMap.get(item.extracted_name ?? '') ?? null;

    itemInserts.push({
      procurement_id: procurement.id,
      medicine_id: medicineId as number,
      extracted_name: item.extracted_name ?? '',
      batch_number: item.batch_number ?? '',
      expiry_date: item.expiry_date || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    });

    if (medicineId) {
      inventoryUpserts.push({
        clinic_id: input.clinicId,
        medicine_id: medicineId,
        batch_number: item.batch_number ?? '',
        expiry_date: item.expiry_date ?? '',
        current_stock: item.quantity,
        unit_cost_price: item.unit_price,
        mrp: item.mrp ?? 0,
      });
    }
  }

  const { error: itemsError } = await supabase
    .from('procurement_items')
    .insert(itemInserts);
  if (itemsError) return { error: itemsError.message };

  // 4. Batch-upsert inventory_items via atomic RPC (replaces N+1 loop)
  if (inventoryUpserts.length > 0 && procurement?.id) {
    const payload = inventoryUpserts.map((inv) => ({
      ...inv,
      merge_with_existing: true,
    }));
    
    // bulk_upsert_inventory handles both the inventory insert/update AND the 
    // stock_transactions audit trail linking (via the p_reference_id param).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: upsertError } = await (supabase as any).rpc('bulk_upsert_inventory', {
      p_inventory_data: payload,
      p_clinic_id: input.clinicId,
      p_reference_id: procurement.id,
    });
    
    if (upsertError) return { error: upsertError.message };
  }

  revalidatePath('/pharmacy');
  return { procurement, createdCount: nameToIdMap.size };
}

// ── Procurement types for bulk flow ──────────────────────────────────────────
import type { BulkProcurementGroup } from '@/types/pharmacy';

export interface SaveBulkProcurementsResult {
  procurements_created: number;
  inventory_inserted: number;
  inventory_updated: number;
  error?: string;
}

export async function saveBulkProcurements(input: {
  clinicId: string;
  userId: string;
  procurements: BulkProcurementGroup[];
}): Promise<SaveBulkProcurementsResult> {
  const supabase = await createServerSupabase();

  if (!input.clinicId) return { procurements_created: 0, inventory_inserted: 0, inventory_updated: 0, error: 'No clinic selected.' };
  if (!input.procurements.length) return { procurements_created: 0, inventory_inserted: 0, inventory_updated: 0 };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('bulk_process_procurements', {
    p_clinic_id: input.clinicId,
    p_created_by: input.userId,
    p_procurements: input.procurements as unknown as Record<string, unknown>[],
  });

  if (error) return { procurements_created: 0, inventory_inserted: 0, inventory_updated: 0, error: error.message };

  const result = data as { procurements_created: number; inventory_inserted: number; inventory_updated: number } | null;
  revalidatePath('/pharmacy');
  return {
    procurements_created: result?.procurements_created ?? 0,
    inventory_inserted: result?.inventory_inserted ?? 0,
    inventory_updated: result?.inventory_updated ?? 0,
  };
}
