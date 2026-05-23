// lib/voice/backgroundSync.ts
//
// Processes the IndexedDB upload queue when the network is available.
// Called on app init and when the browser fires the "online" event.
//
// Items in the queue are blobs that failed to transcribe because the user
// tapped "Done" while offline. We POST them to the appropriate endpoint
// (transcribe-sync for short clips, submit-batch + poll for long ones).
// Success deletes the item; failure increments retry count (max 5).

import { getPendingUploads, updateUploadItem, deleteUploadItem } from "@/lib/voice/idb-storage";
import { decryptToBlob, initCrypto } from "@/lib/voice/crypto";

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 5_000;

// ─── Public API ────────────────────────────────────────────────────────────────

let syncInProgress = false;

export async function processUploadQueue(
  signal?: AbortSignal,
): Promise<{ processed: number; succeeded: number }> {
  if (syncInProgress) return { processed: 0, succeeded: 0 };
  syncInProgress = true;

  let processed = 0;
  let succeeded = 0;

  try {
    // Ensure crypto is initialized before attempting decryption
    await initCrypto();

    const items = await getPendingUploads();
    if (items.length === 0) return { processed: 0, succeeded: 0 };

    for (const item of items) {
      if (signal?.aborted) break;
      if (item.retries >= MAX_RETRIES) {
        await deleteUploadItem(item.id!);
        processed++;
        continue;
      }

      try {
        // Decrypt the audio blob from IDB
        const blob = await decryptToBlob(item.ciphertext, item.iv, item.mimeType);

        const formData = new FormData();
        const ext = item.mimeType.split("/")[1]?.split(";")[0] ?? "webm";
        formData.append("audio", blob, `recording.${ext}`);
        formData.append("department", item.department);

        const blobSizeMB = blob.size / (1024 * 1024);

        if (blobSizeMB > 2) {
          // Longer recording — submit + poll
          const submitRes = await fetch("/api/voice/submit-batch", { method: "POST", body: formData });
          if (!submitRes.ok) throw new Error(`Submit HTTP ${submitRes.status}`);
          const { jobId } = await submitRes.json();

          let transcript = "";
          for (let attempt = 0; attempt < 15; attempt++) {
            if (signal?.aborted) break;
            const delay = Math.min(BASE_DELAY_MS * Math.pow(1.5, attempt), 20_000);
            await new Promise(r => setTimeout(r, delay));

            const pollRes = await fetch(`/api/voice/poll-batch?jobId=${jobId}`);
            if (!pollRes.ok) throw new Error("Poll HTTP error");
            const pollData = await pollRes.json();
            if (pollData.status === "done") { transcript = pollData.transcript; break; }
            if (pollData.status === "error") throw new Error(pollData.error || "Batch error");
          }
          if (!transcript) throw new Error("Polling timed out");
        } else {
          const res = await fetch("/api/voice/transcribe-sync", { method: "POST", body: formData });
          if (!res.ok) throw new Error(`Transcribe HTTP ${res.status}`);
        }

        await deleteUploadItem(item.id!);
        succeeded++;
      } catch (err) {
        console.warn(`[backgroundSync] Upload ${item.id} failed (attempt ${item.retries + 1}):`, err);
        await updateUploadItem(item.id!, {
          status: "error",
          retries: item.retries + 1,
        });
      }
      processed++;
    }
  } finally {
    syncInProgress = false;
  }

  return { processed, succeeded };
}

// ─── Online/offline listener ───────────────────────────────────────────────────

let listenerRegistered = false;

export function registerOnlineListener(onSyncComplete?: (result: { processed: number; succeeded: number }) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = () => {
    if (navigator.onLine) {
      processUploadQueue().then((result) => {
        onSyncComplete?.(result);
      }).catch(() => {});
    }
  };

  if (!listenerRegistered) {
    window.addEventListener("online", handler);
    listenerRegistered = true;
  }

  return () => {
    window.removeEventListener("online", handler);
    listenerRegistered = false;
  };
}
