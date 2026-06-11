// Path: lib/stock.ts
// Pure utility — no DB calls. Extracts stock-delta logic for reuse across billing and bulk import.

export interface StockServiceItem {
  inventory_item_id?: string | null;
  quantity: number;
  source?: string | null;
}

/** Returns only the items that should trigger a stock deduction (source=inventory with a valid item id) */
export function extractInventoryItems(serviceItems: StockServiceItem[]): { inventory_item_id: string; quantity: number }[] {
  const result: { inventory_item_id: string; quantity: number }[] = [];
  for (const i of serviceItems) {
    if (i.source === 'inventory' && typeof i.inventory_item_id === 'string' && i.inventory_item_id.length > 0) {
      result.push({ inventory_item_id: i.inventory_item_id, quantity: i.quantity });
    }
  }
  return result;
}

export interface StockDiff {
  toRestore: Array<{ inventory_item_id: string; quantity: number }>;
  toDecrement: Array<{ inventory_item_id: string; quantity: number }>;
}

/**
 * Computes which items need to be restored (old items no longer in updated bill)
 * and which need to be decremented (new items not in old bill).
 * Handles qty changes on the same inventory_item_id.
 */
export function diffStockItems(
  oldItems: StockServiceItem[],
  newItems: StockServiceItem[],
): StockDiff {
  const oldMap = new Map<string, number>();
  for (const item of extractInventoryItems(oldItems)) {
    oldMap.set(item.inventory_item_id, (oldMap.get(item.inventory_item_id) ?? 0) + item.quantity);
  }

  const newMap = new Map<string, number>();
  for (const item of extractInventoryItems(newItems)) {
    newMap.set(item.inventory_item_id, (newMap.get(item.inventory_item_id) ?? 0) + item.quantity);
  }

  const allIds = Array.from(new Set([...Array.from(oldMap.keys()), ...Array.from(newMap.keys())]));
  const toRestore: StockDiff['toRestore'] = [];
  const toDecrement: StockDiff['toDecrement'] = [];

  for (const id of allIds) {
    const oldQty = oldMap.get(id) ?? 0;
    const newQty = newMap.get(id) ?? 0;
    const delta = newQty - oldQty;

    if (delta > 0) {
      toDecrement.push({ inventory_item_id: id, quantity: delta });
    } else if (delta < 0) {
      toRestore.push({ inventory_item_id: id, quantity: Math.abs(delta) });
    }
    // delta === 0 → no change
  }

  return { toRestore, toDecrement };
}
