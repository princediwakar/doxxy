import { z } from 'zod';
import { zField } from '@/lib/schemaUtils';

// ============================================================================
// PROCUREMENT SCHEMA (The AI digitized bill form)
// ============================================================================

export const procurementItemSchema = z.object({
  id: z.string().optional(),
  medicine_id: z.number().nullable().optional(),
  extracted_name: zField("extracted_name", z.string().min(1, 'Name is required'), {
    label: 'Medicine Name',
    placeholder: 'Paracetamol 500mg',
    section: 'Bill Items',
  }),
  batch_number: zField("batch_number", z.string().min(1, 'Batch required'), {
    label: 'Batch No.',
    placeholder: 'B1234',
    section: 'Bill Items',
  }),
  expiry_date: zField("expiry_date", z.string().min(1, 'Expiry required'), {
    label: 'Expiry Date',
    placeholder: 'YYYY-MM',
    section: 'Bill Items',
  }),
  quantity: zField("quantity", z.coerce.number().min(1, 'Quantity > 0'), {
    label: 'Quantity',
    placeholder: '10',
    section: 'Bill Items',
  }),
  unit_price: zField("unit_price", z.coerce.number().min(0, 'Price >= 0'), {
    label: 'Unit Price',
    placeholder: '0.00',
    section: 'Bill Items',
  }),
  mrp: zField("mrp", z.coerce.number().min(0, 'MRP >= 0'), {
    label: 'M.R.P',
    placeholder: '0.00',
    section: 'Bill Items',
  }),
  total_price: zField("total_price", z.coerce.number().min(0, 'Total >= 0'), {
    label: 'Total Price',
    placeholder: '0.00',
    section: 'Bill Items',
  }),
});

export const procurementSchema = z.object({
  id: z.string().optional(),
  supplier_name: zField("supplier_name", z.string().min(1, 'Supplier Name is required'), {
    label: 'Supplier Name',
    placeholder: 'e.g. Apollo Distributors',
    section: 'Invoice Details',
  }),
  invoice_number: zField("invoice_number", z.string().min(1, 'Invoice Number is required'), {
    label: 'Invoice Number',
    placeholder: 'INV-001',
    section: 'Invoice Details',
  }),
  invoice_date: zField("invoice_date", z.string().min(1, 'Invoice Date is required'), {
    label: 'Invoice Date',
    placeholder: 'YYYY-MM-DD',
    section: 'Invoice Details',
  }),
  total_amount: zField("total_amount", z.coerce.number().min(0, 'Amount must be >= 0'), {
    label: 'Total Amount',
    placeholder: '0.00',
    section: 'Invoice Details',
  }),
  items: z.array(procurementItemSchema).optional(),
});

export type ProcurementFormValues = z.infer<typeof procurementSchema>;
export type ProcurementItemFormValues = z.infer<typeof procurementItemSchema>;

// ============================================================================
// INVENTORY SCHEMA (For manual adjustments if needed)
// ============================================================================

export const inventoryItemSchema = z.object({
  id: z.string().optional(),
  medicine_id: z.number().nullable().optional(),
  medicine_name: zField("medicine_name", z.string().min(1, 'Medicine Name is required'), {
    label: 'Medicine Name',
    section: 'Inventory Details',
  }),
  batch_number: zField("batch_number", z.string().min(1, 'Batch required'), {
    label: 'Batch No.',
    section: 'Inventory Details',
  }),
  expiry_date: zField("expiry_date", z.string().min(1, 'Expiry required'), {
    label: 'Expiry Date',
    section: 'Inventory Details',
  }),
  current_stock: zField("current_stock", z.coerce.number().min(0, 'Stock cannot be negative'), {
    label: 'Current Stock',
    section: 'Stock Information',
  }),
  reorder_level: zField("reorder_level", z.coerce.number().min(0, 'Level cannot be negative'), {
    label: 'Reorder Level',
    section: 'Stock Information',
  }),
  unit_cost_price: zField("unit_cost_price", z.coerce.number().min(0, 'Price >= 0'), {
    label: 'Cost Price',
    section: 'Pricing',
  }),
  mrp: zField("mrp", z.coerce.number().min(0, 'MRP >= 0'), {
    label: 'MRP',
    section: 'Pricing',
  }),
});

export type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>;

// ============================================================================
// BULK IMPORT TYPES (Column mapping, state machine, procurement groups)
// ============================================================================

export type ImportMode = 'opening_balance' | 'single_vendor' | 'multi_vendor';

export type ColumnField =
  | 'medicineName' | 'batchNo' | 'expiryDate'
  | 'qty' | 'mrp' | 'purchasePrice'
  | 'supplierName' | 'invoiceNumber' | 'invoiceDate';

export type ColumnMapping = Record<ColumnField, number | null>;

export interface ParsedFile {
  headers: string[];
  rows: string[][];
  rawRows: (string | number | null)[][];
}

export interface ValidatedRow {
  _rowIndex: number;
  medicineName: string;
  medicineId?: number | null;
  batchNo: string;
  expiryDate: string;
  qty: number;
  mrp: number;
  purchasePrice: number;
  supplierName?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
}

export interface ErrorRow {
  _rowIndex: number;
  rawName: string;
  errors: string[];
}

export interface BulkProcurementItem {
  medicine_name: string;
  medicine_id?: number | null;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  unit_price: number;
  mrp: number;
  total_price: number;
}

export interface BulkProcurementGroup {
  supplier_name: string;
  invoice_number: string;
  invoice_date: string;
  total_amount: number;
  procurement_type: 'INVOICE' | 'OPENING_BALANCE' | 'RECONCILIATION';
  items: BulkProcurementItem[];
}

export interface ImportResult {
  procurements_created: number;
  inventory_inserted: number;
  inventory_updated: number;
  error?: string;
}

/**
 * Discriminated union state machine — flow: Upload → Map → Intent → Validate → Preview.
 *
 * Intent is shown only when no Supplier Name column was mapped (AI or manual).
 * If a supplier column IS mapped, multi-vendor mode is auto-inferred and Intent is skipped.
 */
export type ImportStep =
  | { type: 'upload' }
  | { type: 'parsing';     parsed: ParsedFile; mapping: ColumnMapping }
  | { type: 'config';      parsed: ParsedFile; mapping: ColumnMapping }
  | { type: 'preview';     mode: ImportMode; parsed: ParsedFile; mapping: ColumnMapping; groups: BulkProcurementGroup[]; mergeAll: boolean; validCount: number; errors: ErrorRow[] }
  | { type: 'importing';   groups: BulkProcurementGroup[] }
  | { type: 'done';        result: ImportResult };
