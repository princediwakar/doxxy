alter table "public"."appointment_billing" drop constraint "appointment_billing_billing_type_check";

alter table "public"."monthly_billing_cycles" drop constraint "monthly_billing_cycles_payment_status_check";

alter table "public"."payment_transactions" drop constraint "payment_transactions_payment_status_check";

alter table "public"."payment_transactions" drop constraint "payment_transactions_transaction_type_check";

CREATE UNIQUE INDEX unique_email ON public.profiles USING btree (email);

alter table "public"."clinic_members" add constraint "fk_clinic_members_profiles" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."clinic_members" validate constraint "fk_clinic_members_profiles";

alter table "public"."doctors" add constraint "fk_doctors_profiles" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."doctors" validate constraint "fk_doctors_profiles";

alter table "public"."profiles" add constraint "unique_email" UNIQUE using index "unique_email";

alter table "public"."appointment_billing" add constraint "appointment_billing_billing_type_check" CHECK (((billing_type)::text = ANY ((ARRAY['credit_deduction'::character varying, 'monthly_billing'::character varying])::text[]))) not valid;

alter table "public"."appointment_billing" validate constraint "appointment_billing_billing_type_check";

alter table "public"."monthly_billing_cycles" add constraint "monthly_billing_cycles_payment_status_check" CHECK (((payment_status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'overdue'::character varying])::text[]))) not valid;

alter table "public"."monthly_billing_cycles" validate constraint "monthly_billing_cycles_payment_status_check";

alter table "public"."payment_transactions" add constraint "payment_transactions_payment_status_check" CHECK (((payment_status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying, 'refunded'::character varying])::text[]))) not valid;

alter table "public"."payment_transactions" validate constraint "payment_transactions_payment_status_check";

alter table "public"."payment_transactions" add constraint "payment_transactions_transaction_type_check" CHECK (((transaction_type)::text = ANY ((ARRAY['credit_purchase'::character varying, 'monthly_billing'::character varying])::text[]))) not valid;

alter table "public"."payment_transactions" validate constraint "payment_transactions_transaction_type_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.add_clinic_member(new_user_id uuid, target_clinic_id uuid, new_role user_role, new_department_id uuid DEFAULT NULL::uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  new_member_id UUID;
  member_data JSON;
