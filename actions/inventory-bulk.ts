// Path: actions/inventory-bulk.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/integrations/supabase/server';

export interface BulkImportRow {
  medicineName: string;
  medicineId?: number | null;
  batchNo: string;
  expiryDate: string;     // YYYY-MM-DD
  qty: number;
  mrp: number;
  purchasePrice: number;
  mergeWithExisting?: boolean;  // true = add qty to existing batch, false = new batch entry
  // Procurement metadata — populated when supplier/invoice columns are present in the spreadsheet
  supplierName?: string;
  invoiceNumber?: string;
  invoiceDate?: string;   // YYYY-MM-DD
}

export interface BulkImportResult {
  inserted: number;
  updated: number;
  newMedicines: number;
  error?: string;
}

/**
 * @deprecated Use `saveBulkProcurements` from `actions/inventory.ts` for all new bulk flows.
 * Retained as a direct inventory-only fallback until the procurement-linked flow is proven stable.
 */
export async function bulkImportInventory(input: {
  clinicId: string;
  rows: BulkImportRow[];
}): Promise<BulkImportResult> {
  const supabase = await createServerSupabase();

  if (!input.clinicId) return { inserted: 0, updated: 0, newMedicines: 0, error: 'No clinic selected.' };
  if (!input.rows.length) return { inserted: 0, updated: 0, newMedicines: 0 };

  // 1. Resolve medicine IDs for rows without them (atomic RPC)
  const unmappedNames = Array.from(new Set(
    input.rows
      .filter((r) => !r.medicineId && r.medicineName.trim())
      .map((r) => r.medicineName.trim())
  ));

  const nameToIdMap = new Map<string, number>();

  if (unmappedNames.length > 0) {
    const { data: allMeds, error: medError } = await supabase
      .rpc('get_or_create_medicines', { med_names: unmappedNames });

    if (medError) return { inserted: 0, updated: 0, newMedicines: 0, error: medError.message };
    for (const med of allMeds ?? []) {
      nameToIdMap.set(med.name, med.id);
    }
  }

  // Resolve all medicine IDs
  const resolvedRows = input.rows
    .map((row) => ({
      ...row,
      resolvedMedicineId: row.medicineId ?? nameToIdMap.get(row.medicineName.trim()) ?? null,
    }))
    .filter((r) => r.resolvedMedicineId !== null) as (BulkImportRow & { resolvedMedicineId: number })[];

  if (!resolvedRows.length) return { inserted: 0, updated: 0, newMedicines: nameToIdMap.size };

  // 2. Bulk upsert via single atomic RPC — PostgreSQL handles conflict detection,
  //    expiry matching, merge vs. insert logic, and stock_transactions logging.
  const rpcPayload = resolvedRows.map((row) => ({
    medicine_id: row.resolvedMedicineId,
    batch_number: row.batchNo,
    expiry_date: row.expiryDate,
    quantity: row.qty,
    mrp: row.mrp,
    unit_cost_price: row.purchasePrice,
    merge_with_existing: row.mergeWithExisting,
  }));

  const { data, error: bulkError } = await supabase
    .rpc('bulk_upsert_inventory', { p_rows: rpcPayload, p_clinic_id: input.clinicId });

  if (bulkError) return { inserted: 0, updated: 0, newMedicines: nameToIdMap.size, error: bulkError.message };

  const result = data as { inserted: number; updated: number } | null;

  revalidatePath('/pharmacy');
  return { inserted: result?.inserted ?? 0, updated: result?.updated ?? 0, newMedicines: nameToIdMap.size };
}
