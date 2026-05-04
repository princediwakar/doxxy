// hooks/voice/useVoiceTranscription.ts
'use client';

import { useState, useRef, useCallback } from 'react';
import { getSupabase } from '@/integrations/supabase/client';
import { showErrorToast } from '@/lib/error-utils';
import type { VoiceTranscribeResponse } from '@/types/voice';

interface TranscribeVars {
  audioBlob: Blob;
  mimeType: string;
  departmentName?: string;
}

interface TranscribeOptions {
  onSuccess?: (data: VoiceTranscribeResponse) => void;
  onError?: (error: Error) => void;
}

export function useVoiceTranscription() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [result, setResult] = useState<VoiceTranscribeResponse | undefined>();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const resetTranscription = useCallback(() => {
    clearPolling();
    setIsTranscribing(false);
    setResult(undefined);
  }, [clearPolling]);

  const transcribe = useCallback(
    (vars: TranscribeVars, options?: TranscribeOptions) => {
      const { audioBlob, mimeType, departmentName } = vars;

      const run = async () => {
        setIsTranscribing(true);
        setResult(undefined);

        try {
          // Step 1: Get user session for auth token and user ID
          const { data: sessionData, error: sessionError } = await getSupabase().auth.getSession();
          if (sessionError || !sessionData.session) {
            throw new Error('Authentication required. Please sign in again.');
          }

          const accessToken = sessionData.session.access_token;
          const userId = sessionData.session.user.id;

          // Step 2: Upload audio to Supabase Storage
          const ext = mimeType.includes('webm')
            ? 'webm'
            : mimeType.includes('mp4')
              ? 'mp4'
              : mimeType.includes('mpeg')
                ? 'mpeg'
                : 'ogg';
          const filename = `${Date.now()}.${ext}`;
          const filePath = `${userId}/${filename}`;

          // Strip codec parameters (e.g., "audio/webm;codecs=opus" → "audio/webm")
          const cleanMimeType = mimeType.split(';')[0];

          const { error: uploadError } = await getSupabase().storage
            .from('voice-recordings')
            .upload(filePath, audioBlob, {
              contentType: cleanMimeType,
              upsert: false,
            });

          if (uploadError) {
            const supabaseMsg = uploadError.message || JSON.stringify(uploadError);
            throw new Error(`Failed to upload audio: ${supabaseMsg}`);
          }

          // Step 3: Submit to transcribe endpoint
          const transcribeResponse = await fetch('/api/voice/transcribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              filePath,
              department: departmentName || 'General',
            }),
          });

          if (!transcribeResponse.ok) {
            const err = await transcribeResponse.json().catch(() => ({ error: 'Transcription failed' }));
            throw new Error(err.error || err.details || 'Transcription failed');
          }

          const transcribeData = await transcribeResponse.json();
          const jobId: string = transcribeData.jobId;

          // If the transcribe endpoint returned complete results (idempotency), use them directly
          if (transcribeData.transcript !== undefined && transcribeData.status !== 'error') {
            clearPolling();
            setIsTranscribing(false);
            const finalResult: VoiceTranscribeResponse = {
              transcript: transcribeData.transcript || '',
              structured: transcribeData.structured || null,
              provider: 'sarvam+openai',
            };
            setResult(finalResult);
            options?.onSuccess?.(finalResult);
            return;
          }

          // Step 4: Poll for completion (max 10 minutes)
          clearPolling();
          const pollStart = Date.now();
          const MAX_POLL_MS = 10 * 60 * 1000;

          pollRef.current = setInterval(async () => {
            try {
              // Stop polling if we've exceeded the max time
              if (Date.now() - pollStart > MAX_POLL_MS) {
                clearPolling();
                setIsTranscribing(false);
                const err = new Error('Transcription timed out. Please try again.');
                showErrorToast(err);
                options?.onError?.(err);
                return;
              }

              const pollResponse = await fetch(`/api/voice/status?jobId=${jobId}`);

              if (!pollResponse.ok) {
                return; // keep polling on transient errors
              }

              const pollData = await pollResponse.json();

              if (pollData.status === 'done') {
                clearPolling();
                setIsTranscribing(false);

                const finalResult: VoiceTranscribeResponse = {
                  transcript: pollData.transcript || '',
                  structured: pollData.structured || null,
                  provider: 'sarvam+openai',
                };

                setResult(finalResult);
                options?.onSuccess?.(finalResult);
              } else if (pollData.status === 'error') {
                clearPolling();
                setIsTranscribing(false);
                const errMsg = pollData.error || 'Transcription failed';
                const err = new Error(errMsg);
                showErrorToast(err);
                options?.onError?.(err);
              }
            } catch {
              // keep polling on network errors
            }
          }, 3000);
        } catch (error: unknown) {
          clearPolling();
          setIsTranscribing(false);
          const err = error instanceof Error ? error : new Error('Transcription failed');
          showErrorToast(err);
          options?.onError?.(err);
        }
      };

      run();
    },
    [clearPolling],
  );

  return {
    transcribe,
    isTranscribing,
    result,
    resetTranscription,
  };
}
