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

const PRESCRIPTION_EXTRACTION_GUIDE = `
PRESCRIPTION EXTRACTION GUIDE:
For every medication the doctor prescribes, create an object in the prescriptions array with ALL of these sub-fields:

  name — The drug name exactly as spoken. Keep brand names (e.g., "Dolo", "Crocin", "Augmentin"). If the doctor says a generic name, use that (e.g., "Paracetamol", "Amoxicillin").

  dosage — The strength with unit. Examples: "500mg", "10mg", "650mg", "5ml", "10mcg". If the doctor says "Paracetamol 650", dosage is "650mg". If no dosage mentioned, set to "NOT_SPECIFIED".

  frequency — How often to take the medication. Must be one of: OD, BD, TDS, QID, PRN, Q4H, Q6H, Q8H, Q12H, SOS. Map the doctor's words to the closest matching value (e.g., "twice a day" → "BD", "as needed" → "PRN", "every 8 hours" → "Q8H"). See Indian Shorthand Reference above for mappings. If no frequency mentioned, set to null. IMPORTANT: Because this field has a restricted set of allowed values, you MUST use one of the enum values or null. Never use "NOT_SPECIFIED" here.

  duration — How long the medication should be taken. Examples: "5 days", "1 week", "10 days", "until finished". If no duration mentioned, set to "NOT_SPECIFIED".

  route — How the medication is administered. Must be one of: Oral, Topical, IV, IM, Eye Drops, Subcutaneous, Inhaled. See Prescription Route Detection above for mapping rules. If no route mentioned and the drug is a tablet/capsule/syrup, default to "Oral". If uncertain, set to null. IMPORTANT: Because this field has a restricted set of allowed values, you MUST use one of the enum values or null. Never use "NOT_SPECIFIED" here.

  instructions — Any special directions for taking the medication. Examples: "Take after food", "Take before food", "Take at bedtime", "Complete the full course", "Apply thinly". See Special Instructions Extraction above. If no special instructions, set to "NOT_SPECIFIED".

IMPORTANT: Extract EVERY medication mentioned. If the doctor says "prescribe X, Y, and Z", create three separate objects in the array. If no medications are prescribed, return an empty array []. Do NOT invent or guess medications that were not mentioned.`;

const EYE_EXAMINATION_GUIDE = `
EYE EXAMINATION FIELDS:
Each eye examination field (type: tabular_eye) is an object with { left, right, notes }. Populate as follows:
  - left — Findings for the left eye (OS). Set to null if not specifically examined.
  - right — Findings for the right eye (OD). Set to null if not specifically examined.
  - notes — Bilateral observations, general remarks, or additional detail about the finding. Set to null if nothing to add.
If the doctor did not examine this structure at all (e.g., no mention of cornea, no mention of fundus), set the entire field to null — NOT an object filled with "NOT_SPECIFIED" strings.
If the doctor examined the structure but only mentioned one eye, populate just that side and leave the other as null.
If the doctor described findings without specifying left/right, put the description in notes and set left/right to null.`;

const NARRATIVE_FIELD_MAPPING = `
NARRATIVE-TO-FIELD MAPPING:
When the doctor dictates in narrative form, carefully map each section to the correct schema fields:
- "History" / "History of Present Illness" / "HPI" → history_of_present_illness
- "Past History" / "Past Medical History" / "PMH" → past_medical_history
- "Family History" → family_history
- "Current Medications" / "Drug History" → medications
- "Allergies" → allergies
- "Examination" / "Physical Exam" / "On examination" / "O/E" → physical_exam. Also populate systemic_examination and any specialty-specific examination fields ONLY if the transcript contains distinct organ-system findings (CNS, CVS, RS, abdomen, etc.) that are separate from the general physical exam. Never copy the same content into multiple fields.
- "Vital Signs" / "Vitals" → vital_signs (extract numeric values into sub-fields)
- "Investigations" / "Labs" / "Previous Tests" / "Reports" → previous_investigations
- "Assessment" / "Impression" / "Clinical Impression" → assessment
- "Diagnosis" / "Diagnoses" → diagnosis
- "Plan" / "Treatment" / "Management" → treatment
- "Investigations Planned" / "Tests to Order" / "Order" → planned_investigations
- "Follow-Up" / "Follow up" / "Review" → follow_up
- "Referrals" / "Refer to" / "Consult" → referrals
- "Prognosis" / "Expected Course" → prognosis
- "Prescriptions" / "Medications" / "Rx" / "Treatment" → prescriptions (extract each medication as an object with sub-fields: name, dosage, frequency, duration, route, instructions — see PRESCRIPTION EXTRACTION GUIDE below)
If a single narrative section contains information relevant to multiple distinct fields, split the content appropriately — each finding goes into the most specific field that matches it. Never duplicate the same text across fields.`;



function generateSystemPrompt(department: string, fields: NoteFieldConfig[]): string {
  const fieldList = fields
    .map((f) => {
      const hint = f.placeholder ? ` — ${f.placeholder}` : '';
      let subFields = '';
      if (f.type === 'prescription') {
        subFields = ' [sub-fields per medication: name, dosage, frequency, duration, route, instructions — see Prescription Extraction Guide]';
      } else if (f.type === 'vital_signs') {
        subFields = ' [sub-fields: temperature, pulse, blood_pressure_systolic, blood_pressure_diastolic, respiratory_rate, oxygen_saturation, height, weight, bmi]';
      } else if (f.type === 'tabular_eye') {
        subFields = ' [sub-fields: left, right, notes — set to null if not examined, see Eye Examination Fields below]';
      }
      return `  - ${f.name}: ${f.label}${hint}${subFields}`;
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
2. Map narrative sections to schema fields using the mapping guide above. Distribute content intelligently across fields — each finding should appear in exactly ONE field. Never copy identical text into multiple fields. If a finding could go in a specialty-specific field (e.g., cardiac_examination, respiratory_examination), put it there instead of the generic physical_exam or systemic_examination. Use physical_exam and systemic_examination only for findings that don't fit into a more specific field.
3. Preserve the doctor's wording, detail, and clinical nuance. Do not summarize or truncate.
4. For diagnosis: infer the most likely clinical diagnosis from the symptoms, examination findings, and treatment described. If the doctor did not explicitly name it, synthesize one from the clinical picture (e.g., "Migraine", "Hypertensive urgency", "Upper respiratory tract infection"). Never leave diagnosis as NOT_SPECIFIED when there is enough clinical information to form one.
5. For assessment: provide a brief clinical reasoning that connects the symptoms to the diagnosis and justifies the treatment plan. If the doctor didn't explicitly state one, infer it from the available data.
6. Set a field to "NOT_SPECIFIED" only when the transcript contains zero information relevant to it.
7. For prescriptions: follow the Prescription Extraction Guide below. Extract each medication with ALL sub-fields populated. Use ONLY the valid enum values for frequency and route.
8. For prescription frequency, preserve the doctor's shorthand exactly as spoken (e.g., "BD", "TDS", "OD").

${ROUTE_DETECTION}

${SPECIAL_INSTRUCTIONS}

${PRESCRIPTION_EXTRACTION_GUIDE}

${EYE_EXAMINATION_GUIDE}`;
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
      // Don't retry auth errors
      if (error instanceof Error && error.message.includes('401')) break;
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
      throw new Error(`OpenAI API error: ${response.status} — ${errText.slice(0, 300)}`);
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
