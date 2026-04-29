// app/api/procurement/extract/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export const maxDuration = 60;

// ─── Types ───────────────────────────────────────────────────────────────────

interface ExtractedItem {
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

interface MatchResult {
  original_search_term: string;
  matched_id: number | null;
  matched_name: string | null;
  similarity_score: number;
}

interface MedicineLookup {
  id: number;
  name: string;
}

interface GeminiResponse {
  candidates?: {
    finishReason?: string;
    content?: {
      parts?: { text?: string }[];
    };
  }[];
}

interface AIMatchResult {
  term?: string;
  matched_id?: number | null;
  matched_name?: string | null;
}

// ─── Model fallback chain ─────────────────────────────────────────────────────
// Tries each model in order until one works.
// Add/remove model strings here as Gemini updates their API.

const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-3.1-flash-lite-preview',
  'gemini-3-flash-preview',
  'gemini-flash-latest',
];

async function callGemini(
  prompt: string,
  imageBase64?: string,
  mimeType?: string
): Promise<unknown> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) throw new Error('GEMINI_API_KEY not configured in environment variables');

  const parts: object[] = [{ text: prompt }];
  if (imageBase64 && mimeType) {
    parts.push({ inlineData: { mimeType, data: imageBase64 } });
  }

  const body = JSON.stringify({
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.1,
      topP: 0.8,
      maxOutputTokens: 65536, // was 8192 — invoice JSON was being truncated mid-response
      responseMimeType: 'application/json',
    },
  });

  let lastError = '';

  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
    } catch (networkErr) {
      lastError = `Network error for model ${model}: ${networkErr}`;
      logger.error(lastError);
      continue;
    }

    const responseText = await res.text();

    if (!res.ok) {
      // 404 = model not found → try next
      // 400 = bad request → log and try next
      // 429 = quota → stop trying
      // 503 = service unavailable → stop trying
      lastError = `Model ${model} → HTTP ${res.status}: ${responseText.slice(0, 300)}`;
      logger.error('Gemini model error:', lastError);

      if (res.status === 429 || res.status === 503) {
        throw new Error(`Gemini quota/unavailable (${res.status}): ${responseText.slice(0, 200)}`);
      }
      // 404/400 → try next model
      continue;
    }

    // Parse response
    let data: unknown;
    try {
      data = JSON.parse(responseText);
    } catch {
      lastError = `Model ${model} returned non-JSON: ${responseText.slice(0, 200)}`;
      logger.error(lastError);
      continue;
    }

    const candidate = (data as GeminiResponse)?.candidates?.[0];
    const finishReason: string = candidate?.finishReason ?? 'UNKNOWN';
    const text: string | undefined = candidate?.content?.parts?.[0]?.text;

    if (!text) {
      lastError = `Model ${model} empty content (finishReason=${finishReason}): ${JSON.stringify(data).slice(0, 200)}`;
      logger.error(lastError);
      continue;
    }

    if (finishReason === 'MAX_TOKENS') {
      // Response was truncated — JSON will be broken. Raise tokens and retry next model slot.
      lastError = `Model ${model} hit MAX_TOKENS — JSON truncated at ${text.length} chars. Raise maxOutputTokens.`;
      logger.error(lastError);
      // Don't try to parse truncated JSON — skip to next model
      continue;
    }

    if (finishReason !== 'STOP') {
      logger.warn(`Model ${model} finishReason=${finishReason} — attempting parse anyway`);
    }

    // Parse JSON content
    try {
      const parsed = JSON.parse(text);
      logger.log(`Gemini success with model: ${model} (finishReason=${finishReason})`);
      return parsed;
    } catch {
      // Strip accidental markdown fences as safety net
      const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
      try {
        const parsed = JSON.parse(cleaned);
        logger.log(`Gemini success with model: ${model} (after fence strip)`);
        return parsed;
      } catch (parseErr) {
        lastError = `Model ${model} JSON parse failed (finishReason=${finishReason}). Raw: ${text.slice(0, 300)}`;
        logger.error(lastError, parseErr);
        continue;
      }
    }
  }

  throw new Error(`All Gemini models failed. Last error: ${lastError}`);
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

