"use server";

import { structureClinicalNotes } from "@/lib/voice/structureClinicalNotes";
import type { AIStructuredOutput, FieldConfidence } from "@/types/voice";

export async function structureTranscript(
  transcript: string,
  department: string,
): Promise<{ output: AIStructuredOutput | null; confidence: FieldConfidence[]; error?: string }> {
  if (!transcript || transcript.trim().length === 0) {
    return { output: null, confidence: [], error: "Empty transcript" };
  }

  try {
    const result = await structureClinicalNotes(transcript.trim(), department);
    return { output: result.output, confidence: result.confidence };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Structuring failed";
    return { output: null, confidence: [], error: message };
  }
}
