// src/lib/voice/structureClinicalNotes.ts
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { logger } from "@/lib/logger";
import { getSchemaForDepartment } from "@/lib/consultationNotesSchemas";
import { mapDepartmentName } from "@/components/consultation/constants";
import { getAllFieldsFromSchema, safeString, BRIEF_THRESHOLD, isBlank } from "@/lib/schemaUtils";
import type { NoteFieldConfig } from "@/lib/schemaUtils";
import type { AIStructuredOutput, FieldConfidence } from "@/types/voice";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("[structureClinicalNotes] OPENAI_API_KEY is not set.");
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  maxRetries: 3,
});

const SURGICAL_SYSTEM_PROMPT = `You are an elite clinical extraction engine. Your sole objective is to map chaotic, rapid-fire, mixed-language clinical dictation into a pristine structured schema. 

**Core Directive:** You are a transcriber and structural mapper, NOT a summarizer. Extract exactly what was said with absolute clinical fidelity.

## 1. Think Before Mapping (Chain of Thought)
Before populating the clinical fields, you MUST use the \`_clinical_reasoning\` field to explicitly state your logic for:
- Resolving mid-sentence doctor corrections (e.g., "Start Pan-D... wait, make it Omez").
- Identifying conditional plans (PRN medications, "if/then" directives).
- Translating Hinglish or colloquial terms to standard clinical English based on context.

## 2. Absolute Clinical Fidelity
- **Preserve Jargon:** NEVER dilute, translate, or simplify precise medical terminology (e.g., "metamorphopsia", "erythema"). Do not dumb down the doctor's vocabulary.
- **No Medical Inflation:** If the doctor says "pain", do not output "severe acute pain". 
- **Preserve Exactness:** 3 days is 3 days. Do not convert to "acute". Preserve exact percentiles, fractional units, and standard medical acronyms.

## 3. Workflow & Conditional Directives (CRITICAL)
- **Conditional / PRN Prescriptions:** If a doctor prescribes a medication "as needed" or "if symptoms worsen", it IS an active prescription. Map it to \`prescriptions\` and put the condition in the \`instructions\` field. Do not drop it.
- **Mandatory Workflow:** Return precautions ("call immediately if X"), follow-up timelines ("see back in 2 weeks"), and referral orders MUST be explicitly captured in \`follow_up\` or \`referrals\`. They are hard clinical data. Do not ignore them.

## 4. Surgical Schema Placement
- **Explicit Negations & Risks:** "No chest pain", "Lungs clear" belong strictly in \`ruled_out_findings\`. However, specific risk negations (e.g., "No Suicidal Ideation") must go into their dedicated schema fields (e.g., \`risk_assessment\`) if available.
- **True Discontinuations:** Only populate \`discontinued_medications\` if a previously taken drug is stopped.
- **The Spillover Protocol:** Use \`additional_clinical_findings\` ONLY if a clinical fact fundamentally cannot be mapped to the provided schema fields. 

## 5. Goal-Driven Safety 
- If an anatomical side (Left/Right) is required but not stated, leave it null. Do not guess.
- **STRICT NULL HANDLING:** If a value is unknown or missing, use strict JSON \`null\`. You are STRICTLY FORBIDDEN from outputting stringified nulls like "null", ":null}", "N/A", or "NOT_SPECIFIED".`;

function getSpecialtyInstructions(department: string): string {
  switch (department) {
    case "Ophthalmology":
      return `- Format visual acuity strictly as standard fractions (e.g., '20/20', '6/6'). Convert STT phonetic fractions (e.g., '20 by 20').
- Left/Right specificity is absolute. Do not guess.`;
    case "Neurology":
      return `- Format motor power as standard grades (e.g., '5/5'). Map eponyms (Patellar, Babinski) to exact anatomical fields.
- Deep Tendon Reflexes must be graded (e.g., '2+', '3+').`;
    case "Psychiatry":
      return `- CRITICAL: Any mention of Suicidal Ideation (SI) or Homicidal Ideation (HI), even if denied (e.g., 'No SI/HI'), MUST be extracted into the risk_assessment field.`;
    case "Gynecology":
      return `- Preserve exact Obstetric History formats (Gravida/Para/Abortus/Live). Correct STT errors (e.g., 'G 2 P to' -> 'G2P2').`;
    case "Pediatrics":
      return `- DO NOT round ages. Keep exact months, weeks, or days.
- Preserve exact growth percentiles.`;
    case "EmergencyMedicine":
      return `- Prioritize timing and sequence of acute interventions. Clearly distinguish between what was given in the ER vs what is prescribed for discharge.`;
    default:
      return "";
  }
}