const EXTRACTION_PROMPT = `You are an expert OCR and data extraction assistant for Indian pharmacy GST invoices.

Extract all procurement bill details from the image.

For each line item, extract these fields EXACTLY as shown on the invoice:
- batch_number = Batch/Lot No. column
- expiry_date = Exp. Date column
- quantity = Qty/Free column (use the quantity before the slash)
- unit_price = Rate column (your procurement cost per unit)
- mrp = M.R.P column (maximum retail price - this is the selling price)
- total_price = Total column

For each line item produce TWO name fields:

1. raw_extracted_name — copy the product name EXACTLY as printed on the invoice.

2. normalized_search_name — follow these rules:
   a. Keep the Brand Name as-is.
   b. Keep the numeric Strength (e.g. "10", "500", "25", "60K").
   c. Normalize the dosage FORM to one of: Tablet, Capsule, Injection, Syrup, Drops, Cream, Gel
      (TAB → Tablet, CAP → Capsule, INJ → Injection, SYR → Syrup)
   d. Strip units from the strength number: MG, MCG, ML, GM
   e. Strip packaging info: 1X10, 1X15, 1VIAL, 2ML, 10ML

   Examples:
     "THYRONORM 25MCG TAB"   → "THYRONORM 25 Tablet"
     "ONDEM INJ"             → "ONDEM Injection"
     "AMYTINE 10MG TAB"      → "AMYTINE 10 Tablet"
     "LEVIPIL 500MG CAP"     → "LEVIPIL 500 Capsule"
     "LEVIPIL INJ"           → "LEVIPIL Injection"
     "NEXITO 10MG TAB"       → "NEXITO 10 Tablet"
     "NEURO D3 60K"          → "NEURO D3 60"
     "MVI INJ"               → "MVI Injection"
     "BENFOMET FORTE TAB"    → "BENFOMET FORTE Tablet"

Return valid JSON matching this exact schema:
{
  "supplier_name": "string",
  "invoice_number": "string",
  "invoice_date": "YYYY-MM-DD",
  "total_amount": number,
  "items": [
    {
      "raw_extracted_name": "string",
      "normalized_search_name": "string",
      "batch_number": "string",
      "expiry_date": "YYYY-MM-DD or empty string",
      "quantity": number,
      "unit_price": number,
      "mrp": number,
      "total_price": number
    }
  ]
}`;

function buildMatchingPrompt(tasks: string): string {
  return `You are matching pharmacy invoice line items to medicines in a database.

For each term, pick the BEST matching candidate. Rules:
- Brand name must be similar (most important)
- Strength number must match exactly (500 ≠ 250)
- Dosage form must match — Tablet, Capsule, Injection, Syrup are DIFFERENT products
- If no candidate is a good match, return null

${tasks}

Return ONLY a JSON array, one object per term, same order as input:
[
  { "term": "original term", "matched_id": number_or_null, "matched_name": "string_or_null" }
]`;
}

// ─── DB matching ──────────────────────────────────────────────────────────────

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function matchTermsBulk(
  supabase: ReturnType<typeof createClient>,
  terms: string[]
): Promise<MatchResult[]> {
  const { data, error } = await supabase.rpc('match_invoice_items_bulk', { search_terms: terms });
  if (error) { logger.error('Bulk RPC error:', error.message); throw error; }
  return (data as MatchResult[]) ?? [];
}

async function matchTermSingle(
  supabase: ReturnType<typeof createClient>,
  term: string
): Promise<MatchResult> {
  const { data, error } = await supabase.rpc('match_invoice_item_single', { search_term: term });
  if (error) return { original_search_term: term, matched_id: null, matched_name: null, similarity_score: 0 };
  return (data as MatchResult[])?.[0] ?? { original_search_term: term, matched_id: null, matched_name: null, similarity_score: 0 };
}

async function dbMatch(
  supabase: ReturnType<typeof createClient>,
  terms: string[]
): Promise<Map<string, { matched_id: number | null; matched_name: string | null }>> {
  const BATCH = 10;
  const results: MatchResult[] = [];

  for (let i = 0; i < terms.length; i += BATCH) {
    const batch = terms.slice(i, i + BATCH);
    try {
      results.push(...await matchTermsBulk(supabase, batch));
    } catch {
      for (const term of batch) {
        results.push(await matchTermSingle(supabase, term));
        await sleep(50);
      }
    }
  }

  return new Map(results.map((r) => [
    r.original_search_term,
    { matched_id: r.matched_id ?? null, matched_name: r.matched_name ?? null },
  ]));
}

