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
