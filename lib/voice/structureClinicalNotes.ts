// src/lib/voice/structureClinicalNotes.ts
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { logger } from "@/lib/logger";
import { getSchemaForDepartment } from "@/lib/consultationNotesSchemas";
import { mapDepartmentName } from "@/components/consultation/constants";
import { getAllFieldsFromSchema, safeString, BRIEF_THRESHOLD } from "@/lib/schemaUtils";
import type { NoteFieldConfig } from "@/lib/schemaUtils";
import type { AIStructuredOutput, FieldConfidence } from "@/types/voice";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("[structureClinicalNotes] OPENAI_API_KEY is not set.");
}

// Instantiate official client. It natively handles rate limits (429) and network retries with backoff.
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  maxRetries: 3, 
});

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
- If no special instruction is given, output null.`;

const PRESCRIPTION_EXTRACTION_GUIDE = `
PRESCRIPTION EXTRACTION GUIDE & NEGATIVE LOGIC:
1. ACTIVE PRESCRIPTIONS: For every medication the doctor ACTIVELY prescribes or continues, create an object in the \`prescriptions\` array.
   - Separate the drug name from its physical form. (e.g., name: "Amoxicillin", formulation: "oral suspension", dosage: "400mg per 5mL").
   - Output null for any missing sub-fields (duration, route, etc). DO NOT output "NOT_SPECIFIED".

2. CRITICAL NEGATION RULE: Doctors often "think out loud", change their minds, or explicitly deny patient requests.
   - If the doctor mentions a drug but says "scratch that", "instead of", "stop taking", or "no [drug class] will be prescribed" — DO NOT put it in the \`prescriptions\` array.
   - ALL negated, discontinued, or replaced drugs MUST be placed as simple strings in the \`discontinued_medications\` array.
   - Example: "I was going to give Ibuprofen, but let's do Celebrex. Also no opioids." -> prescriptions: [{name: "Celebrex"}], discontinued_medications: ["Ibuprofen", "opioids"].
`;

const DIAGNOSTIC_UNCERTAINTY_GUIDE = `
DIAGNOSTIC UNCERTAINTY:
- If a diagnosis is confirmed, put it in \`diagnosis\`.
- If the doctor expresses uncertainty (e.g., "leaning towards", "could be", "rule out"), place those suspected conditions in the \`differential_diagnosis\` array.
`;

const EYE_EXAMINATION_GUIDE = `
EYE EXAMINATION FIELDS:
Each eye examination field (type: tabular_eye) is an object with { left, right, notes }. Populate as follows:
  - left — Findings for the left eye (OS). Set to null if not specifically examined.
  - right — Findings for the right eye (OD). Set to null if not specifically examined.
  - notes — Bilateral observations, general remarks, or additional detail about the finding. Set to null if nothing to add.
If the doctor did not examine this structure at all (e.g., no mention of cornea, no mention of fundus), set the entire field to null — NOT an object filled with "NOT_SPECIFIED" strings.
If the doctor examined the structure but only mentioned one eye, populate just that side and leave the other as null.
If the doctor described findings without specifying left/right, put the description in notes and set left/right to null.`;
 
