// lib/voice/structureClinicalNotes.ts
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { logger } from "@/lib/logger";
import { getSchemaForDepartment } from "@/lib/consultationNotesSchemas";
import { mapDepartmentName } from "@/components/consultation/constants";
import { getAllFieldsFromSchema } from "@/lib/schemaUtils";
import { mapAndScoreOutput } from "./structureUtils";
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

## 4. Surgical Schema Placement & Narrative Split
- **Chief Complaint vs. HPI:** \`chief_complaint\` MUST remain brief—the core reason for the visit (e.g., "Left knee pain"). \`history_of_present_illness\` (HPI) is the detailed narrative.
- **Explicit Negations & Risks:** "No chest pain", "Lungs clear" MUST be integrated directly into \`history_of_present_illness\`, or into dedicated examination fields if applicable. Do NOT clutter the chief complaint.
- **True Discontinuations:** Medications that are stopped MUST be documented in the \`treatment\` or \`therapy_plan\` field.
- **The Spillover Protocol:** If a clinical fact fundamentally cannot be mapped to the provided specific schema fields, integrate it into \`history_of_present_illness\` (for context/history) or \`treatment\` (for management). Do NOT discard clinical facts.

## 5. Global Cohesion & Zero Duplication (CRITICAL)
- **Holistic Mapping:** Treat the entire JSON schema as a single, unified clinical document. 
- **Mutual Exclusivity:** A single clinical fact must exist in ONE field only. Do not copy-paste or duplicate information across multiple fields (e.g., do not put "Asthma" in both Past Medical History and Diagnosis, or the same lung findings in both Physical and Systemic Examination).
- **Field Hierarchy:** Route data to the most specific and clinically appropriate field available. Once placed, move on.

## 6. Goal-Driven Safety 
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

export function generateSystemPrompt(department: string): string {
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
  existingData?: Record<string, unknown>,
): Promise<{ output: AIStructuredOutput; confidence: FieldConfidence[] }> {

  if (transcript.length > MAX_TRANSCRIPT_CHARS) {
    logger.error(`[structureClinicalNotes] REJECTED: Transcript too long.`);
    throw new TranscriptTooLongError(transcript.length, MAX_TRANSCRIPT_CHARS);
  }

  const dept = department ? mapDepartmentName(department) : "General";
  const schema = getSchemaForDepartment(dept);
  const fields = getAllFieldsFromSchema(schema);
  const systemPrompt = generateSystemPrompt(dept);

  const hasExisting = existingData && Object.keys(existingData).length > 0;
  const userMessage = hasExisting
    ? `Here is the CURRENT state of the patient's clinical notes:
\`\`\`json
${JSON.stringify(existingData, null, 2)}
\`\`\`

The doctor has provided an ADDITIONAL dictation. You must intelligently update the existing notes based on this new dictation:
1. PRESERVE all existing data unless the new dictation explicitly contradicts or corrects it.
2. UPDATE or OVERWRITE fields if the doctor corrects a previous statement (e.g., changing a dosage, negating a symptom).
3. APPEND new prescriptions, symptoms, or instructions to the existing arrays/fields.

Here is the new additional dictation:
\n${transcript}`
    : `Transcribe and structure this clinical dictation:\n\n${transcript}`;

  try {
    const response = await openai.chat.completions.parse({
      model: process.env.OPENAI_MODEL || "gpt-4o-2024-08-06",
      temperature: 0.0,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
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
