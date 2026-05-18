"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { Mic, MicOff, Square, FileText, Pause, Play, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";
import { toast } from "sonner";
import { useDualCapture } from "@/hooks/voice/useDualCapture";
import { structureTranscript } from "@/actions/voice/structure";
import type { AIStructuredOutput, FieldConfidence } from "@/types/voice";

type DictationVariant = "active" | "compact";

interface DictationZoneProps {
  onStructured: (structured: AIStructuredOutput | null, transcript: string, fieldConfidence?: FieldConfidence[]) => void;
  onOpenNotes: () => void;
  onRecordingStarted?: () => void;
  variant?: DictationVariant;
  secondaryLabel: string;
  departmentName?: string;
  existingStructured?: AIStructuredOutput | null;
  scrollToReview?: () => void;
}

function mergeStructured(
  existing: AIStructuredOutput,
  incoming: AIStructuredOutput,
): AIStructuredOutput {
  return {
    symptoms:
      !existing.symptoms ? incoming.symptoms : existing.symptoms,
    diagnosis:
      !existing.diagnosis ? incoming.diagnosis : existing.diagnosis,
    advice:
      !existing.advice ? incoming.advice : existing.advice,
    prescriptions: [...existing.prescriptions, ...incoming.prescriptions],
    discontinued_medications: [
      ...(existing.discontinued_medications || []),
      ...(incoming.discontinued_medications || []),
    ],
    additional_clinical_findings: [
      ...(existing.additional_clinical_findings || []),
      ...(incoming.additional_clinical_findings || []),
    ],
    ruled_out_findings: [
      ...(existing.ruled_out_findings || []),
      ...(incoming.ruled_out_findings || []),
    ],
    rawFields: {
      ...existing.rawFields,
      ...Object.fromEntries(
        Object.entries(incoming.rawFields || {}).filter(([key]) => {
          const existingVal = existing.rawFields?.[key];
          return existingVal === undefined || existingVal === "NOT_SPECIFIED" || existingVal === "";
        }),
      ),
    },
  };
}

