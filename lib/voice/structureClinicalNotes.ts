// lib/voice/structureClinicalNotes.ts
import { logger } from '@/lib/logger';
import { getSchemaForDepartment } from '@/lib/consultationNotesSchemas';
import { mapDepartmentName } from '@/components/consultation/constants';
import { zodToJsonSchema, getAllFieldsFromSchema } from '@/lib/schemaUtils';
import type { NoteFieldConfig } from '@/lib/schemaUtils';
import type { AIStructuredOutput, FieldConfidence } from '@/types/voice';

const INDIAN_SHORTHAND_REFERENCE = `
INDIAN CLINICAL SHORTHAND REFERENCE:
| Shorthand | Meaning | Category |
|-----------|---------|----------|
| OD / OD | Once daily | frequency |
| BD / BID | Twice a day | frequency |
| TDS / TID | Three times a day | frequency |
| QID | Four times a day | frequency |
| SOS / PRN | As needed | frequency |
| HS | At bedtime | frequency |
| PC | After meals | frequency |
| AC | Before meals | frequency |
| STAT | Immediately | frequency |
| Q4H / Q6H / Q8H / Q12H | Every N hours | frequency |
| Dolo | Paracetamol 650mg (brand) | drug_name |
| Meftal | Mefenamic Acid (brand) | drug_name |
| Crocin | Paracetamol (brand) | drug_name |
| Azithral | Azithromycin (brand) | drug_name |
| Augmentin | Amoxicillin + Clavulanic Acid (brand) | drug_name |

When transcribing, preserve the doctor's shorthand in the frequency field exactly as spoken (e.g., "BD", "TDS").
`;

const ROUTE_DETECTION = `
PRESCRIPTION ROUTE DETECTION:
- "Tab" / "tablet" / "cap" / "capsule" / "syrup" / "by mouth" / no route mentioned for oral drugs → "Oral"
- "Inj" / "injection" / "inject" → default to "IM" unless "IV" is specified
- "Oint" / "ointment" / "cream" / "gel" / "apply" / "lotion" → "Topical"
- "Eye drops" / "eye" → "Eye Drops"
- "Inhaler" / "inhale" / "puff" / "nebulizer" → "Inhaled"
- "Subcutaneous" / "SC" / "under skin" → "Subcutaneous"
`;

const SPECIAL_INSTRUCTIONS = `
SPECIAL INSTRUCTIONS EXTRACTION:
- "after food" / "after meals" / "PC" → "Take after food"
- "before food" / "before meals" / "AC" → "Take before food"
- "at bedtime" / "HS" → "Take at bedtime"
- "with milk" / "with water" → note the specific instruction
- "complete the course" → "Complete the full course"
- "apply thinly" / "apply twice daily" → note the application instruction
- "avoid alcohol" / "no alcohol" → "Avoid alcohol"
- "for fever" / "for pain" / "if needed" → note the condition
- If no special instruction is given, set instructions to "NOT_SPECIFIED"`;

function generateSystemPrompt(department: string, fields: NoteFieldConfig[]): string {
  const fieldList = fields
    .map((f) => {
      const hint = f.placeholder ? ` — ${f.placeholder}` : '';
      return `  - ${f.name}: ${f.label}${hint}`;
    })
    .join('\n');

  return `You are a clinical AI that converts voice transcripts into structured consultation notes for Indian clinics.

${INDIAN_SHORTHAND_REFERENCE}

DEPARTMENT: ${department}

FIELDS TO EXTRACT:
${fieldList}

INSTRUCTIONS:
1. Extract all fields listed above from the transcript. Set any field you cannot determine to "NOT_SPECIFIED".
2. For the prescriptions array, extract each medication with its name, dosage, frequency, duration, route, and instructions.
3. For prescription frequency, preserve the doctor's shorthand exactly as spoken (e.g., "BD", "TDS", "OD").
4. Drug names: if a brand name is used (e.g., "Dolo", "Crocin"), keep the brand name in name.

${ROUTE_DETECTION}

${SPECIAL_INSTRUCTIONS}`;
}

function buildFieldMetadata(fields: NoteFieldConfig[]): Record<string, { label: string }> {
  const meta: Record<string, { label: string }> = {};
  for (const f of fields) {
    meta[f.name] = { label: f.label };
  }
  return meta;
}

