import { safeString, BRIEF_THRESHOLD, isBlank } from "@/lib/schemaUtils";
import type { NoteFieldConfig } from "@/lib/schemaUtils";
import type { AIStructuredOutput, FieldConfidence } from "@/types/voice";

// Upgraded Scrubber: Annihilates hallucinated JSON artifacts and empty structures
export function stripNotSpecified(obj: unknown): unknown {
  if (isBlank(obj)) return null;

  if (typeof obj === 'string') {
    const trimmed = obj.trim();
    if (trimmed === "") return null;
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

export function mapAndScoreOutput(
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
        "treatment", "therapy_plan", "follow_up"
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

  const prescriptions = rawPrescriptions
    .map((p: Record<string, unknown>, index: number) => {
      const drug_name = safeString(stripNotSpecified(p.name));
      const dosage = safeString(stripNotSpecified(p.dosage));
      const formulation = safeString(stripNotSpecified(p.formulation));
      const frequency = safeString(stripNotSpecified(p.frequency));
      const duration = safeString(stripNotSpecified(p.duration));
      const route = safeString(stripNotSpecified(p.route));
      const instructions = safeString(stripNotSpecified(p.instructions));

      if (!drug_name) return null;

      const prefix = `prescriptions[${index}].`;
      assessConfidence(drug_name, `${prefix}drug_name`);
      if (dosage) assessConfidence(dosage, `${prefix}dosage`);
      if (frequency) assessConfidence(frequency, `${prefix}frequency`);

      return { drug_name, dosage, formulation, frequency, duration, route, instructions };
    })
    .filter((p) => p !== null);

  return {
    output: { 
      symptoms, diagnosis, prescriptions, advice, follow_up, rawFields 
    },
    confidence,
  };
}
