
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- Schedule cleanup every 30 minutes: delete storage files and transcription_jobs
-- older than 2 hours, plus any failed jobs
SELECT cron.schedule(
  'cleanup-transcription-jobs',
  '*/30 * * * *',
  $$
    DELETE FROM storage.objects
    WHERE bucket_id = 'voice-recordings'
      AND created_at < NOW() - INTERVAL '2 hours';

    DELETE FROM public.transcription_jobs
    WHERE status = 'failed'
       OR created_at < NOW() - INTERVAL '2 hours';
  $$
);
