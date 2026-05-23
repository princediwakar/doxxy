// components/schedule/DictationZone.tsx
"use client";

import { Mic, MicOff, Square, FileText, Pause, Play, AlertTriangle, Settings, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";
import { useDictationMachine } from "@/hooks/voice/useDictationMachine";
import type { AIStructuredOutput, FieldConfidence } from "@/types/voice";

type DictationVariant = "active" | "compact";

interface DictationZoneProps {
  onStructured: (structured: AIStructuredOutput | null, transcript: string, fieldConfidence?: FieldConfidence[]) => void;
  onOpenNotes: () => void;
  onRecordingStarted?: () => void;
  variant?: DictationVariant;
  secondaryLabel: string;
  departmentName?: string;
  getLiveFormData?: () => Record<string, unknown>;
  scrollToReview?: () => void;
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
  departmentName = "General",
  getLiveFormData,
  scrollToReview,
}: DictationZoneProps) {
  const {
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
  } = useDictationMachine({
    departmentName,
    getLiveFormData,
    onStructured,
    onRecordingStarted,
    scrollToReview,
  });

  const isCompact = variant === "compact";

  if (captureState === "error") {
    const openSettings = permissionSettingsUrl
      ? () => {
          window.location.href = permissionSettingsUrl;
        }
      : undefined;

    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 dark:bg-destructive/10 p-4 text-center space-y-3">
        <MicOff className="h-8 w-8 mx-auto text-destructive/60" />
        <p className="text-sm text-destructive whitespace-pre-wrap">{errorMessage}</p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {openSettings && (
            <Button variant="default" size="sm" onClick={openSettings}>
              <Settings className="h-3 w-3 mr-1" />Open Settings
            </Button>
          )}
          <Button variant={openSettings ? "outline" : "default"} size="sm" onClick={beginRecording}>
            <Mic className="h-3 w-3 mr-1" />Try Again
          </Button>
          <Button variant="outline" size="sm" onClick={onOpenNotes}>
            <FileText className="h-3 w-3 mr-1" />{secondaryLabel}
          </Button>
        </div>
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
          <div className="rounded-lg border bg-card p-4 max-h-64 overflow-y-auto shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Live transcription</span>
            </div>
            <p className="text-base whitespace-pre-wrap leading-relaxed">{transcriptBuffer}</p>
          </div>
        )}
        <div className="rounded-lg border-2 border-amber-400/60 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20 p-4 text-center">
          <p className="text-lg font-mono font-semibold text-amber-700 dark:text-amber-300 mb-3">
            {formatTimer(elapsedSeconds)}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button size="sm" variant="ghost" onClick={cancelRecording}>
              Cancel
            </Button>
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
          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Connection interrupted. Audio saved locally — continue speaking.</span>
          </div>
        )}
        {transcriptBuffer && (
          <div className="rounded-lg border bg-card p-4 max-h-64 overflow-y-auto shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Live transcription</span>
            </div>
            <p className="text-base whitespace-pre-wrap leading-relaxed">{transcriptBuffer}</p>
          </div>
        )}
        <div className={`rounded-lg border-2 p-4 text-center ${
          isDegraded
            ? "border-amber-400/60 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20"
            : "border-destructive/60 bg-destructive/5 dark:bg-destructive/10"
        }`}>
          <p className={`text-lg font-mono font-semibold mb-3 ${
            isDegraded ? "text-amber-700 dark:text-amber-300" : "text-destructive"
          }`}>
            {formatTimer(elapsedSeconds)}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button size="sm" variant="ghost" onClick={cancelRecording}>
              Cancel
            </Button>
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

  if (captureState === "processing") {
    const progressText = fallbackProgress
      ? fallbackProgress.phase === "submitting"
        ? "Submitting recording..."
        : `Processing offline audio (Attempt ${fallbackProgress.attempt} of ${fallbackProgress.maxAttempts})...`
      : "Processing recording...";

    return (
      <div className={isCompact ? "space-y-2" : "space-y-3"}>
        {transcriptBuffer && (
          <div className="rounded-lg border bg-card p-4 max-h-64 overflow-y-auto shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Captured transcript</span>
            </div>
            <p className="text-base whitespace-pre-wrap leading-relaxed">{transcriptBuffer}</p>
          </div>
        )}
        <div className="rounded-lg border bg-card p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <Spinner size="sm" />
            <span className="text-sm font-medium">{progressText}</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Crash recovery prompt ──────────────────────────────────────────────────

  if (captureState === "idle" && hasOrphanedSession && orphanedSession && !isStructuring) {
    const minutesAgo = Math.round((Date.now() - orphanedSession.startedAt) / 60_000);
    const timeLabel = minutesAgo < 1 ? "just now" : minutesAgo < 60 ? `${minutesAgo} min ago` : `${Math.round(minutesAgo / 60)} h ago`;

    return (
      <div className="rounded-lg border-2 border-amber-400/60 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20 p-4 space-y-3">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
          <AlertTriangle className="h-5 w-5" />
          <span className="text-sm font-semibold">Recovering unsaved dictation...</span>
        </div>
        <p className="text-xs text-amber-600 dark:text-amber-400">
          A dictation from {timeLabel} ({orphanedSession.department}) was interrupted.
          {orphanedSessionPreview && (
            <> Last saved: &ldquo;{orphanedSessionPreview.slice(0, 80)}{orphanedSessionPreview.length > 80 ? "..." : ""}&rdquo;</>
          )}
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={dismissOrphanedSession}
            disabled={isRecovering}
          >
            <Trash2 className="h-3 w-3 mr-1" />Discard
          </Button>
          <Button
            size="sm"
            onClick={recoverSession}
            disabled={isRecovering}
          >
            {isRecovering ? (
              <Spinner size="sm" />
            ) : (
              <RotateCcw className="h-3 w-3 mr-1" />
            )}
            Recover
          </Button>
        </div>
      </div>
    );
  }

  // Idle state
  return (
    <div className={isCompact ? "space-y-2" : "space-y-3"}>
      {isStructuring && (
        <div className="space-y-3">
          {transcriptBuffer && (
            <div className="rounded-lg border bg-card p-4 max-h-64 overflow-y-auto shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-muted-foreground/40" />
                </span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Captured transcript</span>
              </div>
              <p className="text-base whitespace-pre-wrap leading-relaxed">{transcriptBuffer}</p>
            </div>
          )}
          <div className="rounded-lg border bg-card p-4 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <span className="text-sm font-medium">
                Structuring clinical notes...
              </span>
            </div>
          </div>
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
