-- Fix avatar upload RLS policy to allow files with user_id prefix in filename
-- The current policy expects folder structure, but we're uploading files with user_id prefix

-- Drop the existing INSERT policy that requires folder structure
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;

-- Create a new INSERT policy that allows files with user_id prefix
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT TO public
WITH CHECK (
  bucket_id = 'avatars' AND
  (
    -- Allow files with user_id prefix in filename
    name LIKE (auth.uid()::text) || '_%' OR
    -- Also allow files in user_id folder structure for backward compatibility
    (storage.foldername(name))[1] = (auth.uid()::text)
  )
);

-- Also update the UPDATE policy to be consistent
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;

CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE TO public
USING (
  bucket_id = 'avatars' AND
  (
    name LIKE (auth.uid()::text) || '_%' OR
    (storage.foldername(name))[1] = (auth.uid()::text)
  )
)
WITH CHECK (
  bucket_id = 'avatars' AND
  (
    name LIKE (auth.uid()::text) || '_%' OR
    (storage.foldername(name))[1] = (auth.uid()::text)
  )
);

-- Update the DELETE policy as well for consistency
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE TO public
USING (
  bucket_id = 'avatars' AND
  (
    name LIKE (auth.uid()::text) || '_%' OR
    (storage.foldername(name))[1] = (auth.uid()::text)
  )
);