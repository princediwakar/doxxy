// hooks/voice/useDualCapture.ts
//
// Dual-capture hook: streams audio to Sarvam WebSocket STT while
// simultaneously recording a local backup blob via MediaRecorder.
//
// DESIGN PRINCIPLES
// ─────────────────
// 1. The WebSocket path is the "glass pipeline" — transcripts appear in
//    real-time. The MediaRecorder is a silent safety net, always running.
//
// 2. On normal completion ("Done" tap) the hook resolves to the final
//    transcript string. The local blob is discarded.
//
// 3. On WebSocket failure (error, unexpected close, or silence > 60 s) the
//    hook transitions to "degraded" state. The doctor keeps speaking
//    uninterrupted. On "Done" the local blob is POSTed to /api/voice/
//    transcribe-sync and the resulting transcript is returned — identical
//    API surface to the happy path.
//
// 4. Callers never see "usedFallback" or "localBlob" — the fallback is
//    entirely internal. stopCapture() always resolves to { transcript }.
//
// BUG FIXES OVER PREVIOUS IMPLEMENTATION
// ───────────────────────────────────────
// • Stale isDegraded closure in setInterval:
//     Fixed by maintaining isDegradedRef (a ref that mirrors the state)
//     and reading that inside the interval instead of the closed-over value.
//
// • WebSocket auth: the browser WS constructor cannot set custom headers.
//     Fixed by routing through /api/voice/stt-proxy which attaches the
//     Api-Subscription-Key header server-side.
//
// • Fallback was unself-contained — callers had to orchestrate the REST call.
//     Fixed: stopCapture() performs the fallback transcription internally.
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { createStreamingSttConnection } from "@/lib/voice/streamingStt";
import type { StreamingSttConnection } from "@/lib/voice/streamingStt";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CaptureState =
  | "idle"
  | "requesting_permission"
  | "capturing"
  | "paused"
  | "degraded"
  | "processing" // fallback REST call in flight after Done tap
  | "error";

export interface StopResult {
  transcript: string;
}

// ─── Platform detection for permission re-enable guidance ────────────────────

interface PermissionGuidance {
  /** Human-readable instructions shown below the error message. */
  instructions: string;
  /**
   * A URL that opens OS-level or browser-level settings where the user can
   * re-enable microphone permissions. Null when the platform does not support
   * deep-linking into settings from a web context.
   */
  settingsUrl: string | null;
}

function getPermissionGuidance(): PermissionGuidance {
  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const isIOS = /iPhone|iPad|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  const isMac = /Mac/i.test(platform) || /Macintosh/.test(ua);
  const isWindows = /Win/i.test(platform);
  const isChrome = /Chrome\//.test(ua) && !/Edge\//.test(ua) && !/OPR\//.test(ua);
  const isFirefox = /Firefox\//.test(ua);
  const isSafari = /Safari\//.test(ua) && !/Chrome\//.test(ua);
  const isBrave = /Brave\//.test(ua);
  const isEdge = /Edge\//.test(ua);

  const browserName = isBrave
    ? "Brave"
    : isEdge
      ? "Edge"
      : isChrome
        ? "Chrome"
        : isFirefox
          ? "Firefox"
          : isSafari
            ? "Safari"
            : "your browser";

  // ── Android: deep-link into system settings ──────────────────────────────
  if (isAndroid) {
    return {
      instructions: `Enable Microphone for ${browserName} in Android Settings, then come back and tap Try Again.`,
      // Opens Android's "App info" page for the browser so the user can
      // quickly reach the Permissions screen.
      settingsUrl: "intent://com.android.settings/.Settings#Intent;scheme=android-app;end",
    };
  }

  // ── iOS: no deep-link possible from web — show clear manual path ─────────
  if (isIOS) {
    return {
      instructions: `Open the Settings app → ${browserName} → Microphone → Allow. Then come back and tap Try Again.`,
      settingsUrl: null,
    };
  }

  // ── macOS Safari ─────────────────────────────────────────────────────────
  if (isMac && isSafari) {
    return {
      instructions: "Open Safari → Settings for This Website → Microphone → Allow. Then tap Try Again.",
      settingsUrl: null,
    };
  }

  // ── macOS Chrome / Brave / Edge ──────────────────────────────────────────
  if (isMac && (isChrome || isBrave || isEdge)) {
    return {
      instructions: `Open ${browserName} → Settings → Privacy & Security → Site Settings → Microphone → Allow. Then tap Try Again.`,
      settingsUrl: null,
    };
  }

  // ── Windows Chrome / Brave / Edge ────────────────────────────────────────
  if (isWindows && (isChrome || isBrave || isEdge)) {
    return {
      instructions: `In ${browserName}, click the lock/tune icon in the address bar → Site Settings → Microphone → Allow. Then tap Try Again.`,
      settingsUrl: null,
    };
  }

  // ── Firefox (any desktop) ────────────────────────────────────────────────
  if (isFirefox) {
    return {
      instructions: "Click the permissions icon in the address bar, enable Microphone, then refresh and tap Try Again.",
      settingsUrl: null,
    };
  }

  // ── Generic fallback ─────────────────────────────────────────────────────
  return {
    instructions: `Enable microphone access for this site in ${browserName} settings, then refresh and tap Try Again.`,
    settingsUrl: null,
  };
}

