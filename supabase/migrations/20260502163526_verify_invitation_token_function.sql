
-- SECURITY DEFINER function to verify invitation tokens.
-- Bypasses RLS so anonymous users can look up their invitation before signing in.
CREATE OR REPLACE FUNCTION verify_invitation_token(p_token text, p_email text)
RETURNS SETOF pending_invitations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.pending_invitations
  WHERE invitation_token = p_token
    AND LOWER(email) = LOWER(p_email)
    AND accepted_at IS NULL
    AND expires_at > NOW()
  LIMIT 1;
END;
$$;

-- Check if invitation was already accepted (for existing-user auto-add flow)
CREATE OR REPLACE FUNCTION check_accepted_invitation(p_token text, p_email text)
RETURNS SETOF pending_invitations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.pending_invitations
  WHERE invitation_token = p_token
    AND LOWER(email) = LOWER(p_email)
    AND accepted_at IS NOT NULL
  LIMIT 1;
END;
$$;

-- Check if invitation has expired
CREATE OR REPLACE FUNCTION check_expired_invitation(p_token text, p_email text)
RETURNS SETOF pending_invitations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.pending_invitations
  WHERE invitation_token = p_token
    AND LOWER(email) = LOWER(p_email)
    AND expires_at < NOW()
  LIMIT 1;
END;
$$;
