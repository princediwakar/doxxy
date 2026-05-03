"use client";

import { useState, useCallback, useRef } from "react";
import { Mic, MicOff, Square, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";
import { useVoiceRecorder } from "@/hooks/voice/useVoiceRecorder";
import { useVoiceTranscription } from "@/hooks/voice/useVoiceTranscription";
import type { AIStructuredOutput } from "@/types/voice";

function isTouchPrimary(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

type DictationVariant = "active" | "compact";

interface DictationZoneProps {
  onStructured: (structured: AIStructuredOutput | null, transcript: string) => void;
  onOpenNotes: () => void;
  onRecordingStarted?: () => void;
  variant?: DictationVariant;
  secondaryLabel: string;
  departmentName?: string;
}

export function DictationZone({
  onStructured,
  onOpenNotes,
  onRecordingStarted,
  variant = "active",
  secondaryLabel,
  departmentName,
}: DictationZoneProps) {
  const { state, elapsedSeconds, errorMessage, startRecording, stopRecording } = useVoiceRecorder();
  const { transcribe, isTranscribing } = useVoiceTranscription();
  const [transcript, setTranscript] = useState<string | null>(null);
  const [useHoldGesture] = useState(isTouchPrimary);
  const isPressedRef = useRef(false);
  const startPromiseRef = useRef<Promise<boolean> | null>(null);

  const isRecording = state === "recording";
  const isProcessing = isTranscribing;
  const hasError = state === "error";
  const isCompact = variant === "compact";

  const hasCalledStartRef = useRef(false);

  const beginRecording = useCallback(async (): Promise<boolean> => {
    const promise = startRecording();
    startPromiseRef.current = promise;
    const started = await promise;
    startPromiseRef.current = null;
    if (started && !hasCalledStartRef.current) {
      hasCalledStartRef.current = true;
      onRecordingStarted?.();
    }
    return started;
  }, [startRecording, onRecordingStarted]);

  const finishRecording = useCallback(async () => {
    if (startPromiseRef.current) return;

    const res = await stopRecording();
    if (!res) return;

    transcribe(
      { audioBlob: res.audioBlob, mimeType: res.mimeType, departmentName },
      {
        onSuccess: (data) => {
          onStructured(data.structured, data.transcript);
          setTranscript(data.transcript);
        },
      }
    );
  }, [stopRecording, transcribe, onStructured]);

  // --- Hold gesture (mobile/touch) ---
  const handlePointerDown = useCallback(async () => {
    isPressedRef.current = true;
    const started = await beginRecording();
    if (!started) isPressedRef.current = false;
  }, [beginRecording]);

  const handlePointerUp = useCallback(async () => {
    if (!isPressedRef.current) return;
    isPressedRef.current = false;

    if (startPromiseRef.current) {
      const started = await startPromiseRef.current;
      startPromiseRef.current = null;
      if (!started) return;
    }

    finishRecording();
  }, [finishRecording]);

  // --- Toggle gesture (desktop/mouse) ---
  const handleClick = useCallback(async () => {
    if (isRecording) {
      finishRecording();
    } else {
      await beginRecording();
    }
  }, [isRecording, beginRecording, finishRecording]);

  const timerDisplay =
    elapsedSeconds > 0
      ? `${Math.floor(elapsedSeconds / 60)}:${String(elapsedSeconds % 60).padStart(2, "0")}`
      : null;

  const idleLabel = useHoldGesture ? "Press & Hold to Dictate" : "Click to Dictate";
  const activeLabel = useHoldGesture
    ? `Recording... ${timerDisplay ?? ""}`
    : `Recording... ${timerDisplay ?? ""} — Click to Stop`;

  const MicIcon = useHoldGesture ? Mic : isRecording ? Square : Mic;

  const buttonProps = useHoldGesture
    ? {
        onPointerDown: handlePointerDown,
        onPointerUp: handlePointerUp,
        onPointerLeave: handlePointerUp,
        onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
      }
    : {
        onClick: handleClick,
      };

  const dictationButton = (
    <button
      {...buttonProps}
      className={`rounded-lg border-2 text-center font-semibold transition-all select-none ${
        useHoldGesture ? "touch-none" : ""
      } ${
        isRecording
          ? "border-destructive/60 bg-destructive/5 text-destructive"
          : "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
      } ${
        isCompact
          ? "w-full px-4 py-2.5 text-sm"
          : "w-full p-6 text-lg"
      }`}
    >
      <MicIcon className={isCompact ? "h-5 w-5 inline mr-1.5" : "h-8 w-8 mx-auto mb-2 block"} />
      {isRecording ? activeLabel : isCompact ? "Record Additional Notes" : idleLabel}
    </button>
  );

  return (
    <div className={isCompact ? "space-y-2" : "space-y-3"}>
      {hasError ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-center space-y-2">
          <MicOff className="h-8 w-8 mx-auto text-destructive/60" />
          <p className="text-sm text-destructive">{errorMessage}</p>
          <Button variant="outline" size="sm" onClick={onOpenNotes}>
            <FileText className="h-3 w-3 mr-1" />{secondaryLabel}
          </Button>
        </div>
      ) : isProcessing ? (
        <div className="rounded-lg border bg-card p-6 text-center space-y-2">
          <Spinner size="md" />
          <p className="text-sm text-muted-foreground">Structuring clinical notes...</p>
        </div>
      ) : isCompact ? (
        <div className="flex items-center gap-2">
          <div className="flex-1">{dictationButton}</div>
          <Button variant="outline" size="sm" onClick={onOpenNotes} className="shrink-0">
            <FileText className="h-3.5 w-3.5 mr-1" />{secondaryLabel}
          </Button>
        </div>
      ) : (
        <>
          {dictationButton}

          {!isRecording && (
            <p className="text-center text-sm text-muted-foreground">
              or{" "}
              <button
                onClick={onOpenNotes}
                className="underline hover:text-foreground transition-colors font-medium"
              >
                {secondaryLabel.toLowerCase()}
              </button>
            </p>
          )}
        </>
      )}
    </div>
  );
}
