'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type { VoiceRecordingState, VoiceRecordingResult } from '@/types/voice';

const MAX_RECORDING_SECONDS = 30;

function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/mp4;codecs=mp4a.40.2',
    'audio/mpeg',
    'audio/ogg;codecs=opus',
  ];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) || '';
}

export function useVoiceRecorder() {
  const [state, setState] = useState<VoiceRecordingState>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mimeTypeRef = useRef<string>('');

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    setErrorMessage(null);

    if (typeof MediaRecorder === 'undefined') {
      setState('error');
      setErrorMessage('Your browser does not support voice recording.');
      return false;
    }

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      setState('error');
      setErrorMessage('Your browser does not support any compatible audio format.');
      return false;
    }

    mimeTypeRef.current = mimeType;

    setState('requesting_permission');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        cleanup();
        setState('idle');
      };

      recorder.onerror = () => {
        setState('error');
        setErrorMessage('Recording failed. Please try again.');
        cleanup();
      };

      recorder.start(1000);
      setState('recording');
      setElapsedSeconds(0);

      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          if (prev + 1 >= MAX_RECORDING_SECONDS) {
            if (mediaRecorderRef.current?.state === 'recording') {
              mediaRecorderRef.current.stop();
              toast.info('Maximum recording length reached');
            }
            return MAX_RECORDING_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);

      return true;
    } catch (err: unknown) {
      const error = err as { name?: string };
      if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
        setState('error');
        setErrorMessage('Microphone access denied. Please enable permissions in your browser settings.');
      } else if (error?.name === 'NotSupportedError') {
        setState('error');
        setErrorMessage('Your browser does not support the required audio codec.');
      } else {
        setState('error');
        setErrorMessage('Could not start recording. Please check your microphone.');
      }
      return false;
    }
  }, [cleanup]);

  const stopRecording = useCallback((): Promise<VoiceRecordingResult | null> => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== 'recording') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      mediaRecorderRef.current = null;
      chunksRef.current = [];
      setState('idle');
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      recorder.onstop = () => {
        const hasChunks = chunksRef.current.length > 0;
        const result: VoiceRecordingResult | null = hasChunks
          ? { audioBlob: new Blob(chunksRef.current, { type: mimeTypeRef.current }), mimeType: mimeTypeRef.current }
          : null;
        cleanup();
        setState('idle');
        resolve(result);
      };

      recorder.stop();
    });
  }, []);

  const resetRecording = useCallback(() => {
    cleanup();
    setState('idle');
    setElapsedSeconds(0);
    setErrorMessage(null);
  }, [cleanup]);

  return {
    state,
    elapsedSeconds,
    errorMessage,
    startRecording,
    stopRecording,
    resetRecording,
  };
}
