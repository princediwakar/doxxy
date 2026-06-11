// Path: lib/pharmacy-import.ts
// Pure functions — zero React, zero side effects, fully unit-testable.
// All import pipeline logic lives here so components stay thin.

import { z } from 'zod';
import type {
  ColumnMapping, ValidatedRow, ErrorRow,
  BulkProcurementGroup, ImportMode,
} from '@/types/pharmacy';

// ── Field metadata ─────────────────────────────────────────────────────────────

export const FIELD_LABELS: Record<keyof ColumnMapping, string> = {
  medicineName: 'Medicine Name',
  batchNo: 'Batch No.',
  expiryDate: 'Expiry Date',
  qty: 'Quantity',
  mrp: 'MRP (₹)',
  purchasePrice: 'Purchase Price (₹)',
  supplierName: 'Supplier',
  invoiceNumber: 'Invoice No.',
  invoiceDate: 'Invoice Date',
};

export const REQUIRED_FIELDS = ['medicineName', 'qty'] as const satisfies readonly (keyof ColumnMapping)[];
export const PROCUREMENT_FIELDS = ['supplierName', 'invoiceNumber', 'invoiceDate'] as const satisfies readonly (keyof ColumnMapping)[];

export const INITIAL_MAPPING: ColumnMapping = {
  medicineName: null, batchNo: null, expiryDate: null,
  qty: null, mrp: null, purchasePrice: null,
  supplierName: null, invoiceNumber: null, invoiceDate: null,
};

// ── Row validation schema ─────────────────────────────────────────────────────

const rowSchema = z.object({
  medicineName: z.string().min(1, 'Medicine name is required'),
  qty: z.number().min(1, 'Quantity must be ≥ 1'),
  batchNo: z.string(),
  expiryDate: z.string(),
  mrp: z.number().min(0),
  purchasePrice: z.number().min(0),
});

// ── Date parsing ───────────────────────────────────────────────────────────────

export function parseExpiryDate(raw: string | number | null): string {
  if (!raw) return '';
  if (typeof raw === 'number') {
    // Excel serial date → ISO
    const d = new Date(Math.round((raw - 25569) * 86400 * 1000));
    return d.toISOString().split('T')[0];
  }
  const str = String(raw).trim();
  const mmyy    = str.match(/^(\d{1,2})[\/\-](\d{2})$/);
  if (mmyy) return `20${mmyy[2]}-${mmyy[1].padStart(2, '0')}-01`;
  const mmyyyy  = str.match(/^(\d{1,2})[\/\-](\d{4})$/);
  if (mmyyyy) return `${mmyyyy[2]}-${mmyyyy[1].padStart(2, '0')}-01`;
  const ddmmyyyy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmmyyyy) return `${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`;
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
  return '';
}

function getCellStr(row: (string | number | null)[], idx: number | null): string {
  if (idx === null || row[idx] == null) return '';
  return String(row[idx]).trim();
}

function getCellNum(row: (string | number | null)[], idx: number | null): number {
  if (idx === null) return 0;
  const v = row[idx];
  if (v === null || v === undefined || v === '') return 0;
  return parseFloat(String(v).replace(/[₹,\s]/g, '')) || 0;
}

// ── Core pipeline functions ────────────────────────────────────────────────────

export function mappingToRawRows(
  rawRows: (string | number | null)[][],
  mapping: ColumnMapping,
): ValidatedRow[] {
  return rawRows.map((row, i) => ({
    _rowIndex: i + 2, // +1 for header, +1 for 1-indexing
    medicineName: getCellStr(row, mapping.medicineName),
    batchNo: getCellStr(row, mapping.batchNo) || 'BULK',
    expiryDate: parseExpiryDate(mapping.expiryDate !== null ? row[mapping.expiryDate!] ?? null : null),
    qty: getCellNum(row, mapping.qty),
    mrp: getCellNum(row, mapping.mrp),
    purchasePrice: getCellNum(row, mapping.purchasePrice),
    supplierName: mapping.supplierName !== null ? getCellStr(row, mapping.supplierName) || undefined : undefined,
    invoiceNumber: mapping.invoiceNumber !== null ? getCellStr(row, mapping.invoiceNumber) || undefined : undefined,
    invoiceDate:   mapping.invoiceDate !== null
      ? parseExpiryDate(row[mapping.invoiceDate!] ?? null) || undefined
      : undefined,
  }));
}

export function validateRows(rows: ValidatedRow[]): { valid: ValidatedRow[]; errors: ErrorRow[] } {
  const valid: ValidatedRow[] = [];
  const errors: ErrorRow[] = [];
  for (const row of rows) {
    const result = rowSchema.safeParse(row);
    if (result.success) {
      valid.push(row);
    } else {
      errors.push({
        _rowIndex: row._rowIndex,
        rawName: row.medicineName || '(empty)',
        errors: result.error.errors.map((e) => e.message),
      });
    }
  }
  return { valid, errors };
}

export function buildProcurementGroups(
  rows: ValidatedRow[],
  mode: ImportMode,
  vendorName: string,
  invoiceNo: string,
  today: string,
): BulkProcurementGroup[] {
  const makeItem = (r: ValidatedRow) => ({
    medicine_name: r.medicineName,
    medicine_id: r.medicineId ?? null,
    batch_number: r.batchNo,
    expiry_date: r.expiryDate,
    quantity: r.qty,
    unit_price: r.purchasePrice,
    mrp: r.mrp,
    total_price: r.purchasePrice * r.qty,
  });

  if (mode === 'opening_balance') {
    return [{
      supplier_name: 'System Migration',
      invoice_number: `OPENING-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      invoice_date: today,
      total_amount: rows.reduce((s, r) => s + r.purchasePrice * r.qty, 0),
      procurement_type: 'OPENING_BALANCE',
      items: rows.map(makeItem),
    }];
  }

  if (mode === 'single_vendor') {
    return [{
      supplier_name: vendorName || 'Unknown Supplier',
      invoice_number: invoiceNo || `BULK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      invoice_date: today,
      total_amount: rows.reduce((s, r) => s + r.purchasePrice * r.qty, 0),
      procurement_type: 'INVOICE',
      items: rows.map(makeItem),
    }];
  }

  // multi_vendor: group by supplier::invoice key (stable insertion order preserved)
  const groups = new Map<string, BulkProcurementGroup>();
  for (const row of rows) {
    const supplier = row.supplierName || 'Unknown Supplier';
    const invoice  = row.invoiceNumber || `BULK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const key = `${supplier}::${invoice}`;
    if (!groups.has(key)) {
      groups.set(key, {
        supplier_name: supplier,
        invoice_number: invoice,
        invoice_date: row.invoiceDate || today,
        total_amount: 0,
        procurement_type: 'INVOICE',
        items: [],
      });
    }
    const group = groups.get(key)!;
    const item = makeItem(row);
    group.total_amount += item.total_price;
    group.items.push(item);
  }
  return Array.from(groups.values());
}

// ── Error export ───────────────────────────────────────────────────────────────

export function errorRowsToCSV(errors: ErrorRow[]): string {
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const header = 'Row,Medicine,Issues';
  const rows = errors.map((e) => `${e._rowIndex},${esc(e.rawName)},${esc(e.errors.join('; '))}`);
  return [header, ...rows].join('\n');
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
