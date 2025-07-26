-- Fix display name extraction from Google OAuth metadata
-- This addresses the issue where user names are not being properly extracted

-- Enhanced handle_new_user function with better name extraction
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  invitation_record RECORD;
  user_name TEXT;
  user_phone TEXT;
  extracted_name TEXT;
BEGIN
  -- Enhanced name extraction from multiple sources
  extracted_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'given_name' || ' ' || NEW.raw_user_meta_data->>'family_name',
    NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name'
  );
  
  -- Clean up the name (remove extra spaces, handle nulls)
  IF extracted_name IS NOT NULL THEN
    user_name := trim(regexp_replace(extracted_name, '\s+', ' ', 'g'));
    -- If name is empty after cleaning, use email prefix
    IF user_name = '' OR user_name IS NULL THEN
      user_name := split_part(NEW.email, '@', 1);
    END IF;
  ELSE
    user_name := split_part(NEW.email, '@', 1);
  END IF;
  
  -- Extract phone number from various sources
  user_phone := COALESCE(
    NEW.phone,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'phoneNumber'
  );

  -- Log the extracted data for debugging
  RAISE NOTICE 'Creating profile for user %: name=%, phone=%, metadata=%', 
    NEW.email, user_name, user_phone, NEW.raw_user_meta_data;

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

      -- Update profile with invitation data if available and better than extracted data
      UPDATE public.profiles
      SET
        name = COALESCE(
          NULLIF(user_name, split_part(NEW.email, '@', 1)), -- Keep extracted name if it's not just email prefix
          invitation_record.name, -- Use invitation name if extracted name is just email
          user_name -- Fallback to extracted name
        ),
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
          COALESCE(
            NULLIF(user_name, split_part(NEW.email, '@', 1)),
            invitation_record.name,
            user_name
          ),
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

-- Recreate trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to fix existing users with empty display names
CREATE OR REPLACE FUNCTION fix_empty_display_names()
RETURNS INTEGER AS $$
DECLARE
  user_record RECORD;
  fixed_count INTEGER := 0;
  new_name TEXT;
BEGIN
  -- Find users with empty or null names
  FOR user_record IN 
    SELECT p.id, p.email, p.name, u.raw_user_meta_data
    FROM public.profiles p
    JOIN auth.users u ON p.id = u.id
    WHERE p.name IS NULL OR p.name = '' OR p.name = '-'
  LOOP
    -- Extract name from metadata
    new_name := COALESCE(
      user_record.raw_user_meta_data->>'full_name',
      user_record.raw_user_meta_data->>'name',
      user_record.raw_user_meta_data->>'display_name',
      user_record.raw_user_meta_data->>'given_name' || ' ' || user_record.raw_user_meta_data->>'family_name',
      user_record.raw_user_meta_data->>'first_name' || ' ' || user_record.raw_user_meta_data->>'last_name'
    );
    
    -- Clean up the name
    IF new_name IS NOT NULL THEN
      new_name := trim(regexp_replace(new_name, '\s+', ' ', 'g'));
      -- If name is empty after cleaning, use email prefix
      IF new_name = '' OR new_name IS NULL THEN
        new_name := split_part(user_record.email, '@', 1);
      END IF;
    ELSE
      new_name := split_part(user_record.email, '@', 1);
    END IF;
    
    -- Update the profile
    UPDATE public.profiles
    SET name = new_name, updated_at = NOW()
    WHERE id = user_record.id;
    
    fixed_count := fixed_count + 1;
    RAISE NOTICE 'Fixed display name for user %: % -> %', user_record.email, user_record.name, new_name;
  END LOOP;
  
  RETURN fixed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the fix function to update existing users
SELECT fix_empty_display_names() as users_fixed;

-- Create a function to manually update a specific user's display name
CREATE OR REPLACE FUNCTION update_user_display_name(user_email TEXT, new_display_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- Check if user exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE email = user_email) INTO user_exists;
  
  IF NOT user_exists THEN
    RAISE NOTICE 'User % not found', user_email;
    RETURN FALSE;
  END IF;
  
  -- Update the display name
  UPDATE public.profiles
  SET name = new_display_name, updated_at = NOW()
  WHERE email = user_email;
  
  RAISE NOTICE 'Updated display name for user % to %', user_email, new_display_name;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;