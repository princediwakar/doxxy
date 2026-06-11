// Path: app/api/inventory/map-columns/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { logger } from '@/lib/logger';
import type { Database } from '@/integrations/supabase/types';

export const maxDuration = 30;

const GEMINI_MODELS = (process.env.GEMINI_MODELS || 'gemini-2.5-flash-lite,gemini-2.5-flash,gemini-flash-latest').split(',');

// Per-user rate limit: 10 requests per 60s window
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

async function callGemini(prompt: string): Promise<unknown> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) throw new Error('GEMINI_API_KEY not configured');

  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, responseMimeType: 'application/json', maxOutputTokens: 2048 },
      }),
    });
    if (!res.ok) continue;
    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) continue;
    try { return JSON.parse(text); } catch { continue; }
  }
  throw new Error('All Gemini models failed for column mapping');
}

const PROMPT = (headers: string[], sample: string[][]) => `
You are mapping columns from a pharmacy CSV/Excel inventory file to a standard schema.

Headers: ${JSON.stringify(headers)}
Sample rows (up to 5):
${sample.map((row, i) => `Row ${i + 1}: ${JSON.stringify(row)}`).join('\n')}

Map each header to one of these target fields (or null if it doesn't match):
- medicineName: The product/medicine name
- batchNo: Batch number or lot number
- expiryDate: Expiry or expiration date
- qty: Quantity or stock count
- mrp: MRP, selling price, or retail price
- purchasePrice: Purchase price, cost price, or rate
- supplierName: Vendor name, supplier name, or distributor name
- invoiceNumber: Bill number, invoice number, or reference number
- invoiceDate: Date of the invoice or bill

Return ONLY valid JSON in this exact shape:
{
  "mapping": {
    "medicineName": <column_index_or_null>,
    "batchNo": <column_index_or_null>,
    "expiryDate": <column_index_or_null>,
    "qty": <column_index_or_null>,
    "mrp": <column_index_or_null>,
    "purchasePrice": <column_index_or_null>,
    "supplierName": <column_index_or_null>,
    "invoiceNumber": <column_index_or_null>,
    "invoiceDate": <column_index_or_null>
  }
}

Use 0-based column indices. If a field cannot be determined from the headers and sample, use null.
`.trim();

export async function POST(request: Request) {
  // 1. Auth check
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    },
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Rate limit
  if (!checkRateLimit(user.id)) {
    return NextResponse.json({ error: 'Too many requests. Try again in a minute.' }, { status: 429 });
  }

  // 3. Validate body
  let body: { headers?: string[]; sampleRows?: string[][] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { headers, sampleRows } = body;

  if (!Array.isArray(headers) || headers.length === 0) {
    return NextResponse.json({ error: 'headers must be a non-empty array of strings' }, { status: 400 });
  }
  if (!headers.every((h) => typeof h === 'string')) {
    return NextResponse.json({ error: 'headers must be an array of strings' }, { status: 400 });
  }

  try {
    const result = await callGemini(PROMPT(headers, sampleRows ?? []));
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Column mapping error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