const FEW_SHOT_EXAMPLES = `
EXAMPLE 1 (General dictation):
Input: "Patient is a 45-year-old male presenting with a 3-day history of severe throbbing headache and nausea. No photophobia. BP is 140/90. Past medical history of hypertension. Prescribe Paracetamol 650mg SOS for pain, review after 5 days. Diagnosis is tension headache."
Expected Output Mapping:
- history_of_present_illness: "45-year-old male presenting with a 3-day history of severe throbbing headache and nausea. No photophobia."
- vital_signs.blood_pressure_systolic: "140"
- vital_signs.blood_pressure_diastolic: "90"
- past_medical_history: "Hypertension"
- diagnosis: "Tension headache"
- prescriptions: [{ "name": "Paracetamol", "dosage": "650mg", "frequency": "SOS", "duration": null, "route": "Oral", "instructions": "For pain", "formulation": null }]
- follow_up: "Review after 5 days"
 
EXAMPLE 2 (Specialty specific - Ophthalmology):
Input: "Right eye vision is 6/6, left eye 6/18. Slit lamp shows mild cataract in the left eye. Cornea is clear bilaterally. Start Moxifloxacin eye drops QID right eye for 1 week."
Expected Output Mapping:
- visual_acuity.right: "6/6"
- visual_acuity.left: "6/18"
- lens.left: "Mild cataract"
- cornea.notes: "Clear bilaterally"
- prescriptions: [{ "name": "Moxifloxacin", "dosage": null, "frequency": "QID", "duration": "1 week", "route": "Eye Drops", "instructions": "Right eye", "formulation": null }]
`;
 
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
- "Differential Diagnosis" / "Rule Out" / "Suspected" / "Could be" → differential_diagnosis (list each suspected condition as a string)
- "Plan" / "Treatment" / "Management" → treatment
- "Investigations Planned" / "Tests to Order" / "Order" → planned_investigations
- "Follow-Up" / "Follow up" / "Review" → follow_up
- "Referrals" / "Refer to" / "Consult" → referrals
- "Prognosis" / "Expected Course" → prognosis
- "Prescriptions" / "Medications" / "Rx" / "Treatment" → prescriptions (extract each medication as an object with sub-fields: name, dosage, frequency, duration, route, instructions, formulation — see PRESCRIPTION EXTRACTION GUIDE below)
- "Discontinued" / "Stopped" / "Stop taking" / "No [drug]" → discontinued_medications (list each negated or stopped drug as a string)
If a single narrative section contains information relevant to multiple distinct fields, split the content appropriately — each finding goes into the most specific field that matches it. Never duplicate the same text across fields.`;


const STATIC_PROMPT_SECTIONS = [
  INDIAN_SHORTHAND_REFERENCE,
  ROUTE_DETECTION,
  SPECIAL_INSTRUCTIONS,
  PRESCRIPTION_EXTRACTION_GUIDE,
  DIAGNOSTIC_UNCERTAINTY_GUIDE,
  EYE_EXAMINATION_GUIDE,
  FEW_SHOT_EXAMPLES,
].join("\n\n");

function getSpecialtyInstructions(department: string): string {
  switch (department) {
    case "Ophthalmology":
      return (
        "- Format visual acuity strictly as standard fractions (e.g., 6/6, 20/20, 6/18) and never as decimals.\n" +
        "- Separate eye findings cleanly into left and right sub-fields. Use 'notes' only for bilateral statements."
      );
    case "Cardiology":
      return (
        "- Extract exact BP, heart rate, and any murmur gradings directly into examination fields.\n" +
        "- Clearly differentiate between historical heart conditions and current presentation."
      );
    case "Neurology":
      return (
        "- Format motor power strictly as standard grades (e.g., 5/5, 4/5).\n" +
        "- Ensure left/right specificity for all reflexes and motor tone."
      );
    default:
      return "- Ensure measurements, dosages, and timelines are accurately preserved exactly as stated.";
  }
}

function generateSystemPrompt(department: string, fields: NoteFieldConfig[]): string {
  const fieldList = fields.map((f) => `  - ${f.name}: ${f.label}`).join("\n");
  const specialtyRules = getSpecialtyInstructions(department);

  return `You are a clinical AI that converts voice transcripts into structured consultation notes for Indian clinics.

DEPARTMENT: ${department}
SPECIALTY-SPECIFIC RULES:
${specialtyRules}

FIELDS TO EXTRACT:
${fieldList}

${NARRATIVE_FIELD_MAPPING}

INSTRUCTIONS:
1. Extract ALL clinical information into the matching fields.
2. Set a field to null ONLY when the transcript contains zero information relevant to it. DO NOT USE "NOT_SPECIFIED".
3. Preserve wording and clinical nuance. Do not summarize.
4. For prescriptions: output null for any missing sub-fields (duration, route, etc).

