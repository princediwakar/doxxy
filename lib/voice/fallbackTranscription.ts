// lib/voice/fallbackTranscription.ts

export interface FallbackProgress {
  phase: "submitting" | "polling";
  attempt: number;
  maxAttempts: number;
}

export async function performFallbackTranscription(
  blob: Blob,
  department: string,
  mimeType: string,
  duration: number,
  wsTranscript: string,
  onProgress?: (progress: FallbackProgress) => void,
): Promise<string> {
  const formData = new FormData();
  formData.append("audio", blob, `recording.${mimeType.split("/")[1]?.split(";")[0] ?? "webm"}`);
  formData.append("department", department);

  if (duration > 30) {
    onProgress?.({ phase: "submitting", attempt: 0, maxAttempts: 15 });
    const submitRes = await fetch("/api/voice/submit-batch", { method: "POST", body: formData });
    if (!submitRes.ok) throw new Error("Submission failed");
    const { jobId } = await submitRes.json();

    let attempt = 0;
    while (attempt < 15) {
      const delay = Math.min(3000 * Math.pow(1.5, attempt), 15000);
      await new Promise(r => setTimeout(r, delay));
      attempt++;
      onProgress?.({ phase: "polling", attempt, maxAttempts: 15 });

      const pollRes = await fetch(`/api/voice/poll-batch?jobId=${jobId}`);
      if (!pollRes.ok) throw new Error("Poll HTTP error");

      const pollData = await pollRes.json();
      if (pollData.status === "done") return pollData.transcript;
      if (pollData.status === "error") throw new Error(pollData.error || "Batch processing failed on server");
    }
    throw new Error("Polling timed out");
  } else {
    const response = await fetch("/api/voice/transcribe-sync", { method: "POST", body: formData });
    if (!response.ok) throw new Error(`/api/voice/transcribe-sync HTTP ${response.status}`);
    const data = await response.json();
    return data.transcript ?? wsTranscript;
  }
}