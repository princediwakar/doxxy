-- Final fix for mental.alternate@gmail.com with proper type casting

-- Step 1: Add to clinic_members if not already there
INSERT INTO public.clinic_members (clinic_id, user_id, role, department_id, created_at, updated_at)
SELECT 
  (u.raw_user_meta_data->>'clinic_id')::UUID as clinic_id,
  u.id as user_id,
  (u.raw_user_meta_data->>'role')::user_role as role,
  NULL as department_id,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users u
WHERE u.email = 'mental.alternate@gmail.com'
AND (u.raw_user_meta_data->>'clinic_id') IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.clinic_members cm 
  WHERE cm.user_id = u.id 
  AND cm.clinic_id = (u.raw_user_meta_data->>'clinic_id')::UUID
);

-- Step 2: Add to doctors table since role is 'doctor'
INSERT INTO public.doctors (user_id, clinic_id, name, email, phone, is_active, created_at, updated_at)
SELECT 
  u.id as user_id,
  (u.raw_user_meta_data->>'clinic_id')::UUID as clinic_id,
  COALESCE(u.raw_user_meta_data->>'name', 'Mental') as name,
  u.email,
  u.raw_user_meta_data->>'phone' as phone,
  true as is_active,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users u
WHERE u.email = 'mental.alternate@gmail.com'
AND (u.raw_user_meta_data->>'role') = 'doctor'
AND NOT EXISTS (
  SELECT 1 FROM public.doctors d 
  WHERE d.user_id = u.id 
  AND d.clinic_id = (u.raw_user_meta_data->>'clinic_id')::UUID
);

-- Step 3: Mark invitation as accepted (with proper type casting)
UPDATE public.pending_invitations
SET accepted_at = NOW(), updated_at = NOW()
WHERE invitation_token::text = (
  SELECT u.raw_user_meta_data->>'invitation_token'
  FROM auth.users u
  WHERE u.email = 'mental.alternate@gmail.com'
)
AND accepted_at IS NULL;

-- Step 4: Create the bulletproof handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  invitation_record RECORD;
  user_name TEXT;
  user_phone TEXT;
  extracted_name TEXT;
  clinic_id_from_metadata UUID;
  role_from_metadata TEXT;
  invitation_token_from_metadata UUID;
BEGIN
  -- Extract user information from various sources
  extracted_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'given_name' || ' ' || NEW.raw_user_meta_data->>'family_name',
    NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name'
  );
  
  -- Clean up the name
  IF extracted_name IS NOT NULL THEN
    user_name := trim(regexp_replace(extracted_name, '\s+', ' ', 'g'));
    IF user_name = '' OR user_name IS NULL THEN
      user_name := split_part(NEW.email, '@', 1);
    END IF;
  ELSE
    user_name := split_part(NEW.email, '@', 1);
  END IF;
  
  -- Extract phone number
  user_phone := COALESCE(
    NEW.phone,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'phone_number'
  );

  -- Extract invitation data from metadata
  clinic_id_from_metadata := CASE 
    WHEN NEW.raw_user_meta_data->>'clinic_id' IS NOT NULL 
    THEN (NEW.raw_user_meta_data->>'clinic_id')::UUID
    ELSE NULL
  END;
  
  role_from_metadata := NEW.raw_user_meta_data->>'role';
  
  invitation_token_from_metadata := CASE 
    WHEN NEW.raw_user_meta_data->>'invitation_token' IS NOT NULL 
    THEN (NEW.raw_user_meta_data->>'invitation_token')::UUID
    ELSE NULL
  END;

  -- Create profile
  INSERT INTO public.profiles (id, name, email, phone, created_at, updated_at)
  VALUES (NEW.id, user_name, NEW.email, user_phone, NEW.created_at, NEW.updated_at);

  -- Handle invitation processing with bulletproof error handling
  BEGIN
    -- First try metadata approach (for direct invitation signups)
    IF clinic_id_from_metadata IS NOT NULL AND role_from_metadata IS NOT NULL THEN
      -- Create clinic membership
      INSERT INTO public.clinic_members (clinic_id, user_id, role, department_id, created_at, updated_at)
      VALUES (clinic_id_from_metadata, NEW.id, role_from_metadata::user_role, NULL, NOW(), NOW());

      -- Add to doctors table if needed
      IF role_from_metadata = 'doctor' THEN
        INSERT INTO public.doctors (user_id, clinic_id, name, email, phone, is_active, created_at, updated_at)
        VALUES (NEW.id, clinic_id_from_metadata, user_name, NEW.email, user_phone, true, NOW(), NOW());
      END IF;

      -- Mark invitation as accepted
      IF invitation_token_from_metadata IS NOT NULL THEN
        UPDATE public.pending_invitations
        SET accepted_at = NOW(), updated_at = NOW()
        WHERE invitation_token = invitation_token_from_metadata;
      END IF;

    ELSE
      -- Fallback to pending_invitations lookup
      SELECT * INTO invitation_record
      FROM public.pending_invitations
      WHERE email = NEW.email AND accepted_at IS NULL
      ORDER BY created_at DESC LIMIT 1;

      IF invitation_record.id IS NOT NULL THEN
        -- Create clinic membership
        INSERT INTO public.clinic_members (clinic_id, user_id, role, department_id, created_at, updated_at)
        VALUES (invitation_record.clinic_id, NEW.id, invitation_record.role, invitation_record.department_id, NOW(), NOW());

        -- Update profile with invitation data
        UPDATE public.profiles
        SET name = COALESCE(NULLIF(user_name, split_part(NEW.email, '@', 1)), invitation_record.name, user_name),
            phone = COALESCE(user_phone, invitation_record.phone),
            updated_at = NOW()
        WHERE id = NEW.id;

        -- Mark invitation as accepted
        UPDATE public.pending_invitations
        SET accepted_at = NOW(), updated_at = NOW()
        WHERE id = invitation_record.id;

        -- Add to doctors table if needed
        IF invitation_record.role = 'doctor' THEN
          INSERT INTO public.doctors (user_id, clinic_id, name, email, phone, is_active, created_at, updated_at)
          VALUES (NEW.id, invitation_record.clinic_id, user_name, NEW.email, user_phone, true, NOW(), NOW());
        END IF;
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

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();