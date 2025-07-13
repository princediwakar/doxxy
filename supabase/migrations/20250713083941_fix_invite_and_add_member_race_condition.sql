-- Migration: Add invite_and_add_member RPC function
-- Date: 2025-01-13
-- Purpose: Fix 404 error for invite_and_add_member RPC function

-- RPC function to invite and add a member to a clinic
CREATE OR REPLACE FUNCTION invite_and_add_member(
  p_email TEXT,
  p_name TEXT,
  p_clinic_id UUID,
  p_role user_role,
  p_phone TEXT DEFAULT NULL,
  p_department_id UUID DEFAULT NULL,
  p_availability TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_profile_data JSON;
  v_clinic_member_data JSON;
  v_doctor_data JSON;
  v_message TEXT;
BEGIN
  -- Check if user exists in profiles table
  SELECT id INTO v_user_id
  FROM profiles
  WHERE email = LOWER(p_email);

  -- If user doesn't exist, create a profile
  IF v_user_id IS NULL THEN
    INSERT INTO profiles (id, email, name, phone, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      LOWER(p_email),
      p_name,
      p_phone,
      NOW(),
      NOW()
    )
    RETURNING id INTO v_user_id;
    
    v_message := 'New user profile created and added to clinic';
  ELSE
    v_message := 'Existing user added to clinic';
  END IF;

  -- Add or update user in clinic_members
  INSERT INTO clinic_members (id, user_id, clinic_id, role, department_id, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id, p_clinic_id, p_role, p_department_id, NOW(), NOW())
  ON CONFLICT (user_id, clinic_id)
  DO UPDATE SET
    role = p_role,
    department_id = p_department_id,
    updated_at = NOW();

  -- If role is doctor, create or update doctor profile
  IF p_role = 'doctor' THEN
    INSERT INTO doctors (id, user_id, clinic_id, name, email, phone, availability, bio, is_active, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      v_user_id,
      p_clinic_id,
      p_name,
      LOWER(p_email),
      p_phone,
      p_availability,
      p_bio,
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id, clinic_id)
    DO UPDATE SET
      name = p_name,
      email = LOWER(p_email),
      phone = p_phone,
      availability = p_availability,
      bio = p_bio,
      updated_at = NOW();
  END IF;

  -- Get profile data
  SELECT to_json(p.*) INTO v_profile_data
  FROM profiles p
  WHERE p.id = v_user_id;

  -- Get clinic member data
  SELECT to_json(cm.*) INTO v_clinic_member_data
  FROM clinic_members cm
  WHERE cm.user_id = v_user_id AND cm.clinic_id = p_clinic_id;

  -- Get doctor data if applicable
  IF p_role = 'doctor' THEN
    SELECT to_json(d.*) INTO v_doctor_data
    FROM doctors d
    WHERE d.user_id = v_user_id AND d.clinic_id = p_clinic_id;
  END IF;

  -- Return comprehensive result
  RETURN json_build_object(
    'user_id', v_user_id,
    'profile', v_profile_data,
    'clinic_member', v_clinic_member_data,
    'doctor', v_doctor_data,
    'message', v_message
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION invite_and_add_member(TEXT, TEXT, UUID, user_role, TEXT, UUID, TEXT, TEXT) TO authenticated;

 