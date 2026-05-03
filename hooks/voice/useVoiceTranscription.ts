'use client';

import { useMutation } from '@tanstack/react-query';
import { showErrorToast } from '@/lib/error-utils';
import type { VoiceTranscribeResponse } from '@/types/voice';

export function useVoiceTranscription() {
  const mutation = useMutation({
    mutationFn: async ({
      audioBlob,
      mimeType,
      departmentName,
    }: {
      audioBlob: Blob;
      mimeType: string;
      departmentName?: string;
    }): Promise<VoiceTranscribeResponse> => {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording');
      formData.append('mimeType', mimeType);
      if (departmentName) {
        formData.append('department', departmentName);
      }

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Transcription failed' }));
        throw new Error(err.error || 'Transcription failed');
      }

      return response.json();
    },
    onError: (err) => {
      showErrorToast(err);
    },
  });

  return {
    transcribe: mutation.mutate,
    isTranscribing: mutation.isPending,
    result: mutation.data,
    resetTranscription: mutation.reset,
  };
}
