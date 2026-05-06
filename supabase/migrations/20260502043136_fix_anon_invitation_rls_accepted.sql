-- Drop the old restrictive policy and recreate to also allow reading accepted/expired invitations
-- The frontend needs to check invitation status to show appropriate messages
DROP POLICY IF EXISTS "pending_invitations_anon_verify_by_token" ON public.pending_invitations;

CREATE POLICY "pending_invitations_anon_verify_by_token" ON public.pending_invitations
FOR SELECT TO anon, authenticated
USING (
  invitation_token IS NOT NULL
);
