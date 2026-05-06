
-- Remove the broken cron job
SELECT cron.unschedule(1);

-- Create a cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_transcription_jobs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions', 'vault'
AS $$
DECLARE
  rec RECORD;
  service_key text;
BEGIN
  -- Get the service role key from vault
  BEGIN
    SELECT decrypted_secret INTO service_key
    FROM vault.decrypted_secrets
    WHERE name IN ('SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY')
    LIMIT 1;
  EXCEPTION
    WHEN OTHERS THEN
      service_key := NULL;
  END;

  -- Delete storage files via Storage API for jobs to be cleaned up
  IF service_key IS NOT NULL THEN
    FOR rec IN
      SELECT storage_path
      FROM public.transcription_jobs
      WHERE (status = 'failed' OR created_at < NOW() - INTERVAL '2 hours')
        AND storage_path IS NOT NULL
    LOOP
      PERFORM net.http_delete(
        url := 'https://chftygsapwhahqbqlfdx.supabase.co/storage/v1/object/voice-recordings/' || rec.storage_path,
        headers := jsonb_build_object(
          'Authorization', 'Bearer ' || service_key
        )
      );
    END LOOP;
  END IF;

  -- Delete the transcription_jobs rows
  DELETE FROM public.transcription_jobs
  WHERE status = 'failed'
     OR created_at < NOW() - INTERVAL '2 hours';
END;
$$;

-- Schedule the cleanup function to run every 30 minutes
SELECT cron.schedule(
  'cleanup-transcription-jobs',
  '*/30 * * * *',
  'SELECT public.cleanup_transcription_jobs();'
);
