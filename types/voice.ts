// Voice Scribe & Active Encounter Canvas — type definitions

export type VoiceRecordingState =
  | 'idle'
  | 'requesting_permission'
  | 'recording'
  | 'error';

export interface AIExtractedPrescription {
  drug_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
}

export interface AIStructuredOutput {
  symptoms: string;
  diagnosis: string;
  prescriptions: AIExtractedPrescription[];
  advice: string;
  rawFields?: Record<string, unknown>;
}

export type EncounterReviewState =
  | { phase: 'idle' }
  | { phase: 'processing' }
  | { phase: 'review'; structured: AIStructuredOutput | null; transcript: string };

export interface VoiceTranscribeResponse {
  transcript: string;
  structured: AIStructuredOutput | null;
  provider: string;
  fieldMetadata?: Record<string, { label: string }>;
}

export interface VoiceRecordingResult {
  audioBlob: Blob;
  mimeType: string;
}
