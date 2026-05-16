// test-voice-sync.ts
//
// End-to-end test of the synchronous (REST) transcription path.
// Mirrors app/api/voice/transcribe-sync/route.ts — generates audio via macOS
// `say`, POSTs to Sarvam REST API, then runs structureClinicalNotes().
//
// Usage:
//   npx tsx --env-file=.env.local test-voice-sync.ts [text] [department]
//
// Defaults to a neurology dictation if no text is provided.

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const textToSpeak =
  process.argv[2] ||
  "Patient is Marcus Vance, 44-year-old male presenting with episodic paresthesia and intermittent ataxia for three weeks. Lhermitte's sign positive. Hyperreflexia 3 plus bilaterally. Upgoing plantar response on the left. Wide-based gait. Brain fog and fatigue. Rule out demyelinating process. Order MRI brain and entire spine with and without gadolinium. Lumbar puncture for oligoclonal bands and IgG index. Visual evoked potentials. Start oral prednisone if symptoms worsen. Follow up in two weeks.";

const department = process.argv[3] || "Neurology";
const audioFile = path.resolve(process.cwd(), "test-dictation-sync.wav");

// Sarvam REST config — mirrors route.ts
const SARVAM_REST_URL = "https://api.sarvam.ai/speech-to-text";
const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

if (!SARVAM_API_KEY) {
  console.error("SARVAM_API_KEY is not set. Use --env-file=.env.local or export it.");
  process.exit(1);
}

async function main() {
  // ── 1. Generate audio ─────────────────────────────────────────────────────
  console.log(`\n[1] Generating audio for: "${textToSpeak.slice(0, 100)}..."`);
  execSync(
    `say -o "${audioFile}" --data-format=LEI16@16000 "${textToSpeak.replace(/"/g, '\\"')}"`,
  );
  const stat = fs.statSync(audioFile);
  console.log(`    WAV file: ${(stat.size / 1024).toFixed(1)} KB`);

  // ── 2. POST to Sarvam REST API ─────────────────────────────────────────────
  console.log("[2] Transcribing via Sarvam REST API...");

  const audioBuffer = fs.readFileSync(audioFile);
  const blob = new Blob([audioBuffer], { type: "audio/wav" });

  const formData = new FormData();
  formData.append("file", blob, "recording.wav");
  formData.append("model", "saaras:v3");
  formData.append("mode", "transcribe");
  formData.append("language_code", "en-IN");

  const response = await fetch(SARVAM_REST_URL, {
    method: "POST",
    headers: { "api-subscription-key": SARVAM_API_KEY! },
    body: formData,
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => "(no body)");
    console.error(`    Sarvam ${response.status}: ${errBody}`);
    process.exit(1);
  }

  const data = (await response.json()) as { transcript?: string; language_code?: string };
  const transcript = data.transcript?.trim() ?? "";

  if (!transcript) {
    console.error("    Empty transcript returned.");
    process.exit(1);
  }

  console.log(`    Transcript (${transcript.length} chars):`);
  console.log(`    "${transcript.slice(0, 200)}${transcript.length > 200 ? "..." : ""}"`);

  // ── 3. Structure with OpenAI ───────────────────────────────────────────────
  console.log(`\n[3] Structuring clinical notes (Department: ${department})...`);

  // Dynamic import so --env-file has already loaded vars before module eval
  const { structureClinicalNotes } = await import("./lib/voice/structureClinicalNotes");
  const structured = await structureClinicalNotes(transcript, department);

  // ── 4. Validate output shape ───────────────────────────────────────────────
  console.log("[4] Validating structured output...");
  const { output } = structured;
  const issues: string[] = [];

  if (typeof output.symptoms !== "string") issues.push("symptoms: expected string");
  if (typeof output.diagnosis !== "string") issues.push("diagnosis: expected string");
  if (typeof output.advice !== "string") issues.push("advice: expected string");
  if (!Array.isArray(output.prescriptions)) {
    issues.push("prescriptions: expected array");
  } else {
    output.prescriptions.forEach((p, i) => {
      if (typeof p.drug_name !== "string") issues.push(`prescriptions[${i}].drug_name: expected string`);
      if (typeof p.dosage !== "string") issues.push(`prescriptions[${i}].dosage: expected string`);
      if (typeof p.frequency !== "string") issues.push(`prescriptions[${i}].frequency: expected string`);
      if (typeof p.duration !== "string") issues.push(`prescriptions[${i}].duration: expected string`);
      if (typeof p.route !== "string") issues.push(`prescriptions[${i}].route: expected string`);
      if (typeof p.instructions !== "string") issues.push(`prescriptions[${i}].instructions: expected string`);
    });
  }
  if (output.discontinued_medications !== undefined && !Array.isArray(output.discontinued_medications)) {
    issues.push("discontinued_medications: expected array if present");
  }
  if (output.rawFields !== undefined && typeof output.rawFields !== "object") {
    issues.push("rawFields: expected object if present");
  }

  if (issues.length > 0) {
    console.error("    Schema validation FAILED:");
    issues.forEach((i) => console.error(`      - ${i}`));
  } else {
    console.log("    Schema validation PASSED.");
  }

  // ── 5. Print result ────────────────────────────────────────────────────────
  console.log("\n[RESULT] Structured Output:");
  console.log(JSON.stringify(structured, null, 2));

  // ── Cleanup ────────────────────────────────────────────────────────────────
  if (fs.existsSync(audioFile)) fs.unlinkSync(audioFile);
}

main().catch((err) => {
  console.error("\nPipeline failed:", err);
  if (fs.existsSync(audioFile)) fs.unlinkSync(audioFile);
  process.exit(1);
});
