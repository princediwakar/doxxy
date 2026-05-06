
-- Allow authenticated users to insert into their own folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'voice-recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to read their own objects
CREATE POLICY "Users can read own recordings"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'voice-recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own objects
CREATE POLICY "Users can delete own recordings"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'voice-recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Enable RLS on transcription_jobs for defense in depth
ALTER TABLE public.transcription_jobs ENABLE ROW LEVEL SECURITY;

-- Only allow users to read their own transcription jobs (client-side fallback)
CREATE POLICY "Users can read own transcription jobs"
ON public.transcription_jobs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
