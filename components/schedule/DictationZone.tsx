"use client";

import { useCallback, useRef } from "react";
import { Mic, MicOff, Square, FileText, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";
import { toast } from "sonner";
import { useVoiceRecorder } from "@/hooks/voice/useVoiceRecorder";
import { useVoiceTranscription } from "@/hooks/voice/useVoiceTranscription";
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
      existing.symptoms === "NOT_SPECIFIED" || !existing.symptoms
        ? incoming.symptoms
        : existing.symptoms,
    diagnosis:
      existing.diagnosis === "NOT_SPECIFIED" || !existing.diagnosis
        ? incoming.diagnosis
        : existing.diagnosis,
    advice:
      existing.advice === "NOT_SPECIFIED" || !existing.advice
        ? incoming.advice
        : existing.advice,
    prescriptions: [...existing.prescriptions, ...incoming.prescriptions],
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
    state,
    elapsedSeconds,
    errorMessage,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  } = useVoiceRecorder();
  const { transcribe, hasActiveJobs } = useVoiceTranscription();

  const hasCalledStartRef = useRef(false);
  const isCompact = variant === "compact";

  const beginRecording = useCallback(async () => {
    const started = await startRecording();
    if (started && !hasCalledStartRef.current) {
      hasCalledStartRef.current = true;
      onRecordingStarted?.();
    }
    return started;
  }, [startRecording, onRecordingStarted]);

  const finishRecording = useCallback(async () => {
    const res = await stopRecording();
    if (!res) return;

    transcribe(
      { audioBlob: res.audioBlob, mimeType: res.mimeType, departmentName },
      {
        onSuccess: (data) => {
          if (!data.structured) {
            onStructured(null, data.transcript, data.fieldConfidence);
            return;
          }

          const merged = existingStructured
            ? mergeStructured(existingStructured, data.structured)
            : data.structured;

          onStructured(merged, data.transcript, data.fieldConfidence);

          if (existingStructured) {
            toast.success("Additional dictation ready — notes updated");
          } else {
            toast.success("Consultation notes ready!", {
              action: { label: "View", onClick: () => scrollToReview?.() },
              duration: 8000,
            });
          }
        },
      },
    );
  }, [stopRecording, transcribe, onStructured, departmentName, existingStructured, scrollToReview]);

  if (state === "error") {
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

  if (state === "requesting_permission") {
    return (
      <div className="rounded-lg border bg-card p-6 text-center space-y-2">
        <Spinner size="sm" />
        <p className="text-sm text-muted-foreground">Requesting mic…</p>
      </div>
    );
  }

  if (state === "paused") {
    return (
      <div className={isCompact ? "space-y-2" : "space-y-3"}>
        <div className="rounded-lg border-2 border-amber-400/60 bg-amber-50 p-4 text-center">
          <p className="text-lg font-mono font-semibold text-amber-700 mb-3">
            {formatTimer(elapsedSeconds)}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button size="sm" variant="outline" onClick={resumeRecording}>
              <Play className="h-4 w-4 mr-1" />Continue
            </Button>
            <Button size="sm" onClick={finishRecording}>
              <Square className="h-4 w-4 mr-1" />Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (state === "recording") {
    return (
      <div className={isCompact ? "space-y-2" : "space-y-3"}>
        <div className="rounded-lg border-2 border-destructive/60 bg-destructive/5 p-4 text-center">
          <p className="text-lg font-mono font-semibold text-destructive mb-3">
            {formatTimer(elapsedSeconds)}
          </p>
          <Button size="sm" variant="outline" onClick={pauseRecording}>
            <Pause className="h-4 w-4 mr-1" />Pause
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={isCompact ? "space-y-2" : "space-y-3"}>
      {hasActiveJobs && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner size="sm" />
          <span>Processing dictation…</span>
        </div>
      )}

      {!hasActiveJobs &&
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
