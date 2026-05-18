// app/api/voice/transcribe-sync/route.ts
//
// Synchronous fallback transcription endpoint — used when the WebSocket STT
// pipeline fails or degrades mid-session.
//
// The doctor's locally-recorded audio blob is POSTed here after they tap Done.
// We transcribe via the Sarvam REST API (saaras:v3, mode=transcribe) then run
// structureClinicalNotes() on the result.
//
// Sarvam REST supported formats (confirmed from API reference):
//   WAV, MP3, AAC, AIFF, OGG, OPUS, FLAC, MP4/M4A, AMR, WMA, WebM, PCM
//   → WebM from MediaRecorder is explicitly supported.
//
// Response shape:
//   { transcript, structured, fieldConfidence }           — success
//   { transcript, structured: null, error, details? }     — partial failure
//   { error, details? }                                    — hard failure

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import {
  structureClinicalNotes,
  TranscriptTooLongError,
} from "@/lib/voice/structureClinicalNotes";

export const maxDuration = 60;

const SARVAM_REST_URL = "https://api.sarvam.ai/speech-to-text";

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
    logger.error("[transcribe-sync] SARVAM_API_KEY is not set");
    return NextResponse.json(
      { error: "Speech-to-text service not configured" },
      { status: 500 },
    );
  }

  // ── Transcribe via Sarvam REST ─────────────────────────────────────────────
  //
  // We re-send the file with the original MIME type. MediaRecorder typically
  // produces audio/webm (Chromium) or audio/mp4 (Safari) — both are accepted.
  // For PCM blobs, the caller must set the correct MIME type so Sarvam can
  // identify the codec.
  const arrayBuffer = await audioFile.arrayBuffer();
  const rawMimeType = audioFile.type || "audio/webm";

  // Strip codec params — Sarvam rejects "audio/webm;codecs=opus" but accepts "audio/webm"
  const mimeType = rawMimeType.split(";")[0].trim();

  const extMap: Record<string, string> = {
    "audio/webm": "webm",
    "audio/mp4": "mp4",
    "audio/wav": "wav",
    "audio/ogg": "ogg",
    "audio/mpeg": "mp3",
    "audio/flac": "flac",
    "audio/aac": "aac",
  };
  const ext = extMap[mimeType] ?? "webm";

  const sarvamForm = new FormData();
  sarvamForm.append(
    "file",
    new Blob([arrayBuffer], { type: mimeType }),
    `recording.${ext}`,
  );
  sarvamForm.append("model", "saaras:v3");
  sarvamForm.append("mode", "transcribe");
  sarvamForm.append("language_code", "en-IN");

  let sarvamResponse: Response;
  try {
    sarvamResponse = await fetch(SARVAM_REST_URL, {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
      },
      body: sarvamForm,
    });
  } catch (networkErr) {
    const msg = networkErr instanceof Error ? networkErr.message : "Network error";
    logger.error(`[transcribe-sync] Fetch failed: ${msg}`);
    return NextResponse.json(
      { error: "Could not reach speech-to-text service", details: msg },
      { status: 502 },
    );
  }

  if (!sarvamResponse.ok) {
    let errBody = "(no body)";
    try {
      errBody = await sarvamResponse.text();
    } catch {
      /* ignore */
    }
    logger.error(`[transcribe-sync] Sarvam ${sarvamResponse.status}: ${errBody}`);

    if (sarvamResponse.status === 403) {
      return NextResponse.json(
        { error: "Speech-to-text authentication failed" },
        { status: 502 },
      );
    }

    if (sarvamResponse.status === 422) {
      return NextResponse.json(
        {
          error: "Audio format not supported",
          details: `MIME type "${mimeType}" was rejected. ${errBody}`,
        },
        { status: 422 },
      );
    }

    if (sarvamResponse.status === 429) {
      return NextResponse.json(
        { error: "Speech-to-text rate limit exceeded. Please try again shortly." },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { error: "Speech-to-text transcription failed", details: errBody },
      { status: 502 },
    );
  }

  let sarvamData: { transcript?: string; language_code?: string };
  try {
    sarvamData = await sarvamResponse.json();
  } catch {
    logger.error("[transcribe-sync] Failed to parse Sarvam response");
    return NextResponse.json({ error: "Invalid response from speech-to-text service" }, { status: 502 });
  }

  const transcript = sarvamData.transcript?.trim() ?? "";

  if (!transcript) {
    return NextResponse.json({ transcript: "", structured: null });
  }

  // ── Structure with OpenAI ──────────────────────────────────────────────────
  let structured;
  try {
    structured = await structureClinicalNotes(transcript, department);
  } catch (structuringError) {
    logger.error("[transcribe-sync] Structuring failed:", structuringError);

    if (structuringError instanceof TranscriptTooLongError) {
      return NextResponse.json({
        transcript,
        structured: null,
        error: "CONSULTATION_TOO_LONG",
        details: "The dictation exceeds the processing limit.",
      });
    }

    // Return transcript even if structuring fails — better than nothing
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