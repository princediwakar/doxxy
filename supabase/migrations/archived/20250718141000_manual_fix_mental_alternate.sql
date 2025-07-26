-- Manual fix for mental.alternate@gmail.com display name issue
-- This addresses the specific user mentioned in the screenshot

-- First, let's check what data we have for this user
DO $$
DECLARE
  user_record RECORD;
  profile_record RECORD;
BEGIN
  -- Check auth.users table
  SELECT * INTO user_record FROM auth.users WHERE email = 'mental.alternate@gmail.com';
  
  IF user_record.id IS NOT NULL THEN
    RAISE NOTICE 'Found user in auth.users: id=%, email=%, metadata=%', 
      user_record.id, user_record.email, user_record.raw_user_meta_data;
    
    -- Check if profile exists
    SELECT * INTO profile_record FROM public.profiles WHERE id = user_record.id;
    
    IF profile_record.id IS NOT NULL THEN
      RAISE NOTICE 'Found profile: id=%, name=%, email=%, phone=%', 
        profile_record.id, profile_record.name, profile_record.email, profile_record.phone;
      
      -- Update the profile with a proper display name
      UPDATE public.profiles 
      SET 
        name = COALESCE(
          NULLIF(user_record.raw_user_meta_data->>'full_name', ''),
          NULLIF(user_record.raw_user_meta_data->>'name', ''),
          NULLIF(user_record.raw_user_meta_data->>'display_name', ''),
          'Mental Alternate'  -- Fallback name
        ),
        email = COALESCE(profile_record.email, user_record.email),
        phone = COALESCE(
          profile_record.phone,
          user_record.phone,
          user_record.raw_user_meta_data->>'phone'
        ),
        updated_at = NOW()
      WHERE id = user_record.id;
      
      RAISE NOTICE 'Updated profile for mental.alternate@gmail.com';
    ELSE
      RAISE NOTICE 'No profile found, creating one...';
      
      -- Create profile if it doesn't exist
      INSERT INTO public.profiles (id, name, email, phone, created_at, updated_at)
      VALUES (
        user_record.id,
        COALESCE(
          NULLIF(user_record.raw_user_meta_data->>'full_name', ''),
          NULLIF(user_record.raw_user_meta_data->>'name', ''),
          NULLIF(user_record.raw_user_meta_data->>'display_name', ''),
          'Mental Alternate'  -- Fallback name
        ),
        user_record.email,
        COALESCE(
          user_record.phone,
          user_record.raw_user_meta_data->>'phone'
        ),
        NOW(),
        NOW()
      );
      
      RAISE NOTICE 'Created profile for mental.alternate@gmail.com';
    END IF;
  ELSE
    RAISE NOTICE 'User mental.alternate@gmail.com not found in auth.users';
  END IF;
END $$;

-- Also run the general fix function to catch any other users
SELECT fix_empty_display_names() as additional_users_fixed;

-- Create a view to easily check user data
CREATE OR REPLACE VIEW user_profile_debug AS
SELECT 
  u.id,
  u.email,
  u.phone as auth_phone,
  u.raw_user_meta_data,
  p.name as profile_name,
  p.email as profile_email,
  p.phone as profile_phone,
  p.created_at as profile_created,
  p.updated_at as profile_updated
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Check the current state
SELECT 
  email,
  profile_name,
  profile_email,
  profile_phone,
  raw_user_meta_data->>'name' as oauth_name,
  raw_user_meta_data->>'full_name' as oauth_full_name,
  raw_user_meta_data->>'display_name' as oauth_display_name
FROM user_profile_debug 
WHERE email = 'mental.alternate@gmail.com';

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Display name fix completed for mental.alternate@gmail.com';
END $$;