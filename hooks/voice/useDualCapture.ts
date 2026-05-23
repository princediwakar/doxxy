// hooks/voice/useDualCapture.ts
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { createStreamingSttConnection, type StreamingSttConnection } from "@/lib/voice/streamingStt";
import { createSession, updateSessionTranscript, completeSession, addChunks, addToUploadQueue } from "@/lib/voice/idb-storage";
import { encryptBlob, encryptString, initCrypto } from "@/lib/voice/crypto";
import { getPermissionGuidance, getSupportedMimeType } from "@/lib/voice/captureUtils"
import { performFallbackTranscription, type FallbackProgress } from "@/lib/voice/fallbackTranscription";

export type CaptureState = "idle" | "requesting_permission" | "capturing" | "paused" | "degraded" | "processing" | "error";
export interface StopResult { transcript: string; }

export function useDualCapture() {
  const [captureState, setCaptureState] = useState<CaptureState>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [permissionSettingsUrl, setPermissionSettingsUrl] = useState<string | null>(null);
  const [transcriptBuffer, setTranscriptBuffer] = useState("");
  const [isDegraded, setIsDegraded] = useState(false);
  const [fallbackProgress, setFallbackProgress] = useState<FallbackProgress | null>(null);

  // Core Refs
  const sttRef = useRef<StreamingSttConnection | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // State Refs
  const isStoppingRef = useRef(false);
  const stopPromiseRef = useRef<Promise<StopResult> | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const pendingIdbChunksRef = useRef<Array<{ chunkIndex: number; blob: Blob }>>([]);
  const isDegradedRef = useRef(false);
  const elapsedSecondsRef = useRef(0);
  const transcriptRef = useRef("");
  const disconnectedAtRef = useRef<number | null>(null);
  const sttOpenedRef = useRef(false);

  const degradeRef = useRef<((reason: string) => void) | null>(null);
  degradeRef.current = (reason: string) => {
    if (isDegradedRef.current) return;
    isDegradedRef.current = true;
    setIsDegraded(true);
    setCaptureState("degraded");
    toast.warning(`Connection interrupted. Audio saved locally — continue speaking. (${reason})`);
  };

  const flushIdbChunks = useCallback(async () => {
    const pending = pendingIdbChunksRef.current;
    const sessionId = sessionIdRef.current;
    if (pending.length === 0 || !sessionId) return;
    const toWrite = pending.splice(0);
    try {
      const encrypted = await Promise.all(
        toWrite.map(async (c) => ({ chunkIndex: c.chunkIndex, ...(await encryptBlob(c.blob)) }))
      );
      addChunks(sessionId, encrypted).catch(console.warn);
    } catch (err) {
      console.warn("[useDualCapture] Chunk encryption failed:", err);
    }
  }, []);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    sttRef.current?.close();
    audioContextRef.current?.close().catch(() => {});
    streamRef.current?.getTracks().forEach((t) => t.stop());
    
    sttRef.current = null;
    audioContextRef.current = null;
    streamRef.current = null;
    mediaRecorderRef.current = null;
    timerRef.current = null;
    
    chunksRef.current = [];
    transcriptRef.current = "";
    isDegradedRef.current = false;
    setTranscriptBuffer("");
    setIsDegraded(false);
    elapsedSecondsRef.current = 0;
    disconnectedAtRef.current = null;
    pendingIdbChunksRef.current = [];
    sessionIdRef.current = null;
    sttOpenedRef.current = false;
  }, []);

  useEffect(() => cleanup, [cleanup]);
  useEffect(() => { initCrypto().catch(console.warn); }, []);

  const visibilityPausedRef = useRef(false);

  // Extracted Timer Logic
  const startTicking = useCallback(() => {
    return setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (next === 300) toast.warning("Long recording — ensure stable connection");
        elapsedSecondsRef.current = next;

        if (next % 10 === 0 && transcriptRef.current) {
          sessionStorage.setItem("voice_transcript_recovery", transcriptRef.current);
          if (sessionIdRef.current) {
            encryptString(transcriptRef.current)
              .then((payload) => updateSessionTranscript(sessionIdRef.current!, payload))
              .catch(() => {});
          }
        }

        if (next % 5 === 0 || isDegradedRef.current) flushIdbChunks();
        return next;
      });

      if (!isDegradedRef.current && disconnectedAtRef.current !== null) {
        if (Date.now() - disconnectedAtRef.current > 90_000) degradeRef.current?.("Disconnected for 90 seconds");
      }
    }, 1000);
  }, [flushIdbChunks]);

  // ── App-switch / screen-lock handling (mobile) ─────────────────────────────

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        const recorder = mediaRecorderRef.current;
        if (recorder?.state === "recording") {
          recorder.pause();
          sttRef.current?.close();
          sttRef.current = null;
          if (timerRef.current) clearInterval(timerRef.current);
          visibilityPausedRef.current = true;
          setCaptureState("paused");
        }
      } else if (visibilityPausedRef.current) {
        visibilityPausedRef.current = false;
        const recorder = mediaRecorderRef.current;
        if (!recorder || recorder.state === "inactive") {
          degradeRef.current?.("Recording interrupted while app was in background");
          return;
        }
        recorder.resume();
        const connectSTT = (): StreamingSttConnection => {
          return createStreamingSttConnection({
            onOpen: () => {
              sttOpenedRef.current = true;
              disconnectedAtRef.current = null;
            },
            onTranscript: (text) => {
              disconnectedAtRef.current = null;
              transcriptRef.current = (transcriptRef.current + " " + text).trim();
              setTranscriptBuffer(transcriptRef.current);
            },
            onError: () => {
              if (!sttOpenedRef.current && !isDegradedRef.current) {
                isDegradedRef.current = true;
                setIsDegraded(true);
                setCaptureState("degraded");
                toast.warning("Live transcription unavailable. Audio will be processed after you tap Done.");
              }
            },
            onClose: (code) => {
              if (!isDegradedRef.current && code !== 1000) {
                disconnectedAtRef.current ??= Date.now();
              }
            },
          });
        };
        sttRef.current = connectSTT();
        setCaptureState(isDegradedRef.current ? "degraded" : "capturing");
        timerRef.current = startTicking();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [startTicking]);

  const setupAudioWorklet = async (audioCtx: AudioContext, stream: MediaStream) => {
    const source = audioCtx.createMediaStreamSource(stream);
    const inputRate = audioCtx.sampleRate; // iOS Safari ignores constructor sampleRate and uses hardware rate
    const outputRate = 16000;

    const workletCode = `
      class PcmProcessor extends AudioWorkletProcessor {
        constructor(options) {
          super();
          this.inputRate = options.processorOptions.inputSampleRate || 16000;
          this.outputRate = options.processorOptions.outputSampleRate || 16000;
          this.ratio = this.inputRate / this.outputRate;
          this.accumulator = 0;
        }

        process(inputs) {
          const input = inputs[0];
          if (input && input.length > 0) {
            const float32 = input[0];
            const outputSamples = [];

            for (let i = 0; i < float32.length; i++) {
              this.accumulator++;
              while (this.accumulator >= this.ratio) {
                const s = Math.max(-1, Math.min(1, float32[i]));
                outputSamples.push(s < 0 ? s * 0x8000 : s * 0x7fff);
                this.accumulator -= this.ratio;
              }
            }

            if (outputSamples.length > 0) {
              const int16 = new Int16Array(outputSamples);
              this.port.postMessage(int16.buffer, [int16.buffer]);
            }
          }
          return true;
        }
      }
      registerProcessor('pcm-processor', PcmProcessor);
    `;
    const blob = new Blob([workletCode], { type: "application/javascript" });
    const workletUrl = URL.createObjectURL(blob);
    await audioCtx.audioWorklet.addModule(workletUrl);
    URL.revokeObjectURL(workletUrl);

    const processor = new AudioWorkletNode(audioCtx, "pcm-processor", {
      processorOptions: { inputSampleRate: inputRate, outputSampleRate: outputRate },
    });
    processor.port.onmessage = (e: MessageEvent) => {
      if (!isDegradedRef.current) sttRef.current?.send(e.data);
    };
    source.connect(processor);
    // processor only sends PCM to STT WebSocket via port.postMessage —
    // no need to connect to destination (causes feedback on mobile).
  };

  const startCapture = useCallback(async (department = "General"): Promise<boolean> => {
    setErrorMessage(null);
    setPermissionSettingsUrl(null);
    setCaptureState("requesting_permission");

    // ── Call getUserMedia FIRST — must be within the user gesture for iOS ──
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err: any) {
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        // Retry once immediately — some browsers re-prompt on second call
        // within the same user gesture
        try {
          streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (retryErr: any) {
          const guidance = getPermissionGuidance();
          setErrorMessage(`Microphone access denied. ${guidance.instructions}`);
          setPermissionSettingsUrl(guidance.settingsUrl);
          setCaptureState("error");
          return false;
        }
      } else if (err?.name === "NotFoundError") {
        setErrorMessage("No microphone detected. Please connect a microphone and try again.");
        setCaptureState("error");
        return false;
      } else {
        setErrorMessage("Could not start recording. Please check your microphone.");
        setCaptureState("error");
        return false;
      }
    }

    // ── Permission granted — run setup ────────────────────────────────────
    setIsDegraded(false);
    isDegradedRef.current = false;
    sttOpenedRef.current = false;

    sessionIdRef.current = crypto.randomUUID();
    createSession(sessionIdRef.current, department).catch(console.warn);

    const recovered = sessionStorage.getItem("voice_transcript_recovery");
    if (recovered?.trim()) {
      transcriptRef.current = recovered;
      setTranscriptBuffer(recovered);
      toast("Recovered unsaved dictation");
    } else {
      transcriptRef.current = "";
      setTranscriptBuffer("");
    }

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      setCaptureState("error");
      setErrorMessage("Your browser does not support any compatible audio format.");
      cleanup();
      return false;
    }
    mimeTypeRef.current = mimeType;

    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
        pendingIdbChunksRef.current.push({ chunkIndex: chunksRef.current.length - 1, blob: e.data });
      }
    };
    recorder.onerror = () => {
      setCaptureState("error");
      setErrorMessage("Recording failed. Please try again.");
      cleanup();
    };
    recorder.start(1000);

    try {
      let retryCount = 0;
      const connectSTT = (): StreamingSttConnection => {
        return createStreamingSttConnection({
          onOpen: () => {
            sttOpenedRef.current = true;
            disconnectedAtRef.current = null;
          },
          onTranscript: (text) => {
            retryCount = 0;
            disconnectedAtRef.current = null;
            transcriptRef.current = (transcriptRef.current + " " + text).trim();
            setTranscriptBuffer(transcriptRef.current);
          },
          onError: (err) => {
            console.error("[useDualCapture] STT error:", err.message);
            if (!sttOpenedRef.current && !isDegradedRef.current) {
              isDegradedRef.current = true;
              setIsDegraded(true);
              setCaptureState("degraded");
              toast.warning("Live transcription unavailable. Audio will be processed after you tap Done.");
            }
          },
          onClose: (code, reason) => {
            if (!isDegradedRef.current && code !== 1000) {
              disconnectedAtRef.current ??= Date.now();
              const delay = Math.min(1000 * Math.pow(2, retryCount++), 30000);
              setTimeout(() => { if (!isDegradedRef.current) sttRef.current = connectSTT(); }, delay);
            }
          },
        });
      };
      sttRef.current = connectSTT();

      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;
      await setupAudioWorklet(audioCtx, streamRef.current);
    } catch (err) {
      isDegradedRef.current = true;
      setIsDegraded(true);
      toast.warning("Live transcription unavailable. Audio will be processed after you tap Done.");
    }

    setCaptureState(isDegradedRef.current ? "degraded" : "capturing");
    setElapsedSeconds(0);
    elapsedSecondsRef.current = 0;
    disconnectedAtRef.current = null;
    timerRef.current = startTicking();

    return true;
  }, [cleanup, startTicking]);

  const stopCapture = useCallback((department = "General"): Promise<StopResult> => {
    if (isStoppingRef.current && stopPromiseRef.current) return stopPromiseRef.current;
    isStoppingRef.current = true;

    stopPromiseRef.current = new Promise((resolve) => {
      sttRef.current?.flush();
      sttRef.current?.close();
      sttRef.current = null;

      const wsTranscript = transcriptRef.current.trim();
      const hasRecordedAudio = chunksRef.current.length > 0;
      const usedFallback = isDegradedRef.current || (!wsTranscript && hasRecordedAudio);
      const sessionId = sessionIdRef.current;

      if (timerRef.current) clearInterval(timerRef.current);

      const recorder = mediaRecorderRef.current;
      const handleBlob = async (blob: Blob | null) => {
        sessionStorage.removeItem("voice_transcript_recovery");

        if (!usedFallback || !blob) {
          if (sessionId) completeSession(sessionId).catch(() => {});
          cleanup();
          setCaptureState("idle");
          setFallbackProgress(null);
          setElapsedSeconds(0);
          isStoppingRef.current = false;
          stopPromiseRef.current = null;
          resolve({ transcript: wsTranscript });
          return;
        }

        setCaptureState("processing");
        setFallbackProgress(null);
        try {
          const transcript = await performFallbackTranscription(
            blob, department, mimeTypeRef.current, elapsedSecondsRef.current, wsTranscript,
            (progress) => setFallbackProgress(progress),
          );
          if (sessionId) completeSession(sessionId).catch(() => {});
          cleanup();
          setCaptureState("idle");
          setElapsedSeconds(0);
          resolve({ transcript });
        } catch (err) {
          console.error("[useDualCapture] Fallback transcription failed:", err);
          setFallbackProgress(null);
          if (sessionId && blob) {
            Promise.all([
              encryptBlob(blob),
              wsTranscript ? encryptString(wsTranscript) : Promise.resolve(null),
            ]).then(([eb, es]) => {
              addToUploadQueue({
                sessionId, ciphertext: eb.ciphertext, iv: eb.iv, department, mimeType: mimeTypeRef.current,
                transcriptSnapshot: es ? { ciphertext: es.ciphertext, iv: es.iv } : null,
              }).catch(() => {});
            }).catch(() => {});
            toast.warning("Upload queued — will retry when network restores");
          }
          if (sessionId) completeSession(sessionId).catch(() => {});
          cleanup();
          setCaptureState("idle");
          setElapsedSeconds(0);
          resolve({ transcript: wsTranscript });
        } finally {
          isStoppingRef.current = false;
          stopPromiseRef.current = null;
        }
      };

      if (!recorder || (recorder.state !== "recording" && recorder.state !== "paused")) {
        handleBlob(null);
        return;
      }

      recorder.onstop = () => {
        const blob = chunksRef.current.length > 0 ? new Blob(chunksRef.current, { type: mimeTypeRef.current }) : null;
        handleBlob(blob);
      };

      flushIdbChunks();
      recorder.stop();
    });

    return stopPromiseRef.current;
  }, [cleanup, flushIdbChunks]);

  const pauseCapture = useCallback(() => {
    if (mediaRecorderRef.current?.state !== "recording") return;
    if (timerRef.current) clearInterval(timerRef.current);
    sttRef.current?.pause();
    mediaRecorderRef.current.pause();
    setCaptureState("paused");
  }, []);

  const resumeCapture = useCallback(() => {
    if (mediaRecorderRef.current?.state !== "paused") return;
    visibilityPausedRef.current = false;
    sttRef.current?.resume();
    mediaRecorderRef.current.resume();
    setCaptureState(isDegradedRef.current ? "degraded" : "capturing");
    timerRef.current = startTicking();
  }, [startTicking]);

  const resetCapture = useCallback(() => {
    if (isStoppingRef.current && stopPromiseRef.current) {
      // stopCapture is already in flight — it will call completeSession + cleanup.
      // Wait for it to avoid double-completing the IDB session.
      stopPromiseRef.current.finally(() => {
        sessionStorage.removeItem("voice_transcript_recovery");
        setCaptureState("idle");
        setElapsedSeconds(0);
        setErrorMessage(null);
        setPermissionSettingsUrl(null);
      });
      return;
    }

    if (sessionIdRef.current) completeSession(sessionIdRef.current).catch(() => {});
    sessionStorage.removeItem("voice_transcript_recovery");
    cleanup();
    setCaptureState("idle");
    setElapsedSeconds(0);
    setErrorMessage(null);
    setPermissionSettingsUrl(null);
  }, [cleanup]);

  return { captureState, elapsedSeconds, errorMessage, permissionSettingsUrl, transcriptBuffer, isDegraded, fallbackProgress, startCapture, pauseCapture, resumeCapture, stopCapture, resetCapture };
}