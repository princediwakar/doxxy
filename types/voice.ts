// types/voice.ts

// Voice Scribe & Active Encounter Canvas — type definitions

export type VoiceRecordingState =
  | 'idle'
  | 'requesting_permission'
  | 'recording'
  | 'paused'
  | 'error';

export interface AIExtractedPrescription {
  drug_name: string | null;
  dosage: string | null;
  formulation: string | null;
  frequency: string | null;
  duration: string | null;
  route: string | null;
  instructions: string | null;
  medicine_id?: number | null;
}

export interface AIStructuredOutput {
  // --- CORE TOP-LEVEL FIELDS ---
  symptoms: string | null; // Mapped from chief_complaint
  diagnosis: string | null;
  advice: string | null; // Mapped from treatment/therapy_plan
  follow_up: string | null; 

  // --- ARRAYS ---
  prescriptions: AIExtractedPrescription[];
  discontinued_medications?: string[];
  additional_clinical_findings?: string[];
  ruled_out_findings?: string[];

  // --- DYNAMIC / DEPARTMENT FIELDS ---
  // rawFields acts as the catch-all for department-specific data 
  // (e.g., eye_examination, motor_examination, tooth_charting).
  // We type the most common base fields here so the UI can easily bind to them.
  rawFields?: {
    history_of_present_illness?: string | null;
    past_medical_history?: string | null;
    family_history?: string | null;
    medications?: string | null; // Past medications history
    allergies?: string | null;
    vital_signs?: Record<string, string | null> | null;
    physical_exam?: string | null;
    systemic_examination?: string | null;
    previous_investigations?: string | null;
    assessment?: string | null;
    planned_investigations?: string | null;
    prognosis?: string | null;
    referrals?: string | null;
    // Allows any other department-specific nested objects or strings
    [key: string]: unknown; 
  };
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