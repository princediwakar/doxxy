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

const NARRATIVE_FIELD_MAPPING = `
NARRATIVE-TO-FIELD MAPPING:
When the doctor dictates in narrative form, carefully map each section to the correct schema fields:
- "History" / "History of Present Illness" / "HPI" → history_of_present_illness
- "Past History" / "Past Medical History" / "PMH" → past_medical_history
- "Family History" → family_history
- "Current Medications" / "Drug History" → medications
- "Allergies" → allergies
- "Examination" / "Physical Exam" / "On examination" / "O/E" → physical_exam AND systemic_examination
- "Vital Signs" / "Vitals" → vital_signs (extract numeric values into sub-fields)
- "Investigations" / "Labs" / "Previous Tests" / "Reports" → previous_investigations
- "Assessment" / "Impression" / "Clinical Impression" → assessment
- "Diagnosis" / "Diagnoses" → diagnosis
- "Plan" / "Treatment" / "Management" → treatment
- "Investigations Planned" / "Tests to Order" / "Order" → planned_investigations
- "Follow-Up" / "Follow up" / "Review" → follow_up
- "Referrals" / "Refer to" / "Consult" → referrals
- "Prognosis" / "Expected Course" → prognosis
If a single narrative section contains information relevant to multiple fields, populate ALL of them. Do not condense or skip — capture the full detail the doctor provided.`;

function generateSystemPrompt(department: string, fields: NoteFieldConfig[]): string {
  const fieldList = fields
    .map((f) => {
      const hint = f.placeholder ? ` — ${f.placeholder}` : '';
      return `  - ${f.name}: ${f.label}${hint}`;
    })
    .join('\n');

  return `You are a clinical AI that converts voice transcripts into structured consultation notes for Indian clinics. Your task is to thoroughly analyze the entire transcript and extract ALL available clinical information into every relevant field below. Do not skip sections — if the doctor mentioned it, it belongs in the output.

${INDIAN_SHORTHAND_REFERENCE}

DEPARTMENT: ${department}

FIELDS TO EXTRACT:
${fieldList}

${NARRATIVE_FIELD_MAPPING}

INSTRUCTIONS:
1. Read the entire transcript carefully. Extract ALL clinical information into the matching fields listed above. Populate every field that has any corresponding content in the transcript — do not be conservative or lazy.
2. Map narrative sections to schema fields using the mapping guide above. If a section maps to multiple fields (e.g., "Examination" maps to both physical_exam and systemic_examination), populate all of them with the relevant content.
3. Preserve the doctor's wording, detail, and clinical nuance. Do not summarize or truncate.
4. For diagnosis: infer the most likely clinical diagnosis from the symptoms, examination findings, and treatment described. If the doctor did not explicitly name it, synthesize one from the clinical picture (e.g., "Migraine", "Hypertensive urgency", "Upper respiratory tract infection"). Never leave diagnosis as NOT_SPECIFIED when there is enough clinical information to form one.
5. For assessment: provide a brief clinical reasoning that connects the symptoms to the diagnosis and justifies the treatment plan. If the doctor didn't explicitly state one, infer it from the available data.
6. Set a field to "NOT_SPECIFIED" only when the transcript contains zero information relevant to it.
7. For the prescriptions array, extract each medication with its name, dosage, frequency, duration, route, and instructions.
8. For prescription frequency, preserve the doctor's shorthand exactly as spoken (e.g., "BD", "TDS", "OD").
9. Drug names: if a brand name is used (e.g., "Dolo", "Crocin"), keep the brand name in name.

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
  const advice = String(aiOutput.treatment ?? aiOutput.therapy_plan ?? 'NOT_SPECIFIED');

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

  return { symptoms, diagnosis, prescriptions, advice, rawFields };
}

export function stripNotSpecified(obj: unknown): unknown {
  if (obj === null || obj === undefined) return null;
  if (typeof obj === 'string') {
    return obj === 'NOT_SPECIFIED' || obj.trim() === '' ? null : obj;
  }
  if (Array.isArray(obj)) {
    const cleaned = obj.map(stripNotSpecified).filter((v) => v !== null);
    return cleaned.length === 0 ? null : cleaned;
  }
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const cleaned = stripNotSpecified(value);
      if (cleaned !== null) {
        result[key] = cleaned;
      }
    }
    return Object.keys(result).length === 0 ? null : result;
  }
  return obj;
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
        model: 'gpt-4o',
        temperature: 0.1,
        max_tokens: 16384,
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
