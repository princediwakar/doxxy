-- Fix pending invitations acceptance workflow
-- Allow users to mark their own pending invitations as accepted

-- Add UPDATE policy for pending_invitations to allow users to mark their own invitations as accepted
CREATE POLICY "pending_invitations_invitee_update" ON public.pending_invitations
FOR UPDATE
TO public
USING (
  LOWER(email) = (
    SELECT LOWER(email)
    FROM auth.users
    WHERE id = auth.uid()
  )
  AND accepted_at IS NULL
  AND expires_at > NOW()
)
WITH CHECK (
  LOWER(email) = (
    SELECT LOWER(email)
    FROM auth.users
    WHERE id = auth.uid()
  )
  AND accepted_at IS NOT NULL
);

-- Add INSERT policy for pending_invitations to allow service role operations
-- This ensures the invite-member edge function can still create invitations
CREATE POLICY "pending_invitations_service_insert" ON public.pending_invitations
FOR INSERT
TO service_role
WITH CHECK (true);

-- Add UPDATE policy for pending_invitations to allow service role operations
CREATE POLICY "pending_invitations_service_update" ON public.pending_invitations
FOR UPDATE
TO service_role
WITH CHECK (true);

-- Add DELETE policy for pending_invitations to allow service role operations
CREATE POLICY "pending_invitations_service_delete" ON public.pending_invitations
FOR DELETE
TO service_role
WITH CHECK (true);