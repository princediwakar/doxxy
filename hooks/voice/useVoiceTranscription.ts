// hooks/voice/useVoiceTranscription.ts
'use client';

import { useState, useCallback } from 'react';
import { getSupabase } from '@/integrations/supabase/client';
import { showErrorToast } from '@/lib/error-utils';
import type { VoiceTranscribeResponse, TranscriptionJob } from '@/types/voice';

interface TranscribeVars {
  audioBlob: Blob;
  mimeType: string;
  departmentName?: string;
}

interface TranscribeOptions {
  onSuccess?: (data: VoiceTranscribeResponse) => void;
  onError?: (error: Error) => void;
}

type JobUpdater = (
  updater: (prev: Record<string, TranscriptionJob>) => Record<string, TranscriptionJob>,
) => void;

async function executeTranscriptionJob(
  jobId: string,
  vars: TranscribeVars,
  updateJobs: JobUpdater,
  options?: TranscribeOptions,
): Promise<void> {
  const { audioBlob, mimeType, departmentName } = vars;

  const patchJob = (patch: Partial<TranscriptionJob>) => {
    updateJobs((prev) => {
      const current = prev[jobId];
      if (!current) return prev;
      return { ...prev, [jobId]: { ...current, ...patch } };
    });
  };

  try {
    patchJob({ status: 'uploading' });

    const { data: sessionData, error: sessionError } = await getSupabase().auth.getSession();
    if (sessionError || !sessionData.session) {
      throw new Error('Authentication required. Please sign in again.');
    }

    const accessToken = sessionData.session.access_token;
    const userId = sessionData.session.user.id;

    const ext = mimeType.includes('webm')
      ? 'webm'
      : mimeType.includes('mp4')
        ? 'mp4'
        : mimeType.includes('mpeg')
          ? 'mpeg'
          : 'ogg';
    const filename = `${Date.now()}.${ext}`;
    const filePath = `${userId}/${filename}`;
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
    const serverJobId: string = transcribeData.jobId || jobId;

    if (transcribeData.transcript !== undefined && transcribeData.status !== 'error') {
      const finalResult: VoiceTranscribeResponse = {
        transcript: transcribeData.transcript || '',
        structured: transcribeData.structured || null,
        provider: 'sarvam+openai',
      };
      patchJob({ status: 'done', result: finalResult });
      options?.onSuccess?.(finalResult);
      return;
    }

    patchJob({ status: 'processing' });

    const pollStart = Date.now();
    const MAX_POLL_MS = 10 * 60 * 1000;
    let consecutiveFailures = 0;
    const MAX_CONSECUTIVE_FAILURES = 5;

    await new Promise<void>((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          if (Date.now() - pollStart > MAX_POLL_MS) {
            clearInterval(interval);
            const err = new Error('Transcription timed out. Please try again.');
            patchJob({ status: 'error', error: err.message });
            showErrorToast(err);
            options?.onError?.(err);
            resolve();
            return;
          }

          const pollResponse = await fetch(`/api/voice/status?jobId=${serverJobId}`);

          if (!pollResponse.ok) {
            consecutiveFailures++;
            if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
              clearInterval(interval);
              const err = new Error('Transcription service is unavailable. Please try again later.');
              patchJob({ status: 'error', error: err.message });
              showErrorToast(err);
              options?.onError?.(err);
              resolve();
            }
            return;
          }

          consecutiveFailures = 0;

          const pollData = await pollResponse.json();

          if (pollData.status === 'done') {
            clearInterval(interval);
            const finalResult: VoiceTranscribeResponse = {
              transcript: pollData.transcript || '',
              structured: pollData.structured || null,
              provider: 'sarvam+openai',
              fieldConfidence: pollData.fieldConfidence,
            };
            patchJob({ status: 'done', result: finalResult });
            options?.onSuccess?.(finalResult);
            resolve();
          } else if (pollData.status === 'error') {
            clearInterval(interval);
            const errMsg = pollData.error || 'Transcription failed';
            const err = new Error(errMsg);
            patchJob({ status: 'error', error: errMsg });
            showErrorToast(err);
            options?.onError?.(err);
            resolve();
          }
        } catch {
          consecutiveFailures++;
          if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
            clearInterval(interval);
            const err = new Error('Transcription service is unavailable. Please try again later.');
            patchJob({ status: 'error', error: err.message });
            showErrorToast(err);
            options?.onError?.(err);
            resolve();
          }
        }
      }, 3000);
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error('Transcription failed');
    patchJob({ status: 'error', error: err.message });
    showErrorToast(err);
    options?.onError?.(err);
  }
}

export function useVoiceTranscription() {
  const [jobs, setJobs] = useState<Record<string, TranscriptionJob>>({});

  const hasActiveJobs = Object.values(jobs).some(
    (j) => j.status === 'uploading' || j.status === 'processing' || j.status === 'pending',
  );

  const resetTranscription = useCallback(() => {
    setJobs({});
  }, []);

  const transcribe = useCallback(
    (vars: TranscribeVars, options?: TranscribeOptions): string => {
      const jobId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setJobs((prev) => ({
        ...prev,
        [jobId]: { jobId, status: 'pending' },
      }));
      executeTranscriptionJob(jobId, vars, setJobs, options);
      return jobId;
    },
    [],
  );

  return {
    transcribe,
    jobs,
    hasActiveJobs,
    resetTranscription,
  };
}
