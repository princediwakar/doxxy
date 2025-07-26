-- Simple email-based invitation system
-- No tokens, no links - just email-based invitations

-- First, create a simple RPC function to invite users by email
CREATE OR REPLACE FUNCTION public.invite_user_by_email(
  p_email TEXT,
  p_clinic_id UUID,
  p_role public.user_role DEFAULT 'staff',
  p_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_invitation_id UUID;
  v_existing_user_id UUID;
  v_result JSON;
BEGIN
  -- Validate inputs
  IF p_email IS NULL OR p_email = '' THEN
    RETURN json_build_object('success', false, 'error', 'Email is required');
  END IF;
  
  IF p_clinic_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Clinic ID is required');
  END IF;

  -- Check if user is already a member of this clinic
  SELECT user_id INTO v_existing_user_id
  FROM clinic_members cm
  JOIN auth.users u ON cm.user_id = u.id
  WHERE u.email = p_email AND cm.clinic_id = p_clinic_id;
  
  IF v_existing_user_id IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'User is already a member of this clinic');
  END IF;

  -- Insert or update pending invitation
  INSERT INTO public.pending_invitations (
    email,
    clinic_id,
    role,
    name,
    phone,
    created_at,
    updated_at,
    expires_at
  )
  VALUES (
    LOWER(TRIM(p_email)),
    p_clinic_id,
    p_role,
    p_name,
    p_phone,
    NOW(),
    NOW(),
    NOW() + INTERVAL '30 days'  -- 30 day expiry
  )
  ON CONFLICT (email, clinic_id) 
  DO UPDATE SET
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    updated_at = NOW(),
    expires_at = NOW() + INTERVAL '30 days',
    accepted_at = NULL  -- Reset if re-inviting
  RETURNING id INTO v_invitation_id;

  RETURN json_build_object(
    'success', true, 
    'invitation_id', v_invitation_id,
    'message', 'User invited successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Simplified handle_new_user trigger - just check email-based invitations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  existing_invitation RECORD;
  profile_created BOOLEAN := false;
BEGIN
  -- Get user email
  user_email := LOWER(TRIM(COALESCE(NEW.email, '')));
  
  -- Log the user creation
  RAISE NOTICE 'Processing new user: % (ID: %)', user_email, NEW.id;
  
  -- Skip processing if no email
  IF user_email = '' THEN
    RAISE NOTICE 'No email for user %, skipping invitation processing', NEW.id;
    RETURN NEW;
  END IF;

  -- Create basic profile (this should always work)
  BEGIN
    INSERT INTO public.profiles (
      id, 
      name, 
      email, 
      phone, 
      created_at, 
      updated_at
    )
    VALUES (
      NEW.id, 
      COALESCE(
        NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'name', '')), ''),
        NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'full_name', '')), ''),
        split_part(user_email, '@', 1),
        'User'
      ),
      user_email,
      NULLIF(TRIM(COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', '')), ''),
      NOW(), 
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      name = COALESCE(EXCLUDED.name, profiles.name),
      email = COALESCE(EXCLUDED.email, profiles.email),
      phone = COALESCE(EXCLUDED.phone, profiles.phone),
      updated_at = NOW();
      
    profile_created := true;
    RAISE NOTICE 'Profile created for user: %', user_email;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to create profile for %: %', user_email, SQLERRM;
    profile_created := false;
  END;

  -- Check for pending invitations by email
  BEGIN
    SELECT * INTO existing_invitation
    FROM public.pending_invitations
    WHERE email = user_email 
    AND accepted_at IS NULL
    AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF FOUND THEN
      RAISE NOTICE 'Found pending invitation for: %', user_email;
      
      -- Create clinic membership
      INSERT INTO public.clinic_members (
        clinic_id, 
        user_id, 
        role, 
        created_at, 
        updated_at
      )
      VALUES (
        existing_invitation.clinic_id, 
        NEW.id, 
        existing_invitation.role, 
        NOW(), 
        NOW()
      )
      ON CONFLICT (clinic_id, user_id) DO UPDATE SET
        role = EXCLUDED.role,
        updated_at = NOW();
      
      -- Create doctor profile if role is doctor
      IF existing_invitation.role = 'doctor' THEN
        INSERT INTO public.doctors (
          user_id, 
          clinic_id, 
          name, 
          email, 
          phone, 
          is_active, 
          created_at, 
          updated_at
        )
        VALUES (
          NEW.id, 
          existing_invitation.clinic_id, 
          COALESCE(existing_invitation.name, split_part(user_email, '@', 1)),
          user_email, 
          existing_invitation.phone, 
          true, 
          NOW(), 
          NOW()
        )
        ON CONFLICT (user_id, clinic_id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          is_active = EXCLUDED.is_active,
          updated_at = NOW();
      END IF;
      
      -- Mark invitation as accepted
      UPDATE public.pending_invitations
      SET accepted_at = NOW(), updated_at = NOW()
      WHERE id = existing_invitation.id;
      
      RAISE NOTICE 'Created clinic membership for % as % in clinic %', 
                   user_email, existing_invitation.role, existing_invitation.clinic_id;
    ELSE
      RAISE NOTICE 'No pending invitation found for: %', user_email;
    END IF;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error processing invitation for %: %', user_email, SQLERRM;
  END;
  
  RETURN NEW;
  
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Critical error in handle_new_user for %: %', user_email, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.invite_user_by_email(TEXT, UUID, public.user_role, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated, service_role;

-- Ensure the trigger is set up correctly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();