BEGIN
  -- Validate user_id
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = new_user_id) THEN
    RAISE EXCEPTION 'User ID % does not exist in profiles', new_user_id;
  END IF;

  -- Validate clinic_id
  IF NOT EXISTS (SELECT 1 FROM clinics WHERE id = target_clinic_id) THEN
    RAISE EXCEPTION 'Clinic ID % does not exist', target_clinic_id;
  END IF;

  -- Validate department_id (if provided)
  IF new_department_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM clinic_departments WHERE id = new_department_id
  ) THEN
    RAISE EXCEPTION 'Department ID % does not exist', new_department_id;
  END IF;

  -- Insert or update clinic member
  INSERT INTO clinic_members (
    id,
    user_id,
    clinic_id,
    role,
    department_id,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    new_user_id,
    target_clinic_id,
    new_role,
    new_department_id,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id, clinic_id) DO UPDATE
  SET
    role = EXCLUDED.role,
    department_id = EXCLUDED.department_id,
    updated_at = NOW()
  RETURNING id INTO new_member_id;

  -- Fetch member data as JSON
  SELECT json_build_object(
    'id', cm.id,
    'user_id', cm.user_id,
    'clinic_id', cm.clinic_id,
    'role', cm.role,
    'department_id', cm.department_id,
    'created_at', cm.created_at,
    'updated_at', cm.updated_at
  ) INTO member_data
  FROM clinic_members cm
  WHERE cm.id = new_member_id;

  RETURN member_data;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to add or update clinic member: %', SQLERRM;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Check if a profile already exists for this email
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE email = NEW.email
  ) THEN
    -- Update existing profile with new auth user ID
    UPDATE profiles
    SET 
      id = NEW.id,
      name = COALESCE(NEW.raw_user_meta_data->>'full_name', profiles.name),
      updated_at = NOW()
    WHERE email = NEW.email;
  ELSE
    -- Create new profile
    INSERT INTO profiles (id, email, name, created_at, updated_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Pending User ' || NEW.id),
      NOW(),
      NOW()
    );
  END IF;

  -- Handle doctor role
  IF NEW.raw_user_meta_data->>'role' = 'doctor' THEN
    INSERT INTO doctors (user_id, clinic_id, name, email)
    SELECT 
      NEW.id,
      (NEW.raw_user_meta_data->>'clinic_id')::UUID,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Pending User ' || NEW.id),
      NEW.email
    FROM profiles p
    WHERE p.id = NEW.id
    ON CONFLICT (user_id, clinic_id) DO UPDATE
    SET 
      name = COALESCE(EXCLUDED.name, doctors.name),
      email = COALESCE(EXCLUDED.email, doctors.email),
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.invite_and_add_member(p_email text, p_name text, p_clinic_id uuid, p_role user_role, p_phone text DEFAULT NULL::text, p_department_id uuid DEFAULT NULL::uuid, p_availability text DEFAULT NULL::text, p_bio text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_auth_user_id UUID;
  v_user_id UUID;
  v_profile_data JSON;
  v_clinic_member_data JSON;
  v_doctor_data JSON;
  v_message TEXT;
BEGIN
  -- Check if user exists in auth.users
  SELECT id INTO v_auth_user_id
  FROM auth.users
  WHERE email = LOWER(p_email);

  IF v_auth_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % does not exist in auth.users', p_email;
  END IF;

  -- Check if user exists in profiles table
  SELECT id INTO v_user_id
  FROM profiles
  WHERE email = LOWER(p_email);

  -- If user doesn't exist in profiles, create a profile
  IF v_user_id IS NULL THEN
    INSERT INTO profiles (id, email, name, phone, created_at, updated_at)
    VALUES (
      v_auth_user_id,
      LOWER(p_email),
      p_name,
      p_phone,
      NOW(),
      NOW()
    )
    ON CONFLICT (email) DO UPDATE
    SET
      name = COALESCE(EXCLUDED.name, profiles.name),
      phone = COALESCE(EXCLUDED.phone, profiles.phone),
      updated_at = NOW()
    RETURNING id INTO v_user_id;
    
    v_message := 'New user profile created and added to clinic';
  ELSE
    -- Update existing profile if needed
    UPDATE profiles
    SET
      name = COALESCE(p_name, profiles.name),
      phone = COALESCE(p_phone, profiles.phone),
      updated_at = NOW()
    WHERE id = v_user_id;
    
    v_message := 'Existing user added to clinic';
  END IF;

  -- Validate clinic_id
  IF NOT EXISTS (SELECT 1 FROM clinics WHERE id = p_clinic_id) THEN
    RAISE EXCEPTION 'Clinic ID % does not exist', p_clinic_id;
  END IF;

  -- Validate department_id if provided
  IF p_department_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM clinic_departments WHERE id = p_department_id
  ) THEN
    RAISE EXCEPTION 'Department ID % does not exist', p_department_id;
  END IF;

  -- Add or update user in clinic_members
  INSERT INTO clinic_members (id, user_id, clinic_id, role, department_id, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    v_user_id,
    p_clinic_id,
    p_role,
    p_department_id,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id, clinic_id) DO UPDATE
  SET
    role = EXCLUDED.role,
    department_id = EXCLUDED.department_id,
    updated_at = NOW()
  RETURNING to_json(clinic_members.*) INTO v_clinic_member_data;

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
    ON CONFLICT (user_id, clinic_id) DO UPDATE
    SET
      name = EXCLUDED.name,
      email = LOWER(EXCLUDED.email),
      phone = EXCLUDED.phone,
      availability = EXCLUDED.availability,
      bio = EXCLUDED.bio,
      updated_at = NOW()
    RETURNING to_json(doctors.*) INTO v_doctor_data;
  END IF;

  -- Get profile data
  SELECT to_json(p.*) INTO v_profile_data
  FROM profiles p
  WHERE p.id = v_user_id;

  -- Return comprehensive result
  RETURN json_build_object(
    'user_id', v_user_id,
    'profile', v_profile_data,
    'clinic_member', v_clinic_member_data,
    'doctor', v_doctor_data,
    'message', v_message
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error in invite_and_add_member: %', SQLERRM;
END;
$function$
;


