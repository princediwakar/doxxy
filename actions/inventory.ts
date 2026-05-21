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
  items: ProcurementItemInput[];
}

export async function saveFullProcurement(input: SaveFullProcurementInput) {
  const supabase = await createServerSupabase();

  // 1. Create procurement header
  const { data: procurement, error: procError } = await supabase
    .from('procurements')
    .insert({
      clinic_id: input.clinicId,
      supplier_name: input.supplier_name,
      invoice_number: input.invoice_number,
      invoice_date: input.invoice_date,
      total_amount: input.total_amount,
      status: 'Completed',
      created_by: input.userId,
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
    const { data: createdMeds, error: medError } = await supabase
      .from('medicines')
      .upsert(
        uniqueUnmapped.map((name) => ({ name, is_auto_created: true })),
        { onConflict: 'name', ignoreDuplicates: false },
      )
      .select('id, name');

    if (medError) return { error: medError.message };

    for (const med of createdMeds ?? []) {
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

  // 4. Upsert inventory_items
  for (const inv of inventoryUpserts) {
    const { data: existing } = await supabase
      .from('inventory_items')
      .select('id, current_stock')
      .eq('clinic_id', input.clinicId)
      .eq('medicine_id', inv.medicine_id)
      .eq('batch_number', inv.batch_number)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('inventory_items')
        .update({
          current_stock: existing.current_stock + inv.current_stock,
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('inventory_items').insert(inv);
    }
  }

  revalidatePath('/pharmacy');
  return { procurement, createdCount: nameToIdMap.size };
}
