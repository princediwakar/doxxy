// test-voice-streaming.ts
//
// End-to-end test of the streaming (WebSocket) transcription path.
// Connects directly to Sarvam's WS endpoint from Node.js — no browser proxy needed
// since Node's WS library can set custom headers.
//
// Usage:
//   npx tsx --env-file=.env.local test-voice-streaming.ts [text] [department]
//
// Defaults to a neurology dictation if no text is provided.

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import WebSocket from "ws";

const textToSpeak =
  process.argv[2] ||
  "Patient is Marcus Vance, 44-year-old male presenting with episodic paresthesia and intermittent ataxia for three weeks. Lhermitte's sign positive. Hyperreflexia 3 plus bilaterally. Upgoing plantar response on the left. Wide-based gait. Brain fog and fatigue. Rule out demyelinating process. Order MRI brain and entire spine with and without gadolinium. Lumbar puncture for oligoclonal bands and IgG index. Visual evoked potentials. Start oral prednisone if symptoms worsen. Follow up in two weeks.";

const department = process.argv[3] || "Neurology";
const audioFile = path.resolve(process.cwd(), "test-dictation-streaming.wav");

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
if (!SARVAM_API_KEY) {
  console.error("SARVAM_API_KEY is not set. Use --env-file=.env.local or export it.");
  process.exit(1);
}

// ─── WAV header parser ────────────────────────────────────────────────────────

function parseWav(buffer: Buffer): { sampleRate: number; pcmData: Buffer; pcmDurationS: number } {
  // WAV header: 44 bytes, then PCM data
  const sampleRate = buffer.readUInt32LE(24);
  const bitsPerSample = buffer.readUInt16LE(34);
  const numChannels = buffer.readUInt16LE(22);
  const dataSize = buffer.readUInt32LE(40);
  const pcmData = buffer.subarray(44, 44 + dataSize);

  const pcmDurationS = dataSize / (sampleRate * numChannels * (bitsPerSample / 8));

  return { sampleRate, pcmData, pcmDurationS };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // ── 1. Generate audio ─────────────────────────────────────────────────────
  console.log(`\n[1] Generating audio for: "${textToSpeak.slice(0, 100)}..."`);
  execSync(
    `say -o "${audioFile}" --data-format=LEI16@16000 "${textToSpeak.replace(/"/g, '\\"')}"`,
  );
  const stat = fs.statSync(audioFile);
  console.log(`    WAV file: ${(stat.size / 1024).toFixed(1)} KB`);

  const wavBuffer = fs.readFileSync(audioFile);
  const { sampleRate, pcmData, pcmDurationS } = parseWav(wavBuffer);
  console.log(`    Sample rate: ${sampleRate} Hz, PCM: ${(pcmData.length / 1024).toFixed(1)} KB, Duration: ${pcmDurationS.toFixed(1)}s`);

  // ── 2. Connect to Sarvam WebSocket ─────────────────────────────────────────
  console.log("[2] Connecting to Sarvam WebSocket STT...");

  const params = new URLSearchParams({
    "language-code": "en-IN",
    model: "saaras:v3",
    mode: "transcribe",
    sample_rate: String(sampleRate),
    input_audio_codec: "pcm_s16le",
    flush_signal: "true",
  });

  const wsUrl = `wss://api.sarvam.ai/speech-to-text/ws?${params.toString()}`;
  console.log(`    URL: wss://api.sarvam.ai/speech-to-text/ws?${params.toString()}`);

  const transcriptPromise = new Promise<string>((resolve, reject) => {
    const ws = new WebSocket(wsUrl, {
      headers: { "Api-Subscription-Key": SARVAM_API_KEY },
    });

    let transcript = "";
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error("Timed out waiting for transcription"));
    }, 120_000);

    ws.on("open", () => {
      console.log("    Connected. Streaming PCM chunks...");

      // Stream PCM in ~100ms chunks (~3200 bytes at 16kHz 16-bit mono)
      const CHUNK_MS = 100;
      const bytesPerMs = sampleRate * 2; // 16-bit mono = 2 bytes per sample
      const chunkSize = Math.ceil(bytesPerMs * (CHUNK_MS / 1000));
      // Align to 2-byte boundary
      const alignedChunkSize = chunkSize - (chunkSize % 2);

      let offset = 0;
      let chunkIndex = 0;

      function sendNextChunk() {
        if (offset >= pcmData.length) {
          // All audio sent — flush and wait for final transcript
          console.log(`    Sent ${chunkIndex} chunks. Flushing...`);
          ws.send(JSON.stringify({ type: "flush" }));
          return;
        }

        const end = Math.min(offset + alignedChunkSize, pcmData.length);
        const chunk = pcmData.subarray(offset, end);
        offset = end;

        ws.send(
          JSON.stringify({
            audio: {
              data: Buffer.from(chunk).toString("base64"),
              sample_rate: String(sampleRate),
              encoding: "audio/wav",
            },
          }),
        );

        chunkIndex++;
        // Schedule next chunk — simulate real-time streaming
        setTimeout(sendNextChunk, CHUNK_MS);
      }

      sendNextChunk();
    });

    ws.on("message", (data: WebSocket.Data) => {
      let msg: { type: string; data?: Record<string, unknown> };
      try {
        msg = JSON.parse(data.toString());
      } catch {
        console.warn("    [ws] unparseable message");
        return;
      }

      switch (msg.type) {
        case "data": {
          const text = msg.data?.transcript;
          if (typeof text === "string" && text.trim()) {
            transcript = (transcript + " " + text.trim()).trim();
            console.log(`    [transcript] "${text.trim()}"`);
          }
          break;
        }
        case "events":
          console.log(`    [VAD] ${msg.data?.signal_type}`);
          break;
        case "error": {
          const errMsg = msg.data?.error ?? "Unknown error";
          const errCode = msg.data?.code ?? "";
          console.error(`    [error] ${errCode}: ${errMsg}`);
          break;
        }
        default:
          console.warn(`    [ws] unknown type: "${msg.type}"`);
      }
    });

    ws.on("error", (err) => {
      clearTimeout(timeout);
      reject(new Error(`WebSocket error: ${err.message}`));
    });

    ws.on("close", (code, reason) => {
      clearTimeout(timeout);
      console.log(`    Connection closed: code=${code} reason="${reason}"`);

      if (transcript) {
        resolve(transcript);
      } else {
        reject(new Error(`WebSocket closed with no transcript (code=${code})`));
      }
    });
  });

  const transcript = await transcriptPromise;

  console.log(`\n    Final transcript (${transcript.length} chars):`);
  console.log(`    "${transcript.slice(0, 200)}${transcript.length > 200 ? "..." : ""}"`);

  // ── 3. Structure with OpenAI ───────────────────────────────────────────────
  console.log(`\n[3] Structuring clinical notes (Department: ${department})...`);

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
