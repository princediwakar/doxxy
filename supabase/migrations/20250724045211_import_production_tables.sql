-- Import essential tables from production schema
-- This ensures local and production databases have the same structure

-- User role enum
DO $$ BEGIN
    CREATE TYPE "public"."user_role" AS ENUM ('doctor', 'staff', 'superadmin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Core tables that match production exactly

-- Profiles table
CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "email" "text",
    "phone" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT "now"()
);

-- Clinics table
CREATE TABLE IF NOT EXISTS "public"."clinics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "address" "text",
    "phone" "text",
    "email" "text",
    "website" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT "now"()
);

-- Department types table
CREATE TABLE IF NOT EXISTS "public"."department_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT "now"()
);

-- Clinic departments table (production version)
CREATE TABLE IF NOT EXISTS "public"."clinic_departments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "department_type_id" "uuid" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT "now"()
);

-- Departments table (also exists in production)
CREATE TABLE IF NOT EXISTS "public"."departments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "department_type_id" "uuid" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

-- Clinic members table
CREATE TABLE IF NOT EXISTS "public"."clinic_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "role" "public"."user_role" DEFAULT 'staff' NOT NULL,
    "department_id" "uuid",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT "now"()
);

-- Doctors table
CREATE TABLE IF NOT EXISTS "public"."doctors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "specialization" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT "now"()
);

-- Pending invitations table
CREATE TABLE IF NOT EXISTS "public"."pending_invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "role" "public"."user_role" NOT NULL,
    "name" "text",
    "phone" "text",
    "department_id" "uuid",
    "invited_by" "uuid",
    "invitation_token" "text",
    "expires_at" timestamp with time zone,
    "accepted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT "now"()
);

-- Primary keys
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");
ALTER TABLE "public"."clinics" ADD CONSTRAINT "clinics_pkey" PRIMARY KEY ("id");
ALTER TABLE "public"."department_types" ADD CONSTRAINT "department_types_pkey" PRIMARY KEY ("id");
ALTER TABLE "public"."clinic_departments" ADD CONSTRAINT "clinic_departments_pkey" PRIMARY KEY ("id");
ALTER TABLE "public"."departments" ADD CONSTRAINT "departments_pkey" PRIMARY KEY ("id");
ALTER TABLE "public"."clinic_members" ADD CONSTRAINT "clinic_members_pkey" PRIMARY KEY ("id");
ALTER TABLE "public"."doctors" ADD CONSTRAINT "doctors_pkey" PRIMARY KEY ("id");
ALTER TABLE "public"."pending_invitations" ADD CONSTRAINT "pending_invitations_pkey" PRIMARY KEY ("id");

-- Foreign key constraints
ALTER TABLE "public"."clinic_departments" 
ADD CONSTRAINT "clinic_departments_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;

ALTER TABLE "public"."clinic_departments" 
ADD CONSTRAINT "clinic_departments_department_type_id_fkey" FOREIGN KEY ("department_type_id") REFERENCES "public"."department_types"("id") ON DELETE CASCADE;

ALTER TABLE "public"."departments" 
ADD CONSTRAINT "departments_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;

ALTER TABLE "public"."departments" 
ADD CONSTRAINT "departments_department_type_id_fkey" FOREIGN KEY ("department_type_id") REFERENCES "public"."department_types"("id") ON DELETE CASCADE;

ALTER TABLE "public"."clinic_members" 
ADD CONSTRAINT "clinic_members_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;

ALTER TABLE "public"."clinic_members" 
ADD CONSTRAINT "clinic_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

ALTER TABLE "public"."clinic_members" 
ADD CONSTRAINT "clinic_members_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."clinic_departments"("id") ON DELETE SET NULL;

ALTER TABLE "public"."doctors" 
ADD CONSTRAINT "doctors_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;

ALTER TABLE "public"."doctors" 
ADD CONSTRAINT "doctors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

ALTER TABLE "public"."pending_invitations" 
ADD CONSTRAINT "pending_invitations_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;

-- Essential RPC functions
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
    NOW() + INTERVAL '30 days'
  )
  ON CONFLICT (email, clinic_id) 
  DO UPDATE SET
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
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

-- Unique constraints
ALTER TABLE "public"."pending_invitations" 
ADD CONSTRAINT "pending_invitations_email_clinic_id_key" UNIQUE ("email", "clinic_id");

-- Add unique constraints for clinic_members and doctors to support ON CONFLICT
ALTER TABLE "public"."clinic_members" 
ADD CONSTRAINT "clinic_members_user_clinic_unique" UNIQUE ("user_id", "clinic_id");

ALTER TABLE "public"."doctors" 
ADD CONSTRAINT "doctors_user_clinic_unique" UNIQUE ("user_id", "clinic_id");

-- Set table owners
ALTER TABLE "public"."profiles" OWNER TO "postgres";
ALTER TABLE "public"."clinics" OWNER TO "postgres";
ALTER TABLE "public"."department_types" OWNER TO "postgres";
ALTER TABLE "public"."clinic_departments" OWNER TO "postgres";
ALTER TABLE "public"."departments" OWNER TO "postgres";
ALTER TABLE "public"."clinic_members" OWNER TO "postgres";
ALTER TABLE "public"."doctors" OWNER TO "postgres";
ALTER TABLE "public"."pending_invitations" OWNER TO "postgres";

-- Grant permissions
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."clinics" TO "authenticated";
GRANT ALL ON TABLE "public"."department_types" TO "authenticated";
GRANT ALL ON TABLE "public"."clinic_departments" TO "authenticated";
GRANT ALL ON TABLE "public"."departments" TO "authenticated";
GRANT ALL ON TABLE "public"."clinic_members" TO "authenticated";
GRANT ALL ON TABLE "public"."doctors" TO "authenticated";
GRANT ALL ON TABLE "public"."pending_invitations" TO "authenticated";

GRANT EXECUTE ON FUNCTION public.invite_user_by_email TO "authenticated";

-- Essential handle_new_user trigger for processing invitations
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

  -- Extract name from raw_user_meta_data
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

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated, service_role;