// ─── Audio format selection ───────────────────────────────────────────────────

function getSupportedMimeType(): string {
  // Preference order — Sarvam REST API accepts all of these
  const candidates = [
    "audio/wav",
    "audio/webm;codecs=opus",
    "audio/mp4;codecs=mp4a.40.2",
    "audio/ogg;codecs=opus",
    "audio/mpeg",
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDualCapture() {
  const [captureState, setCaptureState] = useState<CaptureState>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [permissionSettingsUrl, setPermissionSettingsUrl] = useState<string | null>(null);
  const [transcriptBuffer, setTranscriptBuffer] = useState("");
  const [isDegraded, setIsDegraded] = useState(false);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const sttRef = useRef<StreamingSttConnection | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>("");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refs that shadow state — safe to read inside closures without staleness
  const isDegradedRef = useRef(false);
  const elapsedSecondsRef = useRef(0);
  const transcriptRef = useRef(""); // accumulates final segments
  const partialRef = useRef("");    // current in-progress utterance (not used by Sarvam — kept for future partial support)
  const lastTranscriptTimeRef = useRef(Date.now());

  // ── Cleanup ────────────────────────────────────────────────────────────────

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (sttRef.current) {
      sttRef.current.close();
      sttRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    transcriptRef.current = "";
    partialRef.current = "";
    isDegradedRef.current = false;
    setTranscriptBuffer("");
    setIsDegraded(false);
    elapsedSecondsRef.current = 0;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  // ── Degraded transition (stable reference — called from closures) ──────────

  const degradeRef = useRef<((reason: string) => void) | null>(null);
  degradeRef.current = (reason: string) => {
    if (isDegradedRef.current) return;
    isDegradedRef.current = true;
    setIsDegraded(true);
    setCaptureState("degraded");
    toast.warning(`Connection interrupted. Audio saved locally — continue speaking. (${reason})`);
  };

  // ── Start ──────────────────────────────────────────────────────────────────

  const startCapture = useCallback(async (): Promise<boolean> => {
    setErrorMessage(null);
    setPermissionSettingsUrl(null);
    isDegradedRef.current = false;
    setIsDegraded(false);
    transcriptRef.current = "";
    partialRef.current = "";
    setTranscriptBuffer("");

    if (typeof MediaRecorder === "undefined") {
      setCaptureState("error");
      setErrorMessage("Your browser does not support voice recording.");
      return false;
    }

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      setCaptureState("error");
      setErrorMessage("Your browser does not support any compatible audio format.");
      return false;
    }

    mimeTypeRef.current = mimeType;
    setCaptureState("requesting_permission");

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err: unknown) {
      const error = err as { name?: string };
      if (
        error?.name === "NotAllowedError" ||
        error?.name === "PermissionDeniedError"
      ) {
        const guidance = getPermissionGuidance();
        setErrorMessage(`Microphone access denied. ${guidance.instructions}`);
        setPermissionSettingsUrl(guidance.settingsUrl);
      } else if (error?.name === "NotFoundError") {
        setErrorMessage("No microphone found. Please connect a microphone and try again.");
      } else if (error?.name === "NotSupportedError") {
        setErrorMessage("Your browser does not support the required audio codec.");
      } else {
        setErrorMessage("Could not start recording. Please check your microphone.");
      }
      setCaptureState("error");
      return false;
    }

    streamRef.current = stream;

    // ── Safety-net MediaRecorder (always on) ─────────────────────────────────
    const recorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onerror = () => {
      setCaptureState("error");
      setErrorMessage("Recording failed. Please try again.");
      cleanup();
    };

    recorder.start(1000); // 1-second chunks

    // ── WebSocket STT (glass pipeline) ───────────────────────────────────────
    try {
      const stt = createStreamingSttConnection({
        onTranscript: (text, _isFinal) => {
          lastTranscriptTimeRef.current = Date.now();
          // Sarvam sends final segments only (isFinal always true)
          transcriptRef.current = (transcriptRef.current + " " + text).trim();
          setTranscriptBuffer(transcriptRef.current);
        },
        onError: (err) => {
          console.error("[useDualCapture] STT error:", err.message);
          degradeRef.current?.(err.message);
        },
        onClose: (code, reason) => {
          // Unexpected close (not triggered by our own close() call)
          if (!isDegradedRef.current && code !== 1000) {
            degradeRef.current?.(reason);
          }
        },
      });

      sttRef.current = stt;

      // PCM capture via AudioContext → send raw Int16 chunks to WS
      const audioCtx = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      // ScriptProcessor is deprecated but remains the only synchronous PCM
      // path available without Worklet setup complexity.
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e: AudioProcessingEvent) => {
        if (isDegradedRef.current) return; // stop pumping if WS is gone

        const float32 = e.inputBuffer.getChannelData(0);
        const int16 = new Int16Array(float32.length);
        for (let i = 0; i < float32.length; i++) {
          const s = Math.max(-1, Math.min(1, float32[i]));
          int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        sttRef.current?.send(int16.buffer);
        // Silence the output to prevent audio feedback
        e.outputBuffer.getChannelData(0).fill(0);
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);
    } catch (err) {
      // STT unavailable from the start — go straight to degraded
      console.error("[useDualCapture] STT init failed:", err);
      isDegradedRef.current = true;
      setIsDegraded(true);
      toast.warning("Live transcription unavailable. Audio will be processed after you tap Done.");
    }

    setCaptureState(isDegradedRef.current ? "degraded" : "capturing");
    lastTranscriptTimeRef.current = Date.now();
    setElapsedSeconds(0);
    elapsedSecondsRef.current = 0;

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (next === 300) toast.warning("Long recording — ensure stable connection");
        elapsedSecondsRef.current = next; // keep ref in sync for stop-closure reads
        return next;
      });

      // Silence timeout — read from ref, never stale
      if (!isDegradedRef.current && sttRef.current) {
        const silenceDuration = Date.now() - lastTranscriptTimeRef.current;
        if (silenceDuration > 60_000) {
          degradeRef.current?.("No transcript received for 60 seconds");
        }
      }
    }, 1000);

    return true;
  }, [cleanup]);

  // ── Stop ───────────────────────────────────────────────────────────────────

  const stopCapture = useCallback(
    (department = "General"): Promise<StopResult> => {
      return new Promise((resolve) => {
        // Flush + close the WS — triggers final server-side processing
        if (sttRef.current) {
          sttRef.current.flush();
          sttRef.current.close();
          sttRef.current = null;
        }

        const usedFallback = isDegradedRef.current;
        const wsTranscript = transcriptRef.current.trim();

        // Stop the interval timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        const recorder = mediaRecorderRef.current;

        const handleBlob = async (blob: Blob | null) => {
          // Happy path — WS gave us a transcript
          if (!usedFallback || !blob) {
            cleanup();
            setCaptureState("idle");
            setElapsedSeconds(0);
            resolve({ transcript: wsTranscript });
            return;
          }

          // Fallback path — route by duration: ≤30s REST, >30s batch
          setCaptureState("processing");

          try {
            const duration = elapsedSecondsRef.current;
            const endpoint =
              duration > 30
                ? "/api/voice/transcribe-batch"
                : "/api/voice/transcribe-sync";

            const formData = new FormData();
            formData.append("audio", blob, `recording.${mimeTypeRef.current.split("/")[1]?.split(";")[0] ?? "webm"}`);
            formData.append("department", department);

            const response = await fetch(endpoint, {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              throw new Error(`${endpoint} HTTP ${response.status}`);
            }

            const data = await response.json();
            const fallbackTranscript: string = data.transcript ?? wsTranscript;

            cleanup();
            setCaptureState("idle");
            setElapsedSeconds(0);
            resolve({ transcript: fallbackTranscript });
          } catch (err) {
            console.error("[useDualCapture] Fallback transcription failed:", err);
            // Return whatever partial WS transcript we have rather than empty
            cleanup();
            setCaptureState("idle");
            setElapsedSeconds(0);
            resolve({ transcript: wsTranscript });
          }
        };

        if (!recorder || (recorder.state !== "recording" && recorder.state !== "paused")) {
          // No recorder — resolve with whatever WS gave us
          handleBlob(null);
          return;
        }

        recorder.onstop = () => {
          const blob =
            chunksRef.current.length > 0
              ? new Blob(chunksRef.current, { type: mimeTypeRef.current })
              : null;
          handleBlob(blob);
        };

        recorder.stop();
      });
    },
    [cleanup],
  );

  // ── Pause / Resume ─────────────────────────────────────────────────────────

  const pauseCapture = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    sttRef.current?.pause();
    recorder.pause();
    setCaptureState("paused");
  }, []);

  const resumeCapture = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "paused") return;

    sttRef.current?.resume();
    recorder.resume();
    setCaptureState(isDegradedRef.current ? "degraded" : "capturing");
    lastTranscriptTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (next === 300) toast.warning("Long recording — ensure stable connection");
        elapsedSecondsRef.current = next;
        return next;
      });

      if (!isDegradedRef.current && sttRef.current) {
        const silenceDuration = Date.now() - lastTranscriptTimeRef.current;
        if (silenceDuration > 60_000) {
          degradeRef.current?.("No transcript received for 60 seconds");
        }
      }
    }, 1000);
  }, []);

  // ── Reset ─────────────────────────────────────────────────────────────────

  const resetCapture = useCallback(() => {
    cleanup();
    setCaptureState("idle");
    setElapsedSeconds(0);
    setErrorMessage(null);
    setPermissionSettingsUrl(null);
  }, [cleanup]);

  return {
    captureState,
    elapsedSeconds,
    errorMessage,
    permissionSettingsUrl,
    transcriptBuffer,
    isDegraded,
    startCapture,
    pauseCapture,
    resumeCapture,
    stopCapture,
    resetCapture,
  };
}