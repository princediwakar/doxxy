-- Allow unauthenticated users to verify their invitation by token
-- This is needed because invitation verification happens on /auth BEFORE login
CREATE POLICY "pending_invitations_anon_verify_by_token" ON public.pending_invitations
FOR SELECT TO anon, authenticated
USING (
  invitation_token IS NOT NULL
  AND accepted_at IS NULL
  AND expires_at > NOW()
);
