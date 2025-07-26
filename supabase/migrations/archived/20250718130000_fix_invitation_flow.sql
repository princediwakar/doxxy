-- Fix invitation flow issues
-- This fixes phone number handling and profile creation

-- Update the handle_new_user function to better handle invitation metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  invitation_record RECORD;
  user_name TEXT;
  user_phone TEXT;
BEGIN
  -- Extract user information from various sources
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'display_name',
    split_part(NEW.email, '@', 1)
  );
  
  user_phone := COALESCE(
    NEW.phone,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'phone_number'
  );

  -- Create profile for the new user
  INSERT INTO public.profiles (id, name, email, phone, created_at, updated_at)
  VALUES (
    NEW.id,
    user_name,
    NEW.email,
    user_phone,
    NEW.created_at,
    NEW.updated_at
  );

  -- Check if this user has a pending invitation
  BEGIN
    -- Look for pending invitation with this email
    SELECT * INTO invitation_record
    FROM public.pending_invitations
    WHERE email = NEW.email
    AND accepted_at IS NULL
    AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY created_at DESC
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

      -- Update profile with invitation data if available
      UPDATE public.profiles
      SET
        name = COALESCE(user_name, invitation_record.name),
        phone = COALESCE(user_phone, invitation_record.phone),
        updated_at = NOW()
      WHERE id = NEW.id;

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
          COALESCE(user_name, invitation_record.name),
          NEW.email,
          COALESCE(user_phone, invitation_record.phone),
          true,
          NOW(),
          NOW()
        );
      END IF;

      -- Log successful invitation processing
      RAISE NOTICE 'Invitation processed successfully for user % to clinic %', NEW.email, invitation_record.clinic_id;
    END IF;

  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't fail user creation
      RAISE WARNING 'Error processing invitation for user %: %', NEW.email, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger is recreated
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add index for faster invitation lookups
CREATE INDEX IF NOT EXISTS idx_pending_invitations_email_active 
ON public.pending_invitations (email, accepted_at, expires_at) 
WHERE accepted_at IS NULL;

-- Add function to help with invitation flow debugging
CREATE OR REPLACE FUNCTION debug_invitation_flow(user_email TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'user_exists', EXISTS(SELECT 1 FROM auth.users WHERE email = user_email),
    'profile_exists', EXISTS(SELECT 1 FROM public.profiles WHERE email = user_email),
    'pending_invitations', (
      SELECT json_agg(
        json_build_object(
          'id', id,
          'clinic_id', clinic_id,
          'role', role,
          'name', name,
          'phone', phone,
          'created_at', created_at,
          'accepted_at', accepted_at,
          'expires_at', expires_at
        )
      )
      FROM public.pending_invitations
      WHERE email = user_email
    ),
    'clinic_memberships', (
      SELECT json_agg(
        json_build_object(
          'clinic_id', clinic_id,
          'role', role,
          'department_id', department_id,
          'created_at', created_at
        )
      )
      FROM public.clinic_members cm
      JOIN auth.users u ON cm.user_id = u.id
      WHERE u.email = user_email
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;