-- Allow users to access their own pending invitations for verification
CREATE POLICY "pending_invitations_invitee_access" ON public.pending_invitations
FOR SELECT
TO public
USING (
  LOWER(email) = (
    SELECT LOWER(email)
    FROM auth.users
    WHERE id = auth.uid()
  )
  AND accepted_at IS NULL
  AND expires_at > NOW()
);