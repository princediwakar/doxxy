// lib/voice/structureUtils.ts
// Pure structural mapper — no scrubbing, no confidence scoring.
// The Zod schema + OpenAI Strict Mode are the single source of truth.
import type { AIStructuredOutput, FieldConfidence } from "@/types/voice";

const TOP_LEVEL_KEYS = new Set([
  "chief_complaint",
  "diagnosis",
  "treatment",
  "therapy_plan",
  "follow_up",
  "prescriptions",
  "_clinical_reasoning",
]);

export function mapSchemaToOutput(parsedData: Record<string, unknown>): {
  output: AIStructuredOutput;
  confidence: FieldConfidence[];
} {
  const rawFields: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(parsedData)) {
    if (TOP_LEVEL_KEYS.has(key)) continue;
    rawFields[key] = value;
  }

  return {
    output: {
      symptoms: (parsedData.chief_complaint as string) ?? null,
      diagnosis: (parsedData.diagnosis as string) ?? null,
      advice: ((parsedData.treatment ?? parsedData.therapy_plan) as string) ?? null,
      follow_up: (parsedData.follow_up as string) ?? null,
      prescriptions: (parsedData.prescriptions as AIStructuredOutput["prescriptions"]) ?? [],
      rawFields: Object.keys(rawFields).length > 0 ? rawFields : undefined,
    },
    confidence: [],
  };
}
