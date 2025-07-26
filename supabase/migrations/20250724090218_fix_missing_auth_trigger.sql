-- Fix missing auth trigger in production database
-- This trigger is essential for processing invitations when users sign up

-- First ensure the handle_new_user function exists and is updated with correct field references
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
      RAISE NOTICE 'Found pending invitation for %: %', user_email, existing_invitation.id;
      
      -- Create clinic membership
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
      
      RAISE NOTICE 'Invitation processed successfully for % with role %', user_email, existing_invitation.role;
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

-- Add missing unique constraints if they don't exist
DO $$
BEGIN
    -- Add unique constraint for clinic_members if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'clinic_members_user_clinic_unique' 
        AND table_name = 'clinic_members'
    ) THEN
        ALTER TABLE public.clinic_members 
        ADD CONSTRAINT clinic_members_user_clinic_unique UNIQUE (user_id, clinic_id);
    END IF;

    -- Add unique constraint for doctors if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'doctors_user_clinic_unique' 
        AND table_name = 'doctors'
    ) THEN
        ALTER TABLE public.doctors 
        ADD CONSTRAINT doctors_user_clinic_unique UNIQUE (user_id, clinic_id);
    END IF;
END
$$;

-- Create the missing auth trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated, service_role;