function mapStructuredOutput(
  aiOutput: Record<string, unknown>,
  fields: NoteFieldConfig[],
): AIStructuredOutput {
  const rawFields: Record<string, unknown> = {};

  for (const field of fields) {
    if (field.name === 'chief_complaint' || field.name === 'diagnosis' || field.name === 'prescriptions') continue;
    if (field.name in aiOutput) {
      rawFields[field.name] = aiOutput[field.name];
    }
  }

  const symptoms = String(aiOutput.chief_complaint ?? 'NOT_SPECIFIED');
  const diagnosis = String(aiOutput.diagnosis ?? 'NOT_SPECIFIED');

  const prescriptions = (() => {
    const raw = aiOutput.prescriptions;
    if (Array.isArray(raw)) {
      return raw.map((p: Record<string, unknown>) => ({
        drug_name: String(p.name ?? 'NOT_SPECIFIED'),
        dosage: String(p.dosage ?? 'NOT_SPECIFIED'),
        frequency: String(p.frequency ?? 'NOT_SPECIFIED'),
        duration: String(p.duration ?? 'NOT_SPECIFIED'),
        route: String(p.route ?? 'NOT_SPECIFIED'),
        instructions: String(p.instructions ?? 'NOT_SPECIFIED'),
      }));
    }
    return [];
  })();

  return { symptoms, diagnosis, prescriptions, advice: 'NOT_SPECIFIED', rawFields };
}

const BRIEF_THRESHOLD = 4;

export function computeFieldConfidence(output: AIStructuredOutput): FieldConfidence[] {
  const results: FieldConfidence[] = [];

  function assessTextField(value: string, field: string, label?: string) {
    const display = label ?? field;
    if (value === 'NOT_SPECIFIED' || value.trim() === '') {
      results.push({ field, level: 'low', reason: 'NOT_SPECIFIED' });
    } else if (value.length < BRIEF_THRESHOLD) {
      results.push({ field, level: 'medium', reason: `Brief extraction (${value.length} chars)` });
    }
  }

  assessTextField(output.symptoms, 'symptoms');
  assessTextField(output.diagnosis, 'diagnosis');

  for (const [key, value] of Object.entries(output.rawFields || {})) {
    if (typeof value === 'string') {
      assessTextField(value, key);
    }
  }

  for (let i = 0; i < output.prescriptions.length; i++) {
    const p = output.prescriptions[i];
    const prefix = `prescriptions[${i}].`;
    if (p.drug_name === 'NOT_SPECIFIED') results.push({ field: `${prefix}drug_name`, level: 'low', reason: 'NOT_SPECIFIED' });
    if (p.dosage === 'NOT_SPECIFIED') results.push({ field: `${prefix}dosage`, level: 'low', reason: 'NOT_SPECIFIED' });
    if (p.frequency === 'NOT_SPECIFIED') results.push({ field: `${prefix}frequency`, level: 'low', reason: 'NOT_SPECIFIED' });
    if (p.route === 'NOT_SPECIFIED') results.push({ field: `${prefix}route`, level: 'low', reason: 'NOT_SPECIFIED' });
  }

  return results;
}

const MAX_RETRIES = 3;
const RETRY_BASE_DELAY = 1000;

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  label: string,
  retries = MAX_RETRIES,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      // Don't retry auth errors or bad requests
      if (error instanceof Error && error.message.includes('401')) break;
      if (error instanceof Error && error.message.includes('400')) break;
      const delay = RETRY_BASE_DELAY * Math.pow(2, attempt);
      logger.warn(`OpenAI ${label} attempt ${attempt + 1} failed, retrying in ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

export async function structureClinicalNotes(
  transcript: string,
  department: string,
): Promise<AIStructuredOutput> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const dept = department ? mapDepartmentName(department) : 'General';
  const schema = getSchemaForDepartment(dept);
  const fields = getAllFieldsFromSchema(schema);
  const jsonSchema = zodToJsonSchema(schema);
  const systemPrompt = generateSystemPrompt(dept, fields);

  const openaiData = await retryWithBackoff(async () => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.1,
        max_tokens: 4096,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Transcribe and structure this clinical dictation:\n\n${transcript}` },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'clinical_note',
            strict: true,
            schema: jsonSchema,
          },
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error('OpenAI error:', response.status, errText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI returned empty response');
    }

    return { data, content };
  }, 'structure clinical notes');

  const aiOutput = JSON.parse(openaiData.content);
  return mapStructuredOutput(aiOutput, fields);
}
