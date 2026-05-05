import { getSupabase } from '@/integrations/supabase/client';
import type { ProcurementFormValues } from '@/types/pharmacy';

interface RawExtractedItem {
  raw_extracted_name: string;
  normalized_search_name: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  unit_price: number;
  mrp: number;
  total_price: number;
  medicine_id?: number | null;
  extracted_name?: string;
}

interface RawExtractionData {
  supplier_name?: string;
  invoice_number?: string;
  invoice_date?: string;
  total_amount?: number;
  items?: RawExtractedItem[];
}

export interface ExtractionResult {
  formData: ProcurementFormValues;
  matchedCount: number;
  totalCount: number;
}

export async function extractBillData(
  imageUrl: string,
): Promise<ExtractionResult> {
  const {
    data: { session },
  } = await getSupabase().auth.getSession();
  const token = session?.access_token;

  const response = await fetch('/api/procurement/extract/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ imageUrl }),
  });

  let json: Record<string, unknown> = {};
  try {
    json = (await response.json()) as Record<string, unknown>;
  } catch {
    throw new Error('Failed to parse extraction response');
  }

  if (!response.ok) {
    const serverError =
      (json?.error as string) ||
      (json?.details as string) ||
      `HTTP ${response.status}`;
    throw new Error(serverError);
  }

  const data = json.data as RawExtractionData | undefined;
  if (!data) {
    throw new Error('No data returned from extraction');
  }

  const items = data.items ?? [];
  const matchedCount = items.filter((i) => i.medicine_id).length;

  const formData: ProcurementFormValues = {
    supplier_name: data.supplier_name ?? '',
    invoice_number: data.invoice_number ?? '',
    invoice_date: data.invoice_date ?? new Date().toISOString().split('T')[0],
    total_amount: data.total_amount ?? 0,
    items: items.map((item) => ({
      extracted_name: item.extracted_name || item.raw_extracted_name || '',
      medicine_id: item.medicine_id ?? null,
      batch_number: item.batch_number ?? '',
      expiry_date: item.expiry_date ?? '',
      quantity: item.quantity ?? 1,
      unit_price: item.unit_price ?? 0,
      mrp: item.mrp ?? 0,
      total_price: item.total_price ?? 0,
    })),
  };

  return { formData, matchedCount, totalCount: items.length };
}