// ─── AI matching ──────────────────────────────────────────────────────────────

async function aiMatch(
  unmatchedTerms: string[],
  supabase: ReturnType<typeof createClient>
): Promise<Map<string, { matched_id: number | null; matched_name: string | null }>> {
  const result = new Map<string, { matched_id: number | null; matched_name: string | null }>();
  if (unmatchedTerms.length === 0) return result;

  const taskLines: string[] = [];
  for (const term of unmatchedTerms) {
    const brandPrefix = term.split(' ')[0];
    const { data } = await supabase
      .from('medicines')
      .select('id, name')
      .ilike('name', `${brandPrefix}%`)
      .eq('is_discontinued', false)
      .limit(20);

    const candidates = (data as MedicineLookup[]) ?? [];
    taskLines.push(
      `Term: "${term}"\nCandidates:\n${candidates.length
        ? candidates.map((c) => `  - id:${c.id} "${c.name}"`).join('\n')
        : '  (none found)'
      }`
    );
  }

  try {
    const matches = await callGemini(buildMatchingPrompt(taskLines.join('\n\n')));

    if (Array.isArray(matches)) {
      for (const m of matches as AIMatchResult[]) {
        if (m?.term) {
          result.set(m.term, { matched_id: m.matched_id ?? null, matched_name: m.matched_name ?? null });
        }
      }
    }

    const resolved = [...result.values()].filter((v) => v.matched_id).length;
    logger.log(`AI matching: ${resolved}/${unmatchedTerms.length} resolved`);
  } catch (err) {
    logger.error('AI matching failed:', err instanceof Error ? err.message : err);
  }

  return result;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // 1. Download image
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      return NextResponse.json({ error: 'Failed to download image from storage' }, { status: 400 });
    }
    const mimeType = imageRes.headers.get('content-type') || 'image/jpeg';
    const imageBase64 = Buffer.from(await imageRes.arrayBuffer()).toString('base64');

    // 2. Extract with Gemini (vision) — real error surfaced to client
    let extractedData: {
      supplier_name: string;
      invoice_number: string;
      invoice_date: string;
      total_amount: number;
      items: ExtractedItem[];
    };

    try {
      extractedData = await callGemini(EXTRACTION_PROMPT, imageBase64, mimeType) as typeof extractedData;
      logger.log('Extraction complete:', extractedData.items?.length, 'items');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Surface the REAL error — not a generic "Extraction failed"
      return NextResponse.json({ error: msg }, { status: 503 });
    }

    if (!Array.isArray(extractedData.items)) extractedData.items = [];

    // 3. Match items
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && extractedData.items.length > 0) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const terms = extractedData.items.map(
        (item) => item.normalized_search_name?.trim() || item.raw_extracted_name?.trim() || ''
      );
      const uniqueTerms = [...new Set(terms.filter(Boolean))];

      const dbMatchMap = await dbMatch(supabase, uniqueTerms);

      const unmatchedTerms = uniqueTerms.filter((t) => !dbMatchMap.get(t)?.matched_id);
      const aiMatchMap = unmatchedTerms.length > 0
        ? await aiMatch(unmatchedTerms, supabase)
        : new Map<string, { matched_id: number | null; matched_name: string | null }>();

      extractedData.items = extractedData.items.map((item, idx) => {
        const term = terms[idx];
        const match = dbMatchMap.get(term) ?? aiMatchMap.get(term);
        return {
          ...item,
          medicine_id: match?.matched_id ?? null,
          extracted_name: match?.matched_name ?? item.raw_extracted_name,
        };
      });

      const matched = extractedData.items.filter((i) => i.medicine_id).length;
      logger.log(`Matching: ${matched}/${extractedData.items.length} items matched`);
    }

    return NextResponse.json({ data: extractedData, provider: 'google', model: 'gemini-2.5-flash-lite' });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Route error:', msg);
    return NextResponse.json({ error: 'Server error', details: msg }, { status: 500 });
  }
}