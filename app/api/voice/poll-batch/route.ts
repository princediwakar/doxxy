// app/api/voice/poll-batch/route.ts
//
// Lightweight poll endpoint for batch transcription status. Takes a Sarvam
// jobId, checks status, and returns the raw transcript when done.
//
// Separated from submit-batch so the client can poll without holding a
// long-lived HTTP connection. No OpenAI structuring here — that's handled
// by the client via the structureTranscript server action.
//
// Response shape:
//   { status: "processing" }              — job still running
//   { status: "done", transcript }        — job complete, raw transcript
//   { status: "error", error }            — job failed or internal error

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import {
  getJobStatus,
  getDownloadUrls,
  downloadTranscript,
  isJobComplete,
  isJobFailed,
  isJobRunning,
} from "@/lib/voice/sarvamBatch";

export const maxDuration = 25;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "jobId is required" }, { status: 400 });
  }

  try {
    const status = await getJobStatus(jobId);

    if (isJobFailed(status.job_state)) {
      logger.error(`[poll-batch] Job ${jobId} failed: ${status.error_message}`);
      return NextResponse.json({
        status: "error",
        error: status.error_message || "Transcription processing failed",
      });
    }

    if (isJobRunning(status.job_state)) {
      return NextResponse.json({ status: "processing" });
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
          { status: "error", error: "Transcription produced no output files" },
        );
      }

      const downloadRes = await getDownloadUrls(jobId, outputFiles);
      const transcripts: string[] = [];
      for (const f of outputFiles) {
        const dUrl = downloadRes.download_urls[f]?.file_url;
        if (dUrl) {
          const tFile = await downloadTranscript(dUrl);
          if (tFile.transcript) transcripts.push(tFile.transcript);
        }
      }

      const transcript = transcripts.join("\n").trim();
      logger.log(`[poll-batch] Job ${jobId} complete: ${transcript.length} chars`);
      return NextResponse.json({ status: "done", transcript });
    }

    // Unknown state — treat as still processing
    return NextResponse.json({ status: "processing" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    logger.error(`[poll-batch] Poll failed for job ${jobId}: ${msg}`);
    return NextResponse.json({ status: "error", error: msg });
  }
}