${STATIC_PROMPT_SECTIONS}`;
}

const MAX_TRANSCRIPT_CHARS = 80_000;

export async function structureClinicalNotes(
  transcript: string,
  department: string,
): Promise<{ output: AIStructuredOutput; confidence: FieldConfidence[] }> {
  
  const safeTranscript = transcript.length > MAX_TRANSCRIPT_CHARS 
    ? transcript.slice(0, MAX_TRANSCRIPT_CHARS) 
    : transcript;

  if (transcript.length > MAX_TRANSCRIPT_CHARS) {
    logger.warn(`Transcript truncated from ${transcript.length} to ${MAX_TRANSCRIPT_CHARS} chars.`);
  }

  const dept = department ? mapDepartmentName(department) : "General";
  const schema = getSchemaForDepartment(dept);
  const fields = getAllFieldsFromSchema(schema);
  const systemPrompt = generateSystemPrompt(dept, fields);

  try {
    // The SDK handles JSON parsing, validation against Zod, and retries natively.
const response = await openai.chat.completions.parse({
      model: "gpt-5.4-mini",
      temperature: 0.0,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Transcribe and structure this clinical dictation:\n\n${safeTranscript}` },
      ],
      response_format: zodResponseFormat(schema, "clinical_note"),
    });

    const parsedData = response.choices[0]?.message?.parsed;
    
    if (!parsedData) {
      throw new Error(`OpenAI refusal or empty response: ${response.choices[0]?.message?.refusal || "Unknown"}`);
    }

    return mapAndScoreOutput(parsedData, fields);
    
  } catch (error) {
    logger.error("[structureClinicalNotes] Failed to structure clinical notes.", error);
    throw new Error(`Failed to structure clinical notes: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Single-pass mapping and confidence scoring
function mapAndScoreOutput(
  aiOutput: Record<string, unknown>,
  fields: NoteFieldConfig[],
): { output: AIStructuredOutput; confidence: FieldConfidence[] } {
  const rawFields: Record<string, unknown> = {};
  const confidence: FieldConfidence[] = [];

  function assessConfidence(value: string | null, fieldName: string) {
    if (value === null || value.trim() === "") {
      confidence.push({ field: fieldName, level: "low", reason: "Missing data" });
    } else if (value.length < BRIEF_THRESHOLD) {
      confidence.push({ field: fieldName, level: "medium", reason: `Brief extraction (${value.length} chars)` });
    }
  }

  for (const field of fields) {
    if (["chief_complaint", "diagnosis", "prescriptions"].includes(field.name)) continue;
    
    if (field.name in aiOutput && aiOutput[field.name] !== null) {
      const val = aiOutput[field.name];
      rawFields[field.name] = val;
      if (typeof val === "string") {
        assessConfidence(val, field.name);
      }
    }
  }

  const symptoms = safeString(aiOutput.chief_complaint) as string;
  const diagnosis = safeString(aiOutput.diagnosis) as string;
  const advice = safeString(aiOutput.treatment ?? aiOutput.therapy_plan) as string;

  assessConfidence(safeString(aiOutput.chief_complaint), "symptoms");
  assessConfidence(safeString(aiOutput.diagnosis), "diagnosis");

  const rawPrescriptions = Array.isArray(aiOutput.prescriptions) ? aiOutput.prescriptions : [];
  const rawDifferential = Array.isArray(aiOutput.differential_diagnosis) ? aiOutput.differential_diagnosis : [];
  const differential_diagnosis = rawDifferential.filter((d): d is string => typeof d === "string");
  const rawDiscontinued = Array.isArray(aiOutput.discontinued_medications) ? aiOutput.discontinued_medications : [];
  const discontinued_medications = rawDiscontinued.filter((d): d is string => typeof d === "string");
  const prescriptions = rawPrescriptions.map((p: any, index: number) => {
    const prefix = `prescriptions[${index}].`;
    
    assessConfidence(p.name, `${prefix}drug_name`);
    assessConfidence(p.dosage, `${prefix}dosage`);
    assessConfidence(p.frequency, `${prefix}frequency`);
    assessConfidence(p.route, `${prefix}route`);

    return {
      drug_name: safeString(p.name) as string,
      dosage: safeString(p.dosage) as string,
      formulation: safeString(p.formulation) as string | null,
      frequency: safeString(p.frequency) as string,
      duration: safeString(p.duration) as string,
      route: safeString(p.route) as string,
      instructions: safeString(p.instructions) as string,
    };
  });

  return {
    output: { symptoms, diagnosis, prescriptions, differential_diagnosis, discontinued_medications, advice, rawFields },
    confidence,
  };
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

export function computeFieldConfidence(output: AIStructuredOutput): FieldConfidence[] {
  const results: FieldConfidence[] = [];

  function assessTextField(value: string | null, field: string) {
    if (value === null || value === 'NOT_SPECIFIED' || value.trim() === '') {
      results.push({ field, level: 'low', reason: 'Missing data' });
    } else if (value.length < BRIEF_THRESHOLD) {
      results.push({ field, level: 'medium', reason: `Brief extraction (${value.length} chars)` });
    }
  }

  assessTextField(output.symptoms, 'symptoms');
  assessTextField(output.diagnosis, 'diagnosis');
  assessTextField(output.advice, 'advice');

  for (const [key, value] of Object.entries(output.rawFields || {})) {
    if (typeof value === 'string') {
      assessTextField(value, key);
    }
  }

  for (let i = 0; i < output.prescriptions.length; i++) {
    const p = output.prescriptions[i];
    const prefix = `prescriptions[${i}].`;
    assessTextField(p.drug_name, `${prefix}drug_name`);
    assessTextField(p.dosage, `${prefix}dosage`);
    assessTextField(p.frequency, `${prefix}frequency`);
    assessTextField(p.route, `${prefix}route`);
  }

  return results;
}