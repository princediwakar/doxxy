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

// src/lib/voice/structureClinicalNotes.ts

const SURGICAL_SYSTEM_PROMPT = `You are an expert clinical extraction engine. Your sole objective is to map chaotic, rapid-fire, mixed-language dictation into a pristine structured schema. 

**Tradeoff:** These guidelines heavily bias toward CAUTION and FIDELITY over completeness. Do not hallucinate data to fill empty fields.

## 1. Think Before Mapping (Chain of Thought)
**Surface ambiguity. Resolve mid-sentence chaos logically.**
Before populating the clinical fields, you MUST use the \`_clinical_reasoning\` field to explicitly state your logic for:
- Resolving mid-sentence doctor corrections (e.g., "Start Pan-D... wait, make it Omez" -> Log that Pan-D was a verbal misfire, not a discontinuation, and Omez is the prescription).
- Deciding why a symptom belongs in \`chief_complaint\` vs. \`additional_clinical_findings\`.
- Translating Hinglish terms to clinical English based on the surrounding context.

## 2. Minimalist Extraction (Simplicity First)
**Extract exactly what was said. Nothing speculative.**
- **No medical inflation:** If the doctor says "pain", do not output "severe acute pain". 
- **No inferring diagnoses:** If the doctor lists symptoms but no explicit diagnosis, leave \`diagnosis\` null. 
- **Preserve temporal exactness:** 3 days is 3 days. Do not convert to "acute". 
- **Brand names are sacred:** Do not substitute Indian brand names (e.g., "Augmentin 625") for generics unless explicitly dictated.

Ask yourself: "Am I summarizing, or am I extracting?" If you are summarizing, you are hallucinating. Stop.

## 3. Surgical Schema Placement
**Touch only the correct fields. Clean up the spillover.**
- **Explicit Negations:** "No chest pain", "Lungs clear", "unremarkable" belong strictly in \`ruled_out_findings\`. They are NOT diagnoses or general history.
- **True Discontinuations:** Only populate \`discontinued_medications\` if the doctor explicitly stops a *previously taken* drug. 
- **The Spillover Protocol:** Use \`additional_clinical_findings\` ONLY if a clinical fact fundamentally cannot be mapped to the provided schema fields. Do not force data where it doesn't belong.

## 4. Goal-Driven Safety (Zero-Shot Verification)
**Define certainty. Null is better than wrong.**
- If an anatomical side (Left/Right) is required by the specialty schema but not stated, leave it null. Do not guess.
- If a duration or frequency for a prescription is missing, leave it null. Do not assume "OD" or "5 days" just because it is standard clinical practice.
- Correct obvious STT phonetic errors using clinical context (e.g., "fragile fatigue" -> "brain fog"), but ONLY if the correction is clinically undeniable. If nonsensical and unresolvable, capture the exact phonetic string in quotes in \`additional_clinical_findings\`.`;



function getSpecialtyInstructions(department: string): string {
  switch (department) {
    case "Ophthalmology":
      return "- Format visual acuity strictly as standard fractions (e.g., 6/6, 20/20). Left/Right specificity is absolute.";
    case "Neurology":
      return "- Format motor power as standard grades (e.g., 5/5). Map eponyms (Patellar, Babinski) to exact anatomical fields. If 'bilateral', duplicate to left and right.";
    case "Cardiology":
      return "- Differentiate strictly between historical cardiac events and current presentation vitals/murmurs.";
    default:
      return "";
  }
}

function generateSystemPrompt(department: string): string {
  const specialtyRules = getSpecialtyInstructions(department);
  
  return `${SURGICAL_SYSTEM_PROMPT}

DEPARTMENT FOCUS: ${department}
${specialtyRules ? `SPECIALTY RULES:\n${specialtyRules}` : ""}`;
}

const MAX_TRANSCRIPT_CHARS = 80_000;


export class TranscriptTooLongError extends Error {
  constructor(
    public length: number,
    public limit: number,
  ) {
    super(`Transcript length (${length}) exceeds the clinical safety limit of ${limit} characters.`);
    this.name = 'TranscriptTooLongError';
  }
}

