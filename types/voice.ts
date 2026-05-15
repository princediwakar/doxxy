// Voice Scribe & Active Encounter Canvas — type definitions

export type VoiceRecordingState =
  | 'idle'
  | 'requesting_permission'
  | 'recording'
  | 'paused'
  | 'error';

export interface AIExtractedPrescription {
  drug_name: string;
  dosage: string;
  formulation: string | null;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
  medicine_id?: number | null;
}

export interface AIStructuredOutput {
  symptoms: string;
  diagnosis: string;
  prescriptions: AIExtractedPrescription[];
  differential_diagnosis?: string[];
  discontinued_medications?: string[];
  advice: string;
  rawFields?: Record<string, unknown>;
}

export type EncounterReviewState =
  | { phase: 'idle' }
  | { phase: 'processing' }
  | { phase: 'review'; structured: AIStructuredOutput | null; transcript: string; fieldConfidence?: FieldConfidence[] };

export interface VoiceTranscribeResponse {
  transcript: string;
  structured: AIStructuredOutput | null;
  provider: string;
  fieldMetadata?: Record<string, { label: string }>;
  fieldConfidence?: FieldConfidence[];
}

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface FieldConfidence {
  field: string;
  level: ConfidenceLevel;
  reason: string;
}

export type TranscriptionJobStatus =
  | 'pending'
  | 'uploading'
  | 'processing'
  | 'done'
  | 'error';

export interface TranscriptionJob {
  jobId: string;
  status: TranscriptionJobStatus;
  result?: VoiceTranscribeResponse;
  error?: string;
}

export interface VoiceRecordingResult {
  audioBlob: Blob;
  mimeType: string;
}
