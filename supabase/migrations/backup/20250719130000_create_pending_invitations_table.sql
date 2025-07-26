-- This migration is redundant - pending_invitations table is already created in the complete schema migration
-- Adding expiration functionality to existing pending_invitations table

-- Add expires_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pending_invitations' AND column_name = 'expires_at') THEN
        ALTER TABLE public.pending_invitations ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Update invitation_token to be TEXT instead of UUID if needed
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pending_invitations' AND column_name = 'invitation_token' AND data_type = 'uuid') THEN
        ALTER TABLE public.pending_invitations ALTER COLUMN invitation_token TYPE TEXT;
    END IF;
END $$;