function generateSystemPrompt(department: string): string {
  const specialtyRules = getSpecialtyInstructions(department);
  return `${SURGICAL_SYSTEM_PROMPT}\n\nDEPARTMENT FOCUS: ${department}\n${specialtyRules ? `SPECIALTY RULES:\n${specialtyRules}` : ""}`;
}

const MAX_TRANSCRIPT_CHARS = 80_000;

export class TranscriptTooLongError extends Error {
  constructor(public length: number, public limit: number) {
    super(`Transcript length (${length}) exceeds the clinical safety limit of ${limit} characters.`);
    this.name = 'TranscriptTooLongError';
  }
}

export async function structureClinicalNotes(
  transcript: string,
  department: string,
): Promise<{ output: AIStructuredOutput; confidence: FieldConfidence[] }> {

  if (transcript.length > MAX_TRANSCRIPT_CHARS) {
    logger.error(`[structureClinicalNotes] REJECTED: Transcript too long.`);
    throw new TranscriptTooLongError(transcript.length, MAX_TRANSCRIPT_CHARS);
  }

  const dept = department ? mapDepartmentName(department) : "General";
  const schema = getSchemaForDepartment(dept);
  const fields = getAllFieldsFromSchema(schema);
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

    if ('_clinical_reasoning' in parsedData && typeof parsedData._clinical_reasoning === 'string') {
      logger.log(`[AI Reasoning] ${parsedData._clinical_reasoning}`);
    }

    return mapAndScoreOutput(parsedData, fields);

  } catch (error) {
    logger.error("[structureClinicalNotes] Failed to structure notes.", error);
    throw new Error(`Failed to structure clinical notes: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function mapAndScoreOutput(
  aiOutput: Record<string, unknown>,
  fields: NoteFieldConfig[],
): { output: AIStructuredOutput; confidence: FieldConfidence[] } {
  const rawFields: Record<string, unknown> = {};
  const confidence: FieldConfidence[] = [];

  const VITAL_SIGN_PATTERN = /^\d{2,3}(\.\d{1,2})?(\/\d{2,3})?$/;
  const VISUAL_ACUITY_PATTERN = /^(6|20)\/\d{1,2}$/;
  const MOTOR_POWER_PATTERN = /^\d\/5$/;
  const MOTOR_JOINT_NAMES = new Set([
    "shoulder_left", "shoulder_right", "elbow_left", "elbow_right",
    "wrist_left", "wrist_right", "hip_left", "hip_right",
    "knee_left", "knee_right", "ankle_left", "ankle_right",
  ]);

  function assessConfidence(value: string | null, fieldName: string) {
    if (typeof value !== "string" || value.trim() === "") {
      confidence.push({ field: fieldName, level: "low", reason: "Missing data" });
      return;
    }
    const trimmed = value.trim();
    if (fieldName.includes("blood_pressure") && !VITAL_SIGN_PATTERN.test(trimmed)) {
      confidence.push({ field: fieldName, level: "low", reason: "Non-numeric vital sign format" });
      return;
    }
    if (fieldName.startsWith("visual_acuity_") && !VISUAL_ACUITY_PATTERN.test(trimmed)) {
      confidence.push({ field: fieldName, level: "low", reason: "Invalid visual acuity fraction" });
      return;
    }
    if (MOTOR_JOINT_NAMES.has(fieldName) && !MOTOR_POWER_PATTERN.test(trimmed)) {
      confidence.push({ field: fieldName, level: "low", reason: "Non-standard motor power grade" });
      return;
    }
    if (trimmed.length < BRIEF_THRESHOLD) {
      confidence.push({ field: fieldName, level: "medium", reason: `Brief extraction (${trimmed.length} chars)` });
    }
  }

  for (const field of fields) {
    if (
      [
        "chief_complaint", "diagnosis", "prescriptions",
        "discontinued_medications", "additional_clinical_findings",
        "ruled_out_findings", "treatment", "therapy_plan", "follow_up"
      ].includes(field.name)
    ) {
      continue;
    }

    if (field.name in aiOutput && aiOutput[field.name] !== null) {
      const val = stripNotSpecified(aiOutput[field.name]);

      if (val !== null) {
        rawFields[field.name] = val;

        if (typeof val === "string") {
          assessConfidence(val, field.name);
        } else if (typeof val === "object" && !Array.isArray(val)) {
          for (const [key, innerVal] of Object.entries(val)) {
            if (typeof innerVal === "string") {
              assessConfidence(innerVal, key);
            }
          }
        }
      }
    }
  }

  const symptoms = safeString(stripNotSpecified(aiOutput.chief_complaint));
  const diagnosis = safeString(stripNotSpecified(aiOutput.diagnosis));
  const advice = safeString(stripNotSpecified(aiOutput.treatment ?? aiOutput.therapy_plan));
  const follow_up = safeString(stripNotSpecified(aiOutput.follow_up));

  if (symptoms) assessConfidence(symptoms, "symptoms");
  if (diagnosis) assessConfidence(diagnosis, "diagnosis");
  if (advice) assessConfidence(advice, "advice");
  if (follow_up) assessConfidence(follow_up, "follow_up");

  const rawPrescriptions = Array.isArray(aiOutput.prescriptions) ? aiOutput.prescriptions : [];
  const rawDiscontinued = Array.isArray(aiOutput.discontinued_medications) ? aiOutput.discontinued_medications : [];
  const rawAdditional = Array.isArray(aiOutput.additional_clinical_findings) ? aiOutput.additional_clinical_findings : [];
  const rawRuledOut = Array.isArray(aiOutput.ruled_out_findings) ? aiOutput.ruled_out_findings : [];

  const discontinued_medications = rawDiscontinued.map(stripNotSpecified).filter((d): d is string => typeof d === "string");
  const additional_clinical_findings = rawAdditional.map(stripNotSpecified).filter((d): d is string => typeof d === "string");
  const ruled_out_findings = rawRuledOut.map(stripNotSpecified).filter((d): d is string => typeof d === "string");

  discontinued_medications.forEach(finding => assessConfidence(finding, "discontinued_medications"));
  additional_clinical_findings.forEach(finding => assessConfidence(finding, "additional_clinical_findings"));
  ruled_out_findings.forEach(finding => assessConfidence(finding, "ruled_out_findings"));

  const prescriptions = rawPrescriptions
    .map((p: Record<string, unknown>, index: number) => {
      const drug_name = safeString(stripNotSpecified(p.name));
      const dosage = safeString(stripNotSpecified(p.dosage));
      const formulation = safeString(stripNotSpecified(p.formulation));
      const frequency = safeString(stripNotSpecified(p.frequency));
      const duration = safeString(stripNotSpecified(p.duration));
      const route = safeString(stripNotSpecified(p.route));
      const instructions = safeString(stripNotSpecified(p.instructions));

      if (!drug_name) return null; // Drop empty drug records

      const prefix = `prescriptions[${index}].`;
      assessConfidence(drug_name, `${prefix}drug_name`);
      if (dosage) assessConfidence(dosage, `${prefix}dosage`);
      if (frequency) assessConfidence(frequency, `${prefix}frequency`);

      return { drug_name, dosage, formulation, frequency, duration, route, instructions };
    })
    .filter((p) => p !== null);

  return {
    output: { 
      symptoms, diagnosis, prescriptions, discontinued_medications, 
      additional_clinical_findings, ruled_out_findings, advice, follow_up, rawFields 
    },
    confidence,
  };
}

// Upgraded Scrubber: Annihilates hallucinated JSON artifacts and empty structures
export function stripNotSpecified(obj: unknown): unknown {
  if (isBlank(obj)) return null;

  if (typeof obj === 'string') {
    const trimmed = obj.trim();
    // Catch common LLM stringification hallucinations
    if (trimmed === "null" || trimmed === ":null}" || trimmed === "{}" || trimmed === "[]" || trimmed === "N/A" || trimmed.toLowerCase() === "not_specified") {
      return null;
    }
    return trimmed;
  }

  if (Array.isArray(obj)) {
    const cleaned = obj.map(stripNotSpecified).filter((v) => v !== null && v !== "");
    return cleaned.length === 0 ? null : cleaned;
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const cleaned = stripNotSpecified(value);
      if (cleaned !== null && cleaned !== "") {
        result[key] = cleaned;
      }
    }
    return Object.keys(result).length === 0 ? null : result;
  }
  return obj;
}