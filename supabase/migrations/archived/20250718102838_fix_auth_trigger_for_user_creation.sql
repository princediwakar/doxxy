-- Fix missing auth trigger for user creation
-- This trigger is essential for Google OAuth signup to work properly

-- First, ensure the handle_new_user function exists and is up to date
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile for the new user
  INSERT INTO public.profiles (id, name, email, phone, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.phone,
    NEW.created_at,
    NEW.updated_at
  );

  -- Check if this user has a pending invitation
  DECLARE
    invitation_record RECORD;
  BEGIN
    -- Look for pending invitation with this email
    SELECT * INTO invitation_record
    FROM public.pending_invitations
    WHERE email = NEW.email
    AND accepted_at IS NULL
    AND (expires_at IS NULL OR expires_at > NOW())
    LIMIT 1;

    -- If invitation exists, create clinic membership
    IF invitation_record.id IS NOT NULL THEN
      -- Create clinic membership
      INSERT INTO public.clinic_members (clinic_id, user_id, role, department_id, created_at, updated_at)
      VALUES (
        invitation_record.clinic_id,
        NEW.id,
        invitation_record.role,
        invitation_record.department_id,
        NOW(),
        NOW()
      );

      -- Mark invitation as accepted
      UPDATE public.pending_invitations
      SET accepted_at = NOW(), updated_at = NOW()
      WHERE id = invitation_record.id;

      -- If the user is a doctor, create doctor profile
      IF invitation_record.role = 'doctor' THEN
        INSERT INTO public.doctors (
          user_id,
          clinic_id,
          name,
          email,
          phone,
          is_active,
          created_at,
          updated_at
        ) VALUES (
          NEW.id,
          invitation_record.clinic_id,
          COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
          NEW.email,
          NEW.phone,
          true,
          NOW(),
          NOW()
        );
      END IF;
    END IF;

  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't fail user creation
      RAISE WARNING 'Error processing invitation for user %: %', NEW.email, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the missing trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure RLS policies are in place for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" ON public.profiles
      FOR SELECT USING (auth.uid() = id);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON public.profiles
      FOR UPDATE USING (auth.uid() = id);
  END IF;
END$$;