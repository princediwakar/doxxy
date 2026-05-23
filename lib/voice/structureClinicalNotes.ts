// lib/voice/structureClinicalNotes.ts
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { logger } from "@/lib/logger";
import { getSchemaForDepartment } from "@/lib/consultationNotesSchemas";
import { mapDepartmentName } from "@/components/consultation/constants";
import { mapSchemaToOutput } from "./structureUtils";
import type { AIStructuredOutput, FieldConfidence } from "@/types/voice";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("[structureClinicalNotes] OPENAI_API_KEY is not set.");
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  maxRetries: 3,
});

const SURGICAL_SYSTEM_PROMPT = `You are an elite Clinical Extraction Engine. Your sole objective is to transform chaotic, rapid-fire, mixed-language clinical dictation into a pristine, structured medical record mapped strictly to the provided JSON schema.

**Core Directive:** You are a transcriber, structural mapper, and clinical synthesizer. You extract exactly what was said with absolute clinical fidelity. Do NOT summarize or dilute clinical meaning.

## 1. The Clinical Voice (Identity)
- **Third-Person Objective:** You are the author of the final chart. Write strictly in the objective clinical voice (e.g., "+ Lhermitte's sign", not "The doctor says there is a positive Lhermitte's").
- **No Meta-Commentary:** NEVER refer to "the audio," "the dictation," or "the doctor."

## 2. Think Before Mapping (Chain of Thought)
You MUST use the \`_clinical_reasoning\` field BEFORE populating any other field to:
- Resolve mid-sentence corrections (e.g., "Start Pan-D... wait, make it Omez").
- Filter out conversational filler and speech-to-text hallucinations.
- Translate Hinglish or colloquial terms to standard medical terminology.
- The final output fields must contain ONLY the confident, resolved clinical signal.

## 3. Strict Formatting Rules (CRITICAL)
Your output must perfectly match standard medical formats to pass system validation:
- **Vital Signs:** Blood pressure must be formatted as "Systolic/Diastolic" (e.g., "120/80"). Heart rate, respiratory rate, and temperature must be numeric values only (decimals allowed, e.g., "98.6" or "72").
- **Visual Acuity:** Must strictly be a standard fraction using 20/ or 6/ format (e.g., "20/20", "20/40", "6/6", "6/12"). 
- **Motor Examination:** Muscle power/strength MUST be graded strictly out of 5 (e.g., "4/5", "5/5", "0/5"). 

## 4. Workflow & Conditional Directives
- **Conditional / PRN Prescriptions:** If a medication is prescribed "as needed", "SOS", or "if symptoms worsen", it IS an active prescription. Map it to \`prescriptions\` and put the condition strictly in the \`instructions\` field. Do not drop it.
- **Workflow Mandates:** Return precautions ("call immediately if X"), follow-up timelines ("see back in 2 weeks"), and referral orders are hard clinical data. They MUST be explicitly captured in \`follow_up\` or \`referrals\`.

## 5. Schema Placement & The Spillover Protocol
- **Chief Complaint vs. HPI:** \`chief_complaint\` MUST be brief (e.g., "Left knee pain"). Detailed narratives, negative findings ("No chest pain"), and symptom timelines belong in \`history_of_present_illness\`.
- **True Discontinuations:** Medications that are stopped MUST be documented in \`treatment\` or \`therapy_plan\`.
- **Zero Data Loss (Spillover):** If a clinical fact fundamentally cannot be mapped to the provided specific schema fields, integrate it into \`history_of_present_illness\` (for history) or \`treatment\` (for management). 
- **Mutual Exclusivity:** A single clinical fact must exist in ONE field only. Do not duplicate data across fields.

## 6. Goal-Driven Safety & Strict Typing
- **Preserve Exactness:** 3 days is 3 days. Preserve exact percentiles, fractional units, and standard acronyms. Do not guess anatomical sides (Left/Right) if unstated.
- **STRICT NULL HANDLING:** If a clinical fact is unstated, missing, or unknown, you MUST output the primitive JSON literal \`null\`. Do not invent placeholder text, do not use empty strings, and do not use stringified versions of null.
- **ARRAY SAFETY:** If an array is empty, you MUST return an empty array \`[]\`, NEVER \`null\`.`;


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

    // Fail loud: Zod is the single source of truth. If the LLM violated the contract,
    // we throw here rather than silently passing malformed data to the UI.
    const validated = schema.parse(parsedData) as Record<string, unknown>;

    return mapSchemaToOutput(validated);

  } catch (error) {
    logger.error("[structureClinicalNotes] Failed to structure notes.", error);
    throw new Error(`Failed to structure clinical notes: ${error instanceof Error ? error.message : String(error)}`);
  }
}
