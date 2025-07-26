-- Manual profile creation for mental.alternate@gmail.com
-- This is a direct approach to ensure everything is set up correctly

-- First, let's see what we have in auth.users
DO $$
DECLARE
  user_record auth.users%ROWTYPE;
  profile_exists BOOLEAN;
  clinic_membership_exists BOOLEAN;
  doctor_profile_exists BOOLEAN;
BEGIN
  -- Get user from auth.users
  SELECT * INTO user_record FROM auth.users WHERE email = 'mental.alternate@gmail.com';
  
  IF user_record.id IS NOT NULL THEN
    RAISE NOTICE 'Found user in auth.users: id=%, email=%, phone=%, metadata=%', 
      user_record.id, user_record.email, user_record.phone, user_record.raw_user_meta_data;
    
    -- Check if profile exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_record.id) INTO profile_exists;
    
    IF NOT profile_exists THEN
      -- Create profile
      INSERT INTO public.profiles (id, name, email, phone, created_at, updated_at)
      VALUES (
        user_record.id,
        COALESCE(user_record.raw_user_meta_data->>'name', 'Mental'),
        user_record.email,
        COALESCE(user_record.raw_user_meta_data->>'phone', user_record.phone),
        NOW(),
        NOW()
      );
      RAISE NOTICE 'Created profile for mental.alternate@gmail.com';
    ELSE
      RAISE NOTICE 'Profile already exists for mental.alternate@gmail.com';
    END IF;
    
    -- Check if clinic membership exists
    SELECT EXISTS(
      SELECT 1 FROM public.clinic_members 
      WHERE user_id = user_record.id 
      AND clinic_id = (user_record.raw_user_meta_data->>'clinic_id')::UUID
    ) INTO clinic_membership_exists;
    
    IF NOT clinic_membership_exists AND user_record.raw_user_meta_data->>'clinic_id' IS NOT NULL THEN
      -- Create clinic membership
      INSERT INTO public.clinic_members (clinic_id, user_id, role, department_id, created_at, updated_at)
      VALUES (
        (user_record.raw_user_meta_data->>'clinic_id')::UUID,
        user_record.id,
        (user_record.raw_user_meta_data->>'role')::user_role,
        NULL,
        NOW(),
        NOW()
      );
      RAISE NOTICE 'Created clinic membership for mental.alternate@gmail.com';
    ELSE
      RAISE NOTICE 'Clinic membership already exists or no clinic_id in metadata';
    END IF;
    
    -- Check if doctor profile exists (if role is doctor)
    IF user_record.raw_user_meta_data->>'role' = 'doctor' THEN
      SELECT EXISTS(
        SELECT 1 FROM public.doctors 
        WHERE user_id = user_record.id 
        AND clinic_id = (user_record.raw_user_meta_data->>'clinic_id')::UUID
      ) INTO doctor_profile_exists;
      
      IF NOT doctor_profile_exists THEN
        -- Create doctor profile
        INSERT INTO public.doctors (user_id, clinic_id, name, email, phone, is_active, created_at, updated_at)
        VALUES (
          user_record.id,
          (user_record.raw_user_meta_data->>'clinic_id')::UUID,
          COALESCE(user_record.raw_user_meta_data->>'name', 'Mental'),
          user_record.email,
          COALESCE(user_record.raw_user_meta_data->>'phone', user_record.phone),
          true,
          NOW(),
          NOW()
        );
        RAISE NOTICE 'Created doctor profile for mental.alternate@gmail.com';
      ELSE
        RAISE NOTICE 'Doctor profile already exists for mental.alternate@gmail.com';
      END IF;
    END IF;
    
    -- Mark any pending invitations as accepted
    UPDATE public.pending_invitations
    SET accepted_at = NOW(), updated_at = NOW()
    WHERE email = 'mental.alternate@gmail.com'
    AND accepted_at IS NULL;
    
    RAISE NOTICE 'Marked pending invitations as accepted for mental.alternate@gmail.com';
    
  ELSE
    RAISE NOTICE 'User mental.alternate@gmail.com not found in auth.users';
  END IF;
END $$;

-- Create a function to manually trigger profile creation for any user
CREATE OR REPLACE FUNCTION manual_profile_creation(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  user_record auth.users%ROWTYPE;
  result TEXT;
BEGIN
  -- Get user from auth.users
  SELECT * INTO user_record FROM auth.users WHERE email = user_email;
  
  IF user_record.id IS NOT NULL THEN
    -- Call the handle_new_user function manually
    PERFORM handle_new_user_manual(user_record);
    result := 'Profile creation completed for ' || user_email;
  ELSE
    result := 'User not found: ' || user_email;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to manually process a user
CREATE OR REPLACE FUNCTION handle_new_user_manual(user_record auth.users)
RETURNS VOID AS $$
DECLARE
  user_name TEXT;
  user_phone TEXT;
  clinic_id_from_metadata UUID;
  role_from_metadata TEXT;
  invitation_token_from_metadata UUID;
BEGIN
  -- Extract user name
  user_name := COALESCE(
    user_record.raw_user_meta_data->>'name',
    user_record.raw_user_meta_data->>'full_name',
    user_record.raw_user_meta_data->>'display_name',
    split_part(user_record.email, '@', 1)
  );
  
  -- Extract phone
  user_phone := COALESCE(
    user_record.phone,
    user_record.raw_user_meta_data->>'phone'
  );
  
  -- Extract metadata
  clinic_id_from_metadata := (user_record.raw_user_meta_data->>'clinic_id')::UUID;
  role_from_metadata := user_record.raw_user_meta_data->>'role';
  invitation_token_from_metadata := (user_record.raw_user_meta_data->>'invitation_token')::UUID;
  
  -- Create or update profile
  INSERT INTO public.profiles (id, name, email, phone, created_at, updated_at)
  VALUES (user_record.id, user_name, user_record.email, user_phone, user_record.created_at, user_record.updated_at)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    updated_at = NOW();
  
  -- Create clinic membership if metadata exists
  IF clinic_id_from_metadata IS NOT NULL AND role_from_metadata IS NOT NULL THEN
    INSERT INTO public.clinic_members (clinic_id, user_id, role, department_id, created_at, updated_at)
    VALUES (clinic_id_from_metadata, user_record.id, role_from_metadata::user_role, NULL, NOW(), NOW())
    ON CONFLICT (user_id, clinic_id) DO NOTHING;
    
    -- Create doctor profile if needed
    IF role_from_metadata = 'doctor' THEN
      INSERT INTO public.doctors (user_id, clinic_id, name, email, phone, is_active, created_at, updated_at)
      VALUES (user_record.id, clinic_id_from_metadata, user_name, user_record.email, user_phone, true, NOW(), NOW())
      ON CONFLICT (user_id, clinic_id) DO NOTHING;
    END IF;
    
    -- Mark invitation as accepted
    IF invitation_token_from_metadata IS NOT NULL THEN
      UPDATE public.pending_invitations
      SET accepted_at = NOW(), updated_at = NOW()
      WHERE invitation_token = invitation_token_from_metadata;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the manual profile creation
SELECT manual_profile_creation('mental.alternate@gmail.com') as result;