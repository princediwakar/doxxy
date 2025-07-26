-- Fix department_id handling in invitation system
-- This addresses the issue where invitations are created without department assignments

-- Drop old function first to avoid signature conflicts
DROP FUNCTION IF EXISTS public.invite_user_by_email(TEXT, UUID, public.user_role, TEXT, TEXT);

-- 1. Update invite_user_by_email RPC function to accept and store department_id
CREATE OR REPLACE FUNCTION public.invite_user_by_email(
  p_email TEXT,
  p_clinic_id UUID,
  p_role public.user_role DEFAULT 'staff',
  p_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_department_id UUID DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_invitation_id UUID;
  v_existing_user_id UUID;
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

  -- Insert or update pending invitation WITH department_id
  INSERT INTO public.pending_invitations (
    email,
    clinic_id,
    role,
    name,
    phone,
    department_id,
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
    p_department_id,
    NOW(),
    NOW(),
    NOW() + INTERVAL '30 days'
  )
  ON CONFLICT (email, clinic_id) 
  DO UPDATE SET
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    department_id = EXCLUDED.department_id,
    updated_at = NOW(),
    expires_at = NOW() + INTERVAL '30 days',
    accepted_at = NULL
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

-- 2. Update handle_new_user trigger to properly assign department_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
  user_phone TEXT;
  existing_invitation RECORD;
  profile_created BOOLEAN := false;
BEGIN
  -- Get user email
  user_email := LOWER(TRIM(COALESCE(NEW.email, '')));
  
  -- Skip processing if no email
  IF user_email = '' THEN
    RAISE NOTICE 'No email for user %, skipping invitation processing', NEW.id;
    RETURN NEW;
  END IF;

  -- Extract name from raw_user_meta_data (NOT user_metadata)
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    ''
  );
  
  -- Extract phone
  user_phone := COALESCE(
    NEW.raw_user_meta_data->>'phone'
  );

  -- Create basic profile
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
      user_name,
      user_email,
      user_phone,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      name = COALESCE(EXCLUDED.name, profiles.name),
      email = COALESCE(EXCLUDED.email, profiles.email),
      phone = COALESCE(EXCLUDED.phone, profiles.phone),
      updated_at = NOW();
      
    profile_created := true;
    RAISE NOTICE 'Profile created/updated for user: %', user_email;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to create profile for %: %', user_email, SQLERRM;
    profile_created := false;
  END;

  -- Process email-based invitations
  BEGIN
    -- Look for pending invitations
    SELECT * INTO existing_invitation
    FROM public.pending_invitations
    WHERE LOWER(TRIM(email)) = user_email
      AND accepted_at IS NULL
      AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY created_at DESC
    LIMIT 1;

    IF existing_invitation.id IS NOT NULL THEN
      RAISE NOTICE 'Found pending invitation for %: % with department_id: %', user_email, existing_invitation.id, existing_invitation.department_id;
      
      -- Create clinic membership WITH department_id
      INSERT INTO public.clinic_members (
        user_id,
        clinic_id,
        role,
        department_id,
        created_at,
        updated_at
      )
      VALUES (
        NEW.id,
        existing_invitation.clinic_id,
        existing_invitation.role,
        existing_invitation.department_id,
        NOW(),
        NOW()
      )
      ON CONFLICT (user_id, clinic_id) DO NOTHING;
      
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
          user_name,
          user_email,
          user_phone,
          true,
          NOW(),
          NOW()
        )
        ON CONFLICT (user_id, clinic_id) DO NOTHING;
        
        RAISE NOTICE 'Doctor profile created for %', user_email;
      END IF;
      
      -- Mark invitation as accepted
      UPDATE public.pending_invitations
      SET accepted_at = NOW(), updated_at = NOW()
      WHERE id = existing_invitation.id;
      
      RAISE NOTICE 'Invitation processed successfully for % with role % and department %', user_email, existing_invitation.role, existing_invitation.department_id;
    ELSE
      RAISE NOTICE 'No pending invitation found for %', user_email;
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
GRANT EXECUTE ON FUNCTION public.invite_user_by_email TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user TO anon, authenticated, service_role;