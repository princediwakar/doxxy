// app/api/voice/transcribe-batch/route.ts
//
// Batch fallback transcription endpoint — used when the WebSocket STT pipeline
// fails AND the recorded audio exceeds Sarvam's 30-second REST API limit.
//
// Routes through Sarvam's asynchronous batch API (create → upload → start →
// poll → download) then runs structureClinicalNotes() on the result.
//
// Response shape (same as transcribe-sync so callers don't care which path):
//   { transcript, structured, fieldConfidence }           — success
//   { transcript, structured: null, error, details? }     — partial failure
//   { error, details? }                                    — hard failure

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import {
  structureClinicalNotes,
  TranscriptTooLongError,
} from "@/lib/voice/structureClinicalNotes";
import {
  createSarvamJob,
  getUploadUrls,
  uploadToPresignedUrl,
  startSarvamJob,
  getJobStatus,
  getDownloadUrls,
  downloadTranscript,
  isJobComplete,
  isJobFailed,
} from "@/lib/voice/sarvamBatch";

export const maxDuration = 120; // batch jobs need polling time

const POLL_INTERVAL_MS = 2_000;
const MAX_POLL_ATTEMPTS = 50; // ~100 seconds total

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  // ── Parse multipart form ───────────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const audioFile = formData.get("audio") as File | null;
  const department = (formData.get("department") as string | null) ?? "General";

  if (!audioFile || audioFile.size === 0) {
    return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
  }

  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    logger.error("[transcribe-batch] SARVAM_API_KEY is not set");
    return NextResponse.json(
      { error: "Speech-to-text service not configured" },
      { status: 500 },
    );
  }

  const rawMime = audioFile.type || "audio/webm";
  const mimeType = rawMime.split(";")[0].trim();
  const ext = mimeType.split("/")[1] ?? "webm";
  const fileName = `recording.${ext}`;

  // ── Batch pipeline ─────────────────────────────────────────────────────────
  let jobId: string;
  try {
    // Step 1: Create batch job
    jobId = await createSarvamJob();
    logger.log(`[transcribe-batch] Created job ${jobId}`);

    // Step 2: Get upload URLs
    const uploadRes = await getUploadUrls(jobId, [fileName]);
    const uploadUrl = uploadRes.upload_urls[fileName]?.file_url;
    if (!uploadUrl) {
      return NextResponse.json(
        { error: "Failed to get upload URL from speech-to-text service" },
        { status: 502 },
      );
    }

    // Step 3: Upload
    await uploadToPresignedUrl(uploadUrl, audioFile as unknown as Blob, fileName);

    // Step 4: Start processing
    await startSarvamJob(jobId);
    logger.log(`[transcribe-batch] Job ${jobId} started`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    logger.error(`[transcribe-batch] Batch setup failed: ${msg}`);
    return NextResponse.json(
      { error: "Batch submission failed", details: msg },
      { status: 502 },
    );
  }

  // Step 5: Poll until complete
  let transcript = "";
  try {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      await sleep(POLL_INTERVAL_MS);

      const status = await getJobStatus(jobId);

      if (isJobFailed(status.job_state)) {
        logger.error(
          `[transcribe-batch] Job ${jobId} failed: ${status.error_message}`,
        );
        return NextResponse.json(
          {
            error: "Transcription processing failed",
            details: status.error_message || "Unknown batch error",
          },
          { status: 502 },
        );
      }

      if (isJobComplete(status.job_state)) {
        const outputFiles: string[] = [];
        for (const detail of status.job_details || []) {
          for (const output of detail.outputs || []) {
            if (output.file_name) outputFiles.push(output.file_name);
          }
        }

        if (outputFiles.length === 0) {
          return NextResponse.json(
            { error: "Transcription produced no output files" },
            { status: 502 },
          );
        }

        // Get download URLs (with retry for Sarvam consistency delay)
        let downloadRes;
        for (let retry = 0; retry < 5; retry++) {
          try {
            downloadRes = await getDownloadUrls(jobId, outputFiles);
            break;
          } catch (e: unknown) {
            const err = e as { statusCode?: number; responseBody?: string };
            if (err.statusCode === 400 && err.responseBody?.includes("COMPLETED")) {
              await sleep(2000);
            } else {
              throw e;
            }
          }
        }
        if (!downloadRes) {
          return NextResponse.json(
            { error: "Failed to retrieve transcription results" },
            { status: 502 },
          );
        }

        // Download all output files and concatenate
        const transcripts: string[] = [];
        for (const f of outputFiles) {
          const dUrl = downloadRes.download_urls[f]?.file_url;
          if (dUrl) {
            const tFile = await downloadTranscript(dUrl);
            if (tFile.transcript) transcripts.push(tFile.transcript);
          }
        }
        transcript = transcripts.join("\n").trim();
        break;
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    logger.error(`[transcribe-batch] Polling failed: ${msg}`);
    return NextResponse.json(
      { error: "Transcription polling failed", details: msg },
      { status: 502 },
    );
  }

  if (!transcript) {
    return NextResponse.json(
      { error: "Batch transcription timed out — please try again" },
      { status: 504 },
    );
  }

  logger.log(`[transcribe-batch] Transcript: ${transcript.length} chars`);

  // ── Structure with OpenAI ──────────────────────────────────────────────────
  let structured;
  try {
    structured = await structureClinicalNotes(transcript, department);
  } catch (structuringError) {
    logger.error("[transcribe-batch] Structuring failed:", structuringError);

    if (structuringError instanceof TranscriptTooLongError) {
      return NextResponse.json({
        transcript,
        structured: null,
        error: "CONSULTATION_TOO_LONG",
        details: "The dictation exceeds the processing limit.",
      });
    }

    return NextResponse.json({
      transcript,
      structured: null,
      error: "Structuring failed",
      details:
        structuringError instanceof Error
          ? structuringError.message
          : "Unknown error",
    });
  }

  return NextResponse.json({
    transcript,
    structured: structured.output,
    fieldConfidence: structured.confidence,
  });
}
