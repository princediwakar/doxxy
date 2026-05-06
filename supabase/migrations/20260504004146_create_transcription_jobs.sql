
CREATE TYPE transcription_job_status AS ENUM ('pending', 'transcribing', 'structuring', 'completed', 'failed');

CREATE TABLE IF NOT EXISTS transcription_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sarvam_task_id TEXT,
  storage_path TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'General',
  status transcription_job_status NOT NULL DEFAULT 'pending',
  transcript TEXT,
  structured_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transcription_jobs_user_id ON transcription_jobs(user_id);
CREATE INDEX idx_transcription_jobs_status ON transcription_jobs(status);