export async function structureClinicalNotes(
  transcript: string,
  department: string,
): Promise<{ output: AIStructuredOutput; confidence: FieldConfidence[] }> {

  if (transcript.length > MAX_TRANSCRIPT_CHARS) {
    logger.error(`[structureClinicalNotes] REJECTED: Transcript too long (${transcript.length} chars).`);
    throw new TranscriptTooLongError(transcript.length, MAX_TRANSCRIPT_CHARS);
  }

  const dept = department ? mapDepartmentName(department) : "General";
  const schema = getSchemaForDepartment(dept);
  const fields = getAllFieldsFromSchema(schema);
  
  // Note: We no longer pass 'fields' into generateSystemPrompt. Zod handles the schema context.
  const systemPrompt = generateSystemPrompt(dept);

try {
    const response = await openai.chat.completions.parse({
      model: process.env.OPENAI_MODEL || "gpt-4o-2024-08-06",
      temperature: 0.0,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Transcribe and structure this clinical dictation:\n\n${transcript}` },
      ],
      response_format: zodResponseFormat(schema, "clinical_note"),
    });

    const parsedData = response.choices[0]?.message?.parsed;
    
    if (!parsedData) {
      throw new Error(`OpenAI refusal or empty response: ${response.choices[0]?.message?.refusal || "Unknown"}`);
    }

    // --- ADD THIS LOGGING BLOCK ---
    if ('_clinical_reasoning' in parsedData && typeof parsedData._clinical_reasoning === 'string') {
      logger.log(`[AI Reasoning] ${parsedData._clinical_reasoning}`);
    }
    // ------------------------------

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

  const VITAL_SIGN_PATTERN = /^\d{2,3}(\/\d{2,3})?$/;
  const VISUAL_ACUITY_PATTERN = /^(6|20)\/\d{1,2}$/;
  const MOTOR_POWER_PATTERN = /^\d\/5$/;
  const MOTOR_JOINT_NAMES = new Set([
    "shoulder_left", "shoulder_right",
    "elbow_left", "elbow_right",
    "wrist_left", "wrist_right",
    "hip_left", "hip_right",
    "knee_left", "knee_right",
    "ankle_left", "ankle_right",
  ]);

  function assessConfidence(value: string | null, fieldName: string) {
    if (typeof value !== "string" || value === "NOT_SPECIFIED" || value.trim() === "") {
      confidence.push({ field: fieldName, level: "low", reason: "Missing data" });
      return;
    }
    const trimmed = value.trim();
    if (fieldName.includes("blood_pressure") && !VITAL_SIGN_PATTERN.test(trimmed)) {
      confidence.push({ field: fieldName, level: "low", reason: "Non-numeric value in vital sign field" });
      return;
    }
    if (fieldName === "visual_acuity" && !VISUAL_ACUITY_PATTERN.test(trimmed)) {
      confidence.push({ field: fieldName, level: "low", reason: "Invalid visual acuity format" });
      return;
    }
    if (MOTOR_JOINT_NAMES.has(fieldName) && !MOTOR_POWER_PATTERN.test(trimmed)) {
      confidence.push({ field: fieldName, level: "low", reason: "Non-numeric value in motor power field" });
      return;
    }
    if (trimmed.length < BRIEF_THRESHOLD) {
      confidence.push({ field: fieldName, level: "medium", reason: `Brief extraction (${trimmed.length} chars)` });
    }
  }

for (const field of fields) {
    if (["chief_complaint", "diagnosis", "prescriptions"].includes(field.name)) continue;
    
    if (field.name in aiOutput && aiOutput[field.name] !== null) {
      let val = aiOutput[field.name];
      
      // Catch stringified nulls from the LLM before they hit the frontend
      if (typeof val === "string") {
        const trimmed = val.trim().toUpperCase();
        if (trimmed === "NULL" || trimmed === ":NULL" || trimmed === "NOT_SPECIFIED") {
           val = null;
        }
      }

      if (val !== null) {
        rawFields[field.name] = val;
        if (typeof val === "string") {
          assessConfidence(val, field.name);
        }
      }
    }
  }

  const symptoms = safeString(aiOutput.chief_complaint);
  const diagnosis = safeString(aiOutput.diagnosis);
  const advice = safeString(aiOutput.treatment ?? aiOutput.therapy_plan);

  assessConfidence(safeString(aiOutput.chief_complaint), "symptoms");
  assessConfidence(safeString(aiOutput.diagnosis), "diagnosis");

  const rawPrescriptions = Array.isArray(aiOutput.prescriptions) ? aiOutput.prescriptions : [];
  const rawDiscontinued = Array.isArray(aiOutput.discontinued_medications) ? aiOutput.discontinued_medications : [];
  const discontinued_medications = rawDiscontinued.filter((d): d is string => typeof d === "string");
  const rawAdditional = Array.isArray(aiOutput.additional_clinical_findings) ? aiOutput.additional_clinical_findings : [];
  const additional_clinical_findings = rawAdditional.filter((d): d is string => typeof d === "string");
  const rawRuledOut = Array.isArray(aiOutput.ruled_out_findings) ? aiOutput.ruled_out_findings : [];
  const ruled_out_findings = rawRuledOut.filter((d): d is string => typeof d === "string");
  
  const prescriptions = rawPrescriptions.map((p: Record<string, unknown>, index: number) => {
    const prefix = `prescriptions[${index}].`;

    assessConfidence(safeString(p.name), `${prefix}drug_name`);
    assessConfidence(safeString(p.dosage), `${prefix}dosage`);
    assessConfidence(safeString(p.frequency), `${prefix}frequency`);
    assessConfidence(safeString(p.route), `${prefix}route`);

    return {
      drug_name: safeString(p.name),
      dosage: safeString(p.dosage),
      formulation: safeString(p.formulation),
      frequency: safeString(p.frequency),
      duration: safeString(p.duration),
      route: safeString(p.route),
      instructions: safeString(p.instructions),
    };
  });

  return {
    output: { symptoms, diagnosis, prescriptions, discontinued_medications, additional_clinical_findings, ruled_out_findings, advice, rawFields },
    confidence,
  };
}

export function stripNotSpecified(obj: unknown): unknown {
  if (obj === null || obj === undefined) return null;
  if (typeof obj === 'string') {
    const trimmed = obj.trim();
    if (trimmed === '' || trimmed === 'NOT_SPECIFIED' || trimmed === 'null') return null;
    return obj;
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