function formatTimer(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function DictationZone({
  onStructured,
  onOpenNotes,
  onRecordingStarted,
  variant = "active",
  secondaryLabel,
  departmentName,
  existingStructured,
  scrollToReview,
}: DictationZoneProps) {
  const {
    captureState,
    elapsedSeconds,
    errorMessage,
    transcriptBuffer,
    isDegraded,
    startCapture,
    pauseCapture,
    resumeCapture,
    stopCapture,
  } = useDualCapture();

  const [isStructuring, setIsStructuring] = useState(false);
  const hasCalledStartRef = useRef(false);
  const isCompact = variant === "compact";
  const lastLookaheadWordCountRef = useRef(0);
  const lookaheadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cost-gated lookahead optimization
  useEffect(() => {
    if (captureState !== "capturing" && captureState !== "degraded") return;
    if (isStructuring) return;

    const words = transcriptBuffer.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const wordsSinceLastExtraction = wordCount - lastLookaheadWordCountRef.current;

    // Only fire if buffer grew by >= 50 words since last extraction AND pause is >= 2.5s
    if (wordsSinceLastExtraction < 50) return;

    if (lookaheadTimerRef.current) {
      clearTimeout(lookaheadTimerRef.current);
    }

    lookaheadTimerRef.current = setTimeout(async () => {
      if (captureState !== "capturing" && captureState !== "degraded") return;
      if (transcriptBuffer.trim().length === 0) return;

      const currentWords = transcriptBuffer.trim().split(/\s+/).filter(Boolean).length;
      if (currentWords - lastLookaheadWordCountRef.current < 50) return;

      lastLookaheadWordCountRef.current = currentWords;

      try {
        const result = await structureTranscript(transcriptBuffer, departmentName || "General");
        if (result.output && !result.error) {
          const merged = existingStructured
            ? mergeStructured(existingStructured, result.output)
            : result.output;
          // Silent background update — don't trigger full UI resolution yet
          onStructured(merged, transcriptBuffer, result.confidence);
        }
      } catch {
        // Background extraction failure is silent — don't disturb the doctor
      }
    }, 2500);

    return () => {
      if (lookaheadTimerRef.current) {
        clearTimeout(lookaheadTimerRef.current);
      }
    };
  }, [captureState, transcriptBuffer, isStructuring, departmentName, existingStructured, onStructured]);

  const beginRecording = useCallback(async () => {
    const started = await startCapture();
    if (started && !hasCalledStartRef.current) {
      hasCalledStartRef.current = true;
      onRecordingStarted?.();
    }
    return started;
  }, [startCapture, onRecordingStarted]);

  const finishRecording = useCallback(async () => {
    const result = await stopCapture(departmentName || "General");
    if (!result.transcript) return;

    setIsStructuring(true);

    try {
      // stopCapture handles transcription internally (WS + fallback paths).
      // We only need to structure the transcript.
      const structured = await structureTranscript(result.transcript, departmentName || "General");

      if (structured.output && !structured.error) {
        const merged = existingStructured
          ? mergeStructured(existingStructured, structured.output)
          : structured.output;
        onStructured(merged, result.transcript, structured.confidence);

        if (existingStructured) {
          toast.success("Additional dictation ready — notes updated");
        } else {
          toast.success("Consultation notes ready!", {
            action: { label: "View", onClick: () => scrollToReview?.() },
            duration: 8000,
          });
        }
      } else if (structured.error) {
        onStructured(null, result.transcript);
        toast.error(structured.error);
      } else {
        onStructured(null, result.transcript);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to process dictation";
      toast.error(msg);
    } finally {
      setIsStructuring(false);
    }
  }, [stopCapture, departmentName, existingStructured, onStructured, scrollToReview]);

  if (captureState === "error") {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-center space-y-2">
        <MicOff className="h-8 w-8 mx-auto text-destructive/60" />
        <p className="text-sm text-destructive">{errorMessage}</p>
        <Button variant="outline" size="sm" onClick={onOpenNotes}>
          <FileText className="h-3 w-3 mr-1" />{secondaryLabel}
        </Button>
      </div>
    );
  }

  if (captureState === "requesting_permission") {
    return (
      <div className="rounded-lg border bg-card p-6 text-center space-y-2">
        <Spinner size="sm" />
        <p className="text-sm text-muted-foreground">Requesting mic...</p>
      </div>
    );
  }

  if (captureState === "paused") {
    return (
      <div className={isCompact ? "space-y-2" : "space-y-3"}>
        {transcriptBuffer && (
          <div className="rounded-lg border bg-muted/30 p-3 max-h-48 overflow-y-auto">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{transcriptBuffer}</p>
          </div>
        )}
        <div className="rounded-lg border-2 border-amber-400/60 bg-amber-50 p-4 text-center">
          <p className="text-lg font-mono font-semibold text-amber-700 mb-3">
            {formatTimer(elapsedSeconds)}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button size="sm" variant="outline" onClick={resumeCapture}>
              <Play className="h-4 w-4 mr-1" />Continue
            </Button>
            <Button size="sm" onClick={finishRecording} disabled={isStructuring}>
              {isStructuring ? (
                <Spinner size="sm" />
              ) : (
                <Square className="h-4 w-4 mr-1" />
              )}
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (captureState === "capturing" || captureState === "degraded") {
    return (
      <div className={isCompact ? "space-y-2" : "space-y-3"}>
        {isDegraded && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Connection interrupted. Audio saved locally — continue speaking.</span>
          </div>
        )}
        {transcriptBuffer && (
          <div className="rounded-lg border bg-muted/30 p-3 max-h-48 overflow-y-auto">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{transcriptBuffer}</p>
          </div>
        )}
        <div className={`rounded-lg border-2 p-4 text-center ${
          isDegraded
            ? "border-amber-400/60 bg-amber-50"
            : "border-destructive/60 bg-destructive/5"
        }`}>
          <p className={`text-lg font-mono font-semibold mb-3 ${
            isDegraded ? "text-amber-700" : "text-destructive"
          }`}>
            {formatTimer(elapsedSeconds)}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button size="sm" variant="outline" onClick={pauseCapture}>
              <Pause className="h-4 w-4 mr-1" />Pause
            </Button>
            <Button size="sm" onClick={finishRecording} disabled={isStructuring}>
              {isStructuring ? (
                <Spinner size="sm" />
              ) : (
                <Square className="h-4 w-4 mr-1" />
              )}
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Idle state
  return (
    <div className={isCompact ? "space-y-2" : "space-y-3"}>
      {isStructuring && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner size="sm" />
          <span>Structuring notes...</span>
        </div>
      )}

      {!isStructuring &&
        (isCompact ? (
          <div className="flex items-center gap-2">
            <button
              onClick={beginRecording}
              className="flex-1 rounded-lg border-2 border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 px-4 py-2.5 text-sm text-center font-semibold transition-all"
            >
              <Mic className="h-5 w-5 inline mr-1.5" />
              Record Additional Notes
            </button>
          </div>
        ) : (
          <button
            onClick={beginRecording}
            className="w-full rounded-lg border-2 border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 px-4 py-3 text-sm text-center font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Mic className="h-5 w-5" />
            Tap to Dictate
          </button>
        ))}
    </div>
  );
}
