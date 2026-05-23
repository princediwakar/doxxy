// app/api/voice/submit-batch/route.ts
//
// Fast submit endpoint for batch transcription. Takes audio, creates a Sarvam
// batch job, uploads the file, and starts processing — all in < 3 seconds.
// Returns { jobId } so the client can poll independently without holding a
// connection open (evading Render's 100-second HTTP timeout).
//
// Response shape:
//   { jobId }              — success
//   { error, details? }    — failure

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import {
  createSarvamJob,
  getUploadUrls,
  uploadToPresignedUrl,
  startSarvamJob,
} from "@/lib/voice/sarvamBatch";

export const maxDuration = 25;

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const audioFile = formData.get("audio") as File | null;
  if (!audioFile || audioFile.size === 0) {
    return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
  }

  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    logger.error("[submit-batch] SARVAM_API_KEY is not set");
    return NextResponse.json(
      { error: "Speech-to-text service not configured" },
      { status: 500 },
    );
  }

  const rawMime = audioFile.type || "audio/webm";
  const mimeType = rawMime.split(";")[0].trim();
  const ext = mimeType.split("/")[1] ?? "webm";
  const fileName = `recording.${ext}`;

  try {
    const jobId = await createSarvamJob();
    const uploadRes = await getUploadUrls(jobId, [fileName]);
    const uploadUrl = uploadRes.upload_urls[fileName]?.file_url;
    if (!uploadUrl) {
      return NextResponse.json(
        { error: "Failed to get upload URL from speech-to-text service" },
        { status: 502 },
      );
    }

    await uploadToPresignedUrl(uploadUrl, audioFile as unknown as Blob, fileName);
    await startSarvamJob(jobId);

    logger.log(`[submit-batch] Job ${jobId} submitted`);
    return NextResponse.json({ jobId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    logger.error(`[submit-batch] Submission failed: ${msg}`);
    return NextResponse.json(
      { error: "Batch submission failed", details: msg },
      { status: 502 },
    );
  }
}
