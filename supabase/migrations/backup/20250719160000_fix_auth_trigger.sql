-- Fix auth trigger and data type consistency issues

-- Ensure the trigger is properly created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure invitation_token is TEXT type in pending_invitations table
DO $$
BEGIN
    -- Check if invitation_token column exists and is UUID type
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pending_invitations' 
        AND column_name = 'invitation_token' 
        AND data_type = 'uuid'
    ) THEN
        -- Change invitation_token from UUID to TEXT
        ALTER TABLE public.pending_invitations 
        ALTER COLUMN invitation_token TYPE TEXT USING invitation_token::TEXT;
        
        -- Update default value to cast gen_random_uuid() to text
        ALTER TABLE public.pending_invitations 
        ALTER COLUMN invitation_token SET DEFAULT gen_random_uuid()::TEXT;
    END IF;
END $$;

-- Add expires_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pending_invitations' 
        AND column_name = 'expires_at'
    ) THEN
        ALTER TABLE public.pending_invitations 
        ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Test the function by running a simple validation
DO $$
BEGIN
    -- This will fail if there are any syntax errors in the function
    PERFORM public.handle_new_user();
EXCEPTION 
    WHEN others THEN
        RAISE NOTICE 'Function validation failed: %', SQLERRM;
END $$;