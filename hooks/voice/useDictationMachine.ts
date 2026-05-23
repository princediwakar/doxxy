// hooks/voice/useDictationMachine.ts
"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { useDualCapture } from "@/hooks/voice/useDualCapture";
import type { CaptureState } from "@/hooks/voice/useDualCapture";
import type { FallbackProgress } from "@/lib/voice/fallbackTranscription";
import type { AIStructuredOutput, FieldConfidence } from "@/types/voice";
import { structureTranscript } from "@/actions/voice/structure";
import { toast } from "sonner";
import {
  getOrphanedSessions,
  getSessionChunks,
  completeSession,
} from "@/lib/voice/idb-storage";
import type { DBSession } from "@/lib/voice/idb-storage";
import { processUploadQueue } from "@/lib/voice/backgroundSync";
import { initCrypto, decryptToBlob, decryptString } from "@/lib/voice/crypto";

export interface UseDictationMachineParams {
  departmentName: string;
  getLiveFormData?: () => Record<string, unknown>;
  onStructured: (structured: AIStructuredOutput | null, transcript: string, fieldConfidence?: FieldConfidence[]) => void;
  onRecordingStarted?: () => void;
  scrollToReview?: () => void;
}

export interface UseDictationMachineReturn {
  captureState: CaptureState;
  elapsedSeconds: number;
  errorMessage: string | null;
  permissionSettingsUrl: string | null;
  transcriptBuffer: string;
  isDegraded: boolean;
  isStructuring: boolean;
  fallbackProgress: FallbackProgress | null;
  hasOrphanedSession: boolean;
  orphanedSession: DBSession | null;
  orphanedSessionPreview: string | null;
  isRecovering: boolean;
  beginRecording: () => Promise<boolean>;
  pauseCapture: () => void;
  resumeCapture: () => void;
  finishRecording: () => Promise<void>;
  cancelRecording: () => void;
  recoverSession: () => Promise<void>;
  dismissOrphanedSession: () => void;
}

export function useDictationMachine({
  departmentName,
  getLiveFormData,
  onStructured,
  onRecordingStarted,
  scrollToReview,
}: UseDictationMachineParams): UseDictationMachineReturn {
  const {
    captureState,
    elapsedSeconds,
    errorMessage,
    permissionSettingsUrl,
    transcriptBuffer,
    isDegraded,
    fallbackProgress,
    startCapture,
    pauseCapture,
    resumeCapture,
    stopCapture,
    resetCapture,
  } = useDualCapture();

  const [isStructuring, setIsStructuring] = useState(false);
  const [hasOrphanedSession, setHasOrphanedSession] = useState(false);
  const [orphanedSession, setOrphanedSession] = useState<DBSession | null>(null);
  const [orphanedSessionPreview, setOrphanedSessionPreview] = useState<string | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const hasCalledStartRef = useRef(false);
  const transcriptBufferRef = useRef(transcriptBuffer);
  transcriptBufferRef.current = transcriptBuffer;

  // ── Crash recovery: init crypto, check for orphaned dictation sessions ────

  useEffect(() => {
    initCrypto().then(() => {
      // Only check for orphans if crypto is available (DEK in memory)
      getOrphanedSessions().then(async (sessions) => {
        if (sessions.length > 0) {
          const mostRecent = sessions.reduce((a, b) =>
            a.startedAt > b.startedAt ? a : b,
          );
          setHasOrphanedSession(true);
          setOrphanedSession(mostRecent);

          // Decrypt the transcript snapshot for the recovery UI preview
          if (mostRecent.transcriptSnapshot) {
            try {
              const preview = await decryptString(
                mostRecent.transcriptSnapshot.ciphertext,
                mostRecent.transcriptSnapshot.iv,
              );
              setOrphanedSessionPreview(preview);
            } catch {
              // Decryption failed — DEK mismatch, session unrecoverable
              setOrphanedSessionPreview(null);
            }
          }
        }
      }).catch(() => {});
    }).catch(() => {
      // Crypto init failed — clean unrecoverable IDB data
      getOrphanedSessions().then((sessions) => {
        sessions.forEach((s) => completeSession(s.id).catch(() => {}));
      }).catch(() => {});
    });

    // Background sync: flush any queued uploads from previous sessions
    processUploadQueue().catch(() => {});
  }, []);

  // ── Recovery callbacks ────────────────────────────────────────────────────

  const recoverSession = useCallback(async () => {
    if (!orphanedSession) return;
    setIsRecovering(true);

    try {
      const chunks = await getSessionChunks(orphanedSession.id);
      if (chunks.length === 0) {
        toast.error("No audio data found in recovered session");
        await completeSession(orphanedSession.id);
        setHasOrphanedSession(false);
        setOrphanedSession(null);
        setOrphanedSessionPreview(null);
        setIsRecovering(false);
        return;
      }

      // Decrypt each chunk from IDB
      const decryptedBlobs = await Promise.all(
        chunks.map((c) => decryptToBlob(c.ciphertext, c.iv, "audio/webm")),
      );
      const blob = new Blob(decryptedBlobs, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", blob, "recovered.webm");
      formData.append("department", orphanedSession.department);

      // Use submit-batch + poll for recovered sessions (usually longer)
      const submitRes = await fetch("/api/voice/submit-batch", { method: "POST", body: formData });
      if (!submitRes.ok) throw new Error("Recovery submission failed");
      const { jobId } = await submitRes.json();

      let transcript = "";
      for (let attempt = 0; attempt < 15; attempt++) {
        const delay = Math.min(3000 * Math.pow(1.5, attempt), 15000);
        await new Promise(r => setTimeout(r, delay));

        const pollRes = await fetch(`/api/voice/poll-batch?jobId=${jobId}`);
        if (!pollRes.ok) throw new Error("Recovery poll failed");
        const pollData = await pollRes.json();

        if (pollData.status === "done") { transcript = pollData.transcript; break; }
        if (pollData.status === "error") throw new Error(pollData.error || "Recovery processing failed");
      }

      if (!transcript) throw new Error("Recovery polling timed out");

      // Structure the recovered transcript
      const { output, confidence, error } = await structureTranscript(transcript, orphanedSession.department);
      if (error || !output) {
        console.error("[useDictationMachine] Recovery structuring failed:", error);
        toast.warning("Dictation recovered but notes could not be structured");
      } else {
        onStructured(output, transcript, confidence);
        toast.success("Unsaved dictation recovered");
      }

      await completeSession(orphanedSession.id);
      setHasOrphanedSession(false);
      setOrphanedSession(null);
      setOrphanedSessionPreview(null);
    } catch (err) {
      console.error("[useDictationMachine] Recovery failed:", err);
      toast.error("Could not recover unsaved dictation");
      await completeSession(orphanedSession.id).catch(() => {});
      setHasOrphanedSession(false);
      setOrphanedSession(null);
      setOrphanedSessionPreview(null);
    } finally {
      setIsRecovering(false);
    }
  }, [orphanedSession, onStructured]);

  const dismissOrphanedSession = useCallback(() => {
    if (orphanedSession) {
      completeSession(orphanedSession.id).catch(() => {});
    }
    setHasOrphanedSession(false);
    setOrphanedSession(null);
    setOrphanedSessionPreview(null);
  }, [orphanedSession]);

  const beginRecording = useCallback(async () => {
    const started = await startCapture(departmentName);
    if (started && !hasCalledStartRef.current) {
      hasCalledStartRef.current = true;
      onRecordingStarted?.();
    }
    return started;
  }, [startCapture, departmentName, onRecordingStarted]);

  const finishRecording = useCallback(async () => {
    const result = await stopCapture(departmentName);
    if (!result.transcript) {
      toast.error("No transcription produced. Please try again or check your connection.");
      return;
    }

    setIsStructuring(true);
    try {
      const currentFormData = getLiveFormData ? getLiveFormData() : undefined;
      const isUpdate = currentFormData && Object.keys(currentFormData).length > 0;

      const { output, confidence, error } = await structureTranscript(
        result.transcript,
        departmentName,
        currentFormData,
      );
      if (error || !output) {
        toast.error(error || "Failed to process dictation");
        return;
      }

      onStructured(output, transcriptBufferRef.current, confidence);

      if (isUpdate) {
        toast.success("Additional dictation processed — notes updated");
      } else {
        toast.success("Consultation notes ready!", {
          action: { label: "View", onClick: () => scrollToReview?.() },
          duration: 8000,
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to process dictation");
    } finally {
      setIsStructuring(false);
    }
  }, [stopCapture, departmentName, getLiveFormData, onStructured, scrollToReview]);

  const cancelRecording = useCallback(() => {
    resetCapture();
    setIsStructuring(false);
    hasCalledStartRef.current = false;
  }, [resetCapture]);

  return {
    captureState,
    elapsedSeconds,
    errorMessage,
    permissionSettingsUrl,
    transcriptBuffer,
    isDegraded,
    isStructuring,
    fallbackProgress,
    hasOrphanedSession,
    orphanedSession,
    orphanedSessionPreview,
    isRecovering,
    beginRecording,
    pauseCapture,
    resumeCapture,
    finishRecording,
    cancelRecording,
    recoverSession,
    dismissOrphanedSession,
  };
}
