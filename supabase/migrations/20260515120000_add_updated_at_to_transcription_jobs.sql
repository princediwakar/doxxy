ALTER TABLE public.transcription_jobs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.update_transcription_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_transcription_jobs_updated_at ON public.transcription_jobs;
CREATE TRIGGER set_transcription_jobs_updated_at
BEFORE UPDATE ON public.transcription_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_transcription_jobs_updated_at();
