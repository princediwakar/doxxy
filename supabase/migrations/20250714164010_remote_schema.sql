

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;




ALTER SCHEMA "public" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."appointment_status" AS ENUM (
    'Scheduled',
    'In Progress',
    'Completed',
    'Cancelled'
);


ALTER TYPE "public"."appointment_status" OWNER TO "postgres";


CREATE TYPE "public"."appointment_type" AS ENUM (
    'Walk-in',
    'Digital'
);


ALTER TYPE "public"."appointment_type" OWNER TO "postgres";


CREATE TYPE "public"."bill_status" AS ENUM (
    'Paid',
    'Pending',
    'Overdue'
);


ALTER TYPE "public"."bill_status" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'staff',
    'doctor',
    'superadmin'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_clinic_credits"("clinic_id_param" "uuid", "credits_to_add" integer, "transaction_id_param" "uuid" DEFAULT NULL::"uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Insert or update clinic credits
  INSERT INTO clinic_credits (
    clinic_id,
    credit_balance,
    total_credits_purchased,
    total_credits_used,
    updated_at
  ) VALUES (
    clinic_id_param,
    credits_to_add,
    credits_to_add,
    0,
    NOW()
  )
  ON CONFLICT (clinic_id) 
  DO UPDATE SET
    credit_balance = clinic_credits.credit_balance + credits_to_add,
    total_credits_purchased = clinic_credits.total_credits_purchased + credits_to_add,
    updated_at = NOW();

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;


ALTER FUNCTION "public"."add_clinic_credits"("clinic_id_param" "uuid", "credits_to_add" integer, "transaction_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_clinic_credits"("p_clinic_id" "uuid", "p_credits" integer, "p_payment_id" "text" DEFAULT NULL::"text", "p_order_id" "text" DEFAULT NULL::"text") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_current_credits INTEGER := 0;
  v_new_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT COALESCE(credits_balance, 0) INTO v_current_credits
  FROM clinics
  WHERE id = p_clinic_id;

  -- Calculate new credits
  v_new_credits := v_current_credits + p_credits;

  -- Update clinic credits
  UPDATE clinics
  SET 
    credits_balance = v_new_credits,
    updated_at = NOW()
  WHERE id = p_clinic_id;

  -- Insert credit transaction record (if table exists)
  BEGIN
    INSERT INTO credit_transactions (
      id, clinic_id, amount, transaction_type, payment_id, order_id, created_at
    )
    VALUES (
      gen_random_uuid(),
      p_clinic_id,
      p_credits,
      'purchase',
      p_payment_id,
      p_order_id,
      NOW()
    );
  EXCEPTION
    WHEN undefined_table THEN
      -- Table doesn't exist, skip transaction logging
      NULL;
  END;

  -- Return result
  RETURN json_build_object(
    'clinic_id', p_clinic_id,
    'previous_credits', v_current_credits,
    'credits_added', p_credits,
    'new_balance', v_new_credits,
    'payment_id', p_payment_id,
    'order_id', p_order_id
  );
END;
$$;


ALTER FUNCTION "public"."add_clinic_credits"("p_clinic_id" "uuid", "p_credits" integer, "p_payment_id" "text", "p_order_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_clinic_member"("new_user_id" "text", "target_clinic_id" "text", "new_role" "public"."user_role", "new_department_id" "text") RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$  
DECLARE
    new_member_id UUID;
    member_data JSON;
BEGIN
    -- Validate user_id
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = new_user_id) THEN
        RAISE EXCEPTION 'User ID % does not exist', new_user_id;
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
    BEGIN
        INSERT INTO clinic_members (
            user_id,
            clinic_id,
            role,
            department_id
        ) VALUES (
            new_user_id,
            target_clinic_id,
            new_role,
            new_department_id
        )
        ON CONFLICT (user_id, clinic_id)
        DO UPDATE SET
            role = EXCLUDED.role,
            department_id = EXCLUDED.department_id,
            updated_at = now()
        RETURNING id INTO new_member_id;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to add or update member: %', SQLERRM;
    END;

    -- Fetch member data as JSON
    SELECT json_build_object(
        'id', cm.id,
        'role', cm.role,
        'department_id', cm.department_id
    ) INTO member_data
    FROM clinic_members cm
    WHERE cm.id = new_member_id;

    RETURN member_data;
END;
  $$;


ALTER FUNCTION "public"."add_clinic_member"("new_user_id" "text", "target_clinic_id" "text", "new_role" "public"."user_role", "new_department_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_clinic_with_admin"("clinic_name" "text", "user_phone" "text" DEFAULT NULL::"text") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  clinic_id uuid;
  user_id uuid;
  result JSON;
BEGIN
  -- Get the current user ID
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Insert the clinic
  INSERT INTO clinics (name)
  VALUES (clinic_name)
  RETURNING id INTO clinic_id;

  -- Add the user as a clinic member with superadmin role
  INSERT INTO clinic_members (user_id, clinic_id, role)
  VALUES (user_id, clinic_id, 'superadmin');

  -- Create initial credit record with 100 free credits for new clinic
  INSERT INTO clinic_credits (
    clinic_id, 
    credit_balance, 
    total_credits_purchased, 
    total_credits_used
  )
  VALUES (
    clinic_id, 
    100,  -- 100 free credits
    100,  -- Count as purchased for accounting
    0     -- No credits used yet
  );

  -- Create a transaction record for the free credits
  INSERT INTO payment_transactions (
    clinic_id,
    transaction_type,
    amount,
    currency,
    credits_purchased,
    payment_status,
    payment_method,
    metadata
  )
  VALUES (
    clinic_id,
    'credit_purchase',
    0.00,  -- Free credits
    'INR',
    100,   -- 100 credits
    'completed',
    'free_credits',
    json_build_object(
      'type', 'welcome_bonus',
      'description', 'Free credits for new clinic',
      'automated', true
    )
  );

  -- Update user phone if provided
  IF user_phone IS NOT NULL THEN
    UPDATE auth.users 
    SET phone = user_phone 
    WHERE id = user_id;
  END IF;

  -- Return the clinic ID
  result := json_build_object('clinic_id', clinic_id);
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."create_clinic_with_admin"("clinic_name" "text", "user_phone" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_consultation"("p_patient_id" "uuid", "p_appointment_id" "uuid", "p_chief_complaint" "text", "p_history_present_illness" "text", "p_physical_examination" "text", "p_assessment_diagnosis" "text", "p_plan_treatment" "text", "p_prescriptions" "jsonb" DEFAULT '[]'::"jsonb", "p_notes" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  new_consultation_id UUID;
BEGIN
  -- Verify user has access to this patient's clinic and is a doctor
  IF NOT EXISTS (
    SELECT 1 FROM patients p
    JOIN clinic_members cm ON cm.clinic_id = p.clinic_id
    WHERE p.id = p_patient_id 
    AND cm.user_id = auth.uid()
    AND cm.role = 'doctor'
  ) THEN
    RAISE EXCEPTION 'Permission denied: only doctors can create consultations';
  END IF;

  INSERT INTO consultations (
    patient_id,
    appointment_id,
    chief_complaint,
    history_present_illness,
    physical_examination,
    assessment_diagnosis,
    plan_treatment,
    prescriptions,
    notes
  ) VALUES (
    p_patient_id,
    p_appointment_id,
    p_chief_complaint,
    p_history_present_illness,
    p_physical_examination,
    p_assessment_diagnosis,
    p_plan_treatment,
    p_prescriptions,
    p_notes
  )
  RETURNING id INTO new_consultation_id;

  RETURN new_consultation_id;
END;
$$;


ALTER FUNCTION "public"."create_consultation"("p_patient_id" "uuid", "p_appointment_id" "uuid", "p_chief_complaint" "text", "p_history_present_illness" "text", "p_physical_examination" "text", "p_assessment_diagnosis" "text", "p_plan_treatment" "text", "p_prescriptions" "jsonb", "p_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_doctor_profile"("p_user_id" "uuid", "p_clinic_id" "uuid", "p_name" "text", "p_email" "text", "p_primary_specialization" "text" DEFAULT NULL::"text", "p_consultation_fee" numeric DEFAULT NULL::numeric, "p_availability" "jsonb" DEFAULT NULL::"jsonb", "p_bio" "text" DEFAULT NULL::"text", "p_department_id" "uuid" DEFAULT NULL::"uuid") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    new_doctor_id UUID;
    user_profile profiles%ROWTYPE;
BEGIN
    -- Validate required parameters
    IF p_user_id IS NULL OR p_clinic_id IS NULL THEN
        RAISE EXCEPTION 'Missing required parameters: p_user_id and p_clinic_id cannot be NULL';
    END IF;

    -- Get user profile information
    SELECT * INTO user_profile FROM profiles WHERE id = p_user_id;
    
    -- If no profile exists, ensure p_name and p_email are provided
    IF NOT FOUND THEN
        IF p_name IS NULL OR p_email IS NULL THEN
            RAISE EXCEPTION 'Profile not found for user_id %, and p_name or p_email is missing', p_user_id;
        END IF;
        user_profile.name := p_name;
        user_profile.email := p_email;
    END IF;
    
    -- Ensure user is a member of the clinic with role 'doctor'
    INSERT INTO clinic_members (user_id, clinic_id, role, department_id)
    VALUES (p_user_id, p_clinic_id, 'doctor', p_department_id)
    ON CONFLICT (user_id, clinic_id)
    DO UPDATE SET 
        role = EXCLUDED.role,
        department_id = EXCLUDED.department_id
    WHERE clinic_members.role != 'superadmin'; -- Preserve superadmin role

    -- Check if doctor profile already exists
    SELECT id INTO new_doctor_id
    FROM doctors
    WHERE user_id = p_user_id AND clinic_id = p_clinic_id;
    
    IF FOUND THEN
        RAISE NOTICE 'Doctor profile already exists for user_id % in clinic_id %', p_user_id, p_clinic_id;
        RETURN new_doctor_id;
    END IF;
    
    -- Create doctor profile
    INSERT INTO doctors (
        user_id,
        clinic_id,
        name,
        email,
        primary_specialization,
        consultation_fee,
        availability,
        bio,
        is_active
    ) VALUES (
        p_user_id,
        p_clinic_id,
        COALESCE(p_name, user_profile.name),
        COALESCE(p_email, user_profile.email),
        p_primary_specialization,
        p_consultation_fee,
        p_availability,
        p_bio,
        true
    ) RETURNING id INTO new_doctor_id;
    
    RETURN new_doctor_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create doctor profile for user_id % in clinic_id %: %', 
            p_user_id, p_clinic_id, SQLERRM;
END;
$$;


ALTER FUNCTION "public"."create_doctor_profile"("p_user_id" "uuid", "p_clinic_id" "uuid", "p_name" "text", "p_email" "text", "p_primary_specialization" "text", "p_consultation_fee" numeric, "p_availability" "jsonb", "p_bio" "text", "p_department_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_patient"("p_clinic_id" "uuid", "p_name" "text", "p_phone" "text", "p_email" "text", "p_medical_id" "text", "p_gender" "text", "p_address" "text", "p_date_of_birth" "date") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  new_patient_id UUID;
BEGIN
  -- Verify user has access to this clinic
  IF NOT EXISTS (
    SELECT 1 FROM clinic_members
    WHERE clinic_id = p_clinic_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Permission denied: cannot create patient in this clinic';
  END IF;

  INSERT INTO patients (
    clinic_id,
    name,
    phone,
    email,
    medical_id,
    gender,
    address,
    date_of_birth
  ) VALUES (
    p_clinic_id,
    p_name,
    p_phone,
    p_email,
    p_medical_id,
    p_gender,
    p_address,
    p_date_of_birth
  )
  RETURNING id INTO new_patient_id;

  RETURN new_patient_id;
END;
$$;


ALTER FUNCTION "public"."create_patient"("p_clinic_id" "uuid", "p_name" "text", "p_phone" "text", "p_email" "text", "p_medical_id" "text", "p_gender" "text", "p_address" "text", "p_date_of_birth" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_profile_for_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(
      (NEW.raw_user_meta_data->>'name')::text,
      (NEW.raw_user_meta_data->>'full_name')::text,
      NEW.email
    )
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    email = EXCLUDED.email,
    name = EXCLUDED.name
  WHERE profiles.name IS NULL;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_profile_for_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."deduct_appointment_credit"("appointment_id_param" "uuid", "clinic_id_param" "uuid", "credits_to_deduct" integer DEFAULT 1) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    current_balance INTEGER;
    new_balance INTEGER;
BEGIN
    -- Get current credit balance
    SELECT credit_balance INTO current_balance
    FROM clinic_credits
    WHERE clinic_id = clinic_id_param;
    
    -- If no credits record exists, return false
    IF current_balance IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if sufficient credits available
    IF current_balance < credits_to_deduct THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate new balance
    new_balance := current_balance - credits_to_deduct;
    
    -- Update clinic credits
    UPDATE clinic_credits
    SET 
        credit_balance = new_balance,
        total_credits_used = total_credits_used + credits_to_deduct,
        updated_at = CURRENT_TIMESTAMP
    WHERE clinic_id = clinic_id_param;
    
    -- Create appointment billing record
    INSERT INTO appointment_billing (
        appointment_id,
        clinic_id,
        billing_type,
        amount,
        credits_used
    ) VALUES (
        appointment_id_param,
        clinic_id_param,
        'credit_deduction',
        10.00,
        credits_to_deduct
    );
    
    RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."deduct_appointment_credit"("appointment_id_param" "uuid", "clinic_id_param" "uuid", "credits_to_deduct" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_consultation"("p_consultation_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Verify user has access to this consultation's clinic and is a doctor or superadmin
  IF NOT EXISTS (
    SELECT 1 FROM consultations c
    JOIN patients p ON p.id = c.patient_id
    JOIN clinic_members cm ON cm.clinic_id = p.clinic_id
    WHERE c.id = p_consultation_id 
    AND cm.user_id = auth.uid()
    AND (cm.role = 'doctor' OR cm.role = 'superadmin')
  ) THEN
    RAISE EXCEPTION 'Permission denied: only doctors or superadmins can delete consultations';
  END IF;

  DELETE FROM consultations WHERE id = p_consultation_id;
  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."delete_consultation"("p_consultation_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_patient"("p_patient_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Verify user has access to this patient's clinic and is a superadmin
  IF NOT EXISTS (
    SELECT 1 FROM patients p
    JOIN clinic_members cm ON cm.clinic_id = p.clinic_id
    WHERE p.id = p_patient_id 
    AND cm.user_id = auth.uid()
    AND cm.role = 'superadmin'
  ) THEN
    RAISE EXCEPTION 'Permission denied: only clinic superadmins can delete patients';
  END IF;

  DELETE FROM patients WHERE id = p_patient_id;
  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."delete_patient"("p_patient_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_doctor_has_clinic_member"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Ensure that when a doctor is created, there's a corresponding clinic_member record
    IF TG_OP = 'INSERT' THEN
        -- Check if clinic member already exists
        IF NOT EXISTS (
            SELECT 1 FROM clinic_members cm
            WHERE cm.user_id = NEW.user_id AND cm.clinic_id = NEW.clinic_id
        ) THEN
            -- Create clinic member record with doctor role
            INSERT INTO clinic_members (user_id, clinic_id, role)
            VALUES (NEW.user_id, NEW.clinic_id, 'doctor')
            ON CONFLICT (user_id, clinic_id) DO NOTHING;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."ensure_doctor_has_clinic_member"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_clinic_slug"("clinic_name" "text", "clinic_id" "uuid" DEFAULT NULL::"uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
  existing_count integer;
BEGIN
  -- Convert clinic name to slug format
  base_slug := lower(trim(clinic_name));
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  -- Ensure minimum length
  IF length(base_slug) < 3 THEN
    base_slug := base_slug || '-clinic';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for existing slugs and increment if needed
  LOOP
    SELECT COUNT(*) INTO existing_count 
    FROM clinics 
    WHERE slug = final_slug 
    AND (clinic_id IS NULL OR id != clinic_id);
    
    IF existing_count = 0 THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;


ALTER FUNCTION "public"."generate_clinic_slug"("clinic_name" "text", "clinic_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_invoice_number"("clinic_id_arg" "uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  clinic_name TEXT;
  latest_invoice TEXT;
  next_number INTEGER;
  prefix TEXT;
  current_year TEXT := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
BEGIN
  -- Lock the bills table to prevent concurrent invoice number generation
  PERFORM 1 FROM bills WHERE clinic_id = clinic_id_arg FOR UPDATE;

  -- Get clinic name
  SELECT name INTO clinic_name FROM clinics WHERE id = clinic_id_arg;
  IF clinic_name IS NULL THEN
    RAISE EXCEPTION 'Clinic not found for ID %', clinic_id_arg;
  END IF;

  -- Create prefix with first letter of clinic name and current year
  prefix := UPPER(SUBSTRING(clinic_name FROM 1 FOR 1)) || '' || current_year || '';

  -- Get the latest invoice number for the clinic
  SELECT invoice_number INTO latest_invoice
  FROM bills
  WHERE clinic_id = clinic_id_arg
  AND invoice_number LIKE prefix || '%'
  ORDER BY created_at DESC
  LIMIT 1;

  -- Extract the numeric part or start at 1
  IF latest_invoice IS NULL THEN
    next_number := 1;
  ELSE
    next_number := CAST(REGEXP_REPLACE(latest_invoice, '[^0-9]', '') AS INTEGER) + 1;
  END IF;

  -- Return formatted invoice number (e.g., C-2025-000001)
  RETURN prefix || LPAD(next_number::TEXT, 6, '0');
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback to a temporary unique number based on timestamp and random
    RETURN 'TEMP-' || current_year || '-' || LPAD(FLOOR(EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000 + RANDOM() * 1000)::INTEGER::TEXT, 10, '0');
END;
$$;


ALTER FUNCTION "public"."generate_invoice_number"("clinic_id_arg" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_appointments_with_details_by_clinic"("clinic_id" "uuid") RETURNS TABLE("id" "text", "patient_id" "text", "doctor_id" "text", "date" "text", "time" "text", "type" "public"."appointment_type", "status" "public"."appointment_status", "notes" "text", "created_at" "text", "patient_name" "text", "doctor_name" "text", "department_name" "text", "billing_status" "text", "doctor_user_id" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id::text,
    a.patient_id::text,
    a.doctor_id::text,
    a.date::text,
    a."time"::text,
    a.type,
    a.status,
    a.notes,
    a.created_at::text,
    p.name AS patient_name,
    COALESCE(d.name, prof.name) AS doctor_name,
    COALESCE(dt.name, 'General') AS department_name,
    COALESCE(
      CASE 
        WHEN b.status = 'Paid'::bill_status THEN 'Paid'
        WHEN b.status = 'Overdue'::bill_status THEN 'Overdue'
        WHEN b.status = 'Pending'::bill_status THEN 'Pending'
        ELSE 'Pending'
      END,
      'Pending'
    ) AS billing_status,
    d.user_id::text
  FROM appointments a
  LEFT JOIN patients p ON a.patient_id = p.id
  LEFT JOIN doctors d ON a.doctor_id = d.id
  LEFT JOIN profiles prof ON d.user_id = prof.id
  LEFT JOIN clinic_members cm ON d.user_id = cm.user_id AND a.clinic_id = cm.clinic_id
  LEFT JOIN clinic_departments cd ON cm.department_id = cd.id
  LEFT JOIN department_types dt ON cd.department_type_id = dt.id
  LEFT JOIN bills b ON a.id = b.appointment_id
  WHERE a.clinic_id = get_appointments_with_details_by_clinic.clinic_id::uuid
  ORDER BY a.date DESC, a."time" DESC;
END;
$$;


ALTER FUNCTION "public"."get_appointments_with_details_by_clinic"("clinic_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_bills_by_clinic"("clinic_id" "text") RETURNS TABLE("id" "text", "patient_id" "text", "patient_name" "text", "appointment_id" "text", "amount" numeric, "status" "text", "invoice_number" "text", "due_date" "text", "created_at" "text", "updated_at" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id::text,
    b.patient_id::text,
    COALESCE(p.name, 'Unknown Patient') as patient_name,
    b.appointment_id::text,
    b.amount,
    b.status,
    b.invoice_number,
    b.due_date::text,
    b.created_at::text,
    b.updated_at::text
  FROM bills b
  LEFT JOIN patients p ON b.patient_id = p.id
  WHERE b.clinic_id::text = clinic_id
  ORDER BY b.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_bills_by_clinic"("clinic_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_clinic_billing_summary"("clinic_id_param" "uuid") RETURNS TABLE("credit_balance" integer, "total_credits_purchased" integer, "total_credits_used" integer, "current_month_appointments" integer, "current_month_amount" numeric, "pending_payments" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(cc.credit_balance, 0) as credit_balance,
        COALESCE(cc.total_credits_purchased, 0) as total_credits_purchased,
        COALESCE(cc.total_credits_used, 0) as total_credits_used,
        COALESCE(mbc.appointments_count, 0) as current_month_appointments,
        COALESCE(mbc.total_amount, 0) as current_month_amount,
        (SELECT COUNT(*)::INTEGER FROM payment_transactions pt 
         WHERE pt.clinic_id = clinic_id_param AND pt.payment_status = 'pending') as pending_payments
    FROM clinic_credits cc
    LEFT JOIN monthly_billing_cycles mbc ON mbc.clinic_id = cc.clinic_id 
        AND mbc.billing_month = DATE_TRUNC('month', CURRENT_DATE)
    WHERE cc.clinic_id = clinic_id_param;
END;
$$;


ALTER FUNCTION "public"."get_clinic_billing_summary"("clinic_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_clinic_credit_balance"("clinic_id_param" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    balance INTEGER;
BEGIN
    SELECT credit_balance INTO balance
    FROM clinic_credits
    WHERE clinic_id = clinic_id_param;
    
    RETURN COALESCE(balance, 0);
END;
$$;


ALTER FUNCTION "public"."get_clinic_credit_balance"("clinic_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_clinic_members"("p_clinic_id" "uuid") RETURNS TABLE("id" "uuid", "user_id" "uuid", "clinic_id" "uuid", "role" "public"."user_role", "department_id" "uuid", "created_at" timestamp with time zone, "profile" "jsonb", "department" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Verify user has access to this clinic
  IF NOT EXISTS (
    SELECT 1 FROM clinic_members auth_cm
    WHERE auth_cm.clinic_id = p_clinic_id AND auth_cm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Permission denied: cannot access clinic members';
  END IF;

  RETURN QUERY
  SELECT 
    cm.id,
    cm.user_id,
    cm.clinic_id,
    cm.role,
    cm.department_id,
    cm.created_at,
    (
      SELECT jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'email', p.email,
        'phone', p.phone,
        'avatar_url', p.avatar_url,
        'medical_license_number', p.medical_license_number,
        'medical_license_expiry', p.medical_license_expiry,
        'specialization', p.specialization,
        'qualifications', p.qualifications
      )
      FROM profiles p
      WHERE p.id = cm.user_id
    ) AS profile,
    (
      SELECT jsonb_build_object(
        'id', cd.id,
        'name', dt.name
      )
      FROM clinic_departments cd
      JOIN department_types dt ON dt.id = cd.department_type_id
      WHERE cd.id = cm.department_id
    ) AS department
  FROM clinic_members cm
  WHERE cm.clinic_id = p_clinic_id;
END;
$$;


ALTER FUNCTION "public"."get_clinic_members"("p_clinic_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_consultation_by_appointment"("p_appointment_id" "text") RETURNS TABLE("id" "text", "appointment_id" "text", "chief_complaint" "text", "history_present_illness" "text", "physical_examination" "text", "assessment_diagnosis" "text", "plan_treatment" "text", "prescriptions" "jsonb", "notes" "text", "created_at" "text", "updated_at" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id::text,
    c.appointment_id::text,
    c.chief_complaint,
    c.history_present_illness,
    c.physical_examination,
    c.assessment_diagnosis,
    c.plan_treatment,
    c.prescriptions,
    c.notes,
    c.created_at::text,
    c.updated_at::text
  FROM consultations c
  WHERE c.appointment_id::text = p_appointment_id;
END;
$$;


ALTER FUNCTION "public"."get_consultation_by_appointment"("p_appointment_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_consultation_details"("p_consultation_id" "uuid") RETURNS TABLE("id" "uuid", "patient_id" "uuid", "appointment_id" "uuid", "chief_complaint" "text", "history_present_illness" "text", "physical_examination" "text", "assessment_diagnosis" "text", "plan_treatment" "text", "prescriptions" "jsonb", "notes" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "patient_details" "json")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Verify user has access to this consultation's clinic
  IF NOT EXISTS (
    SELECT 1 FROM consultations c
    JOIN patients p ON p.id = c.patient_id
    JOIN clinic_members cm ON cm.clinic_id = p.clinic_id
    WHERE c.id = p_consultation_id AND cm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Permission denied: cannot access consultation details';
  END IF;

  RETURN QUERY
  SELECT 
    c.id,
    c.patient_id,
    c.appointment_id,
    c.chief_complaint,
    c.history_present_illness,
    c.physical_examination,
    c.assessment_diagnosis,
    c.plan_treatment,
    c.prescriptions,
    c.notes,
    c.created_at,
    c.updated_at,
    json_build_object(
      'id', p.id,
      'name', p.name,
      'medical_id', p.medical_id,
      'gender', p.gender,
      'date_of_birth', p.date_of_birth
    ) as patient_details
  FROM consultations c
  JOIN patients p ON p.id = c.patient_id
  WHERE c.id = p_consultation_id;
END;
$$;


ALTER FUNCTION "public"."get_consultation_details"("p_consultation_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dashboard_data"("_clinic_id" "uuid") RETURNS TABLE("total_patients" bigint, "total_doctors" bigint, "total_appointments" bigint, "appointments_today" bigint, "pending_consultations" bigint, "completed_consultations" bigint, "all_relevant_appointments" "json")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM patients WHERE clinic_id = _clinic_id) as total_patients,
        (SELECT COUNT(*) FROM doctors WHERE clinic_id = _clinic_id AND is_active = true) as total_doctors,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = _clinic_id) as total_appointments,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = _clinic_id AND date = CURRENT_DATE::TEXT) as appointments_today,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = _clinic_id AND status = 'In Progress') as pending_consultations,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = _clinic_id AND status = 'Completed') as completed_consultations,
        (SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
         FROM (
            SELECT 
                a.id,
                a.patient_id,
                a.doctor_id,
                a.date,
                a.time,
                a.type,
                a.status,
                a.clinic_id,
                p.name as patient_name,
                COALESCE(d.name, prof.name) as doctor_name
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.id
            LEFT JOIN doctors d ON a.doctor_id = d.id
            LEFT JOIN profiles prof ON d.user_id = prof.id
            WHERE a.clinic_id = _clinic_id
            ORDER BY a.date DESC, a.time DESC
            LIMIT 10
         ) t) as all_relevant_appointments;
END;
$$;


ALTER FUNCTION "public"."get_dashboard_data"("_clinic_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_doctor_dashboard_data"("_clinic_id" "uuid", "_user_id" "uuid") RETURNS TABLE("total_patients" bigint, "total_appointments" bigint, "pending_consultations" bigint, "completed_consultations" bigint, "upcoming_appointments" "json", "my_patients" "json")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    doc_id UUID;
BEGIN
    -- Get doctor ID for the user
    SELECT d.id INTO doc_id
    FROM doctors d
    WHERE d.user_id = _user_id AND d.clinic_id = _clinic_id;
    
    IF doc_id IS NULL THEN
        -- Return empty result if no doctor profile found
        RETURN QUERY
        SELECT 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, '[]'::JSON, '[]'::JSON;
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        (SELECT COUNT(DISTINCT a.patient_id) FROM appointments a WHERE a.clinic_id = _clinic_id AND a.doctor_id = doc_id) as total_patients,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = _clinic_id AND doctor_id = doc_id) as total_appointments,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = _clinic_id AND doctor_id = doc_id AND status = 'In Progress') as pending_consultations,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = _clinic_id AND doctor_id = doc_id AND status = 'Completed') as completed_consultations,
        (SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
         FROM (
            SELECT 
                a.id,
                a.patient_id,
                a.doctor_id,
                a.date,
                a.time,
                a.type,
                a.status,
                a.clinic_id,
                p.name as patient_name,
                COALESCE(d.name, prof.name) as doctor_name
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.id
            LEFT JOIN doctors d ON a.doctor_id = d.id
            LEFT JOIN profiles prof ON d.user_id = prof.id
            WHERE a.clinic_id = _clinic_id AND a.doctor_id = doc_id
            AND a.date >= CURRENT_DATE::TEXT
            ORDER BY a.date ASC, a.time ASC
            LIMIT 5
         ) t) as upcoming_appointments,
        (SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
         FROM (
            SELECT DISTINCT ON (p.id) 
                p.id,
                p.name,
                p.email,
                p.phone,
                p.gender,
                p.date_of_birth,
                p.medical_id,
                p.address,
                p.clinic_id,
                p.created_at,
                MAX(a.created_at) as last_visit
            FROM patients p
            INNER JOIN appointments a ON p.id = a.patient_id
            WHERE a.clinic_id = _clinic_id AND a.doctor_id = doc_id
            GROUP BY p.id, p.name, p.email, p.phone, p.gender, p.date_of_birth, p.medical_id, p.address, p.clinic_id, p.created_at
            ORDER BY p.id, last_visit DESC
            LIMIT 10
         ) t) as my_patients;
END;
$$;


ALTER FUNCTION "public"."get_doctor_dashboard_data"("_clinic_id" "uuid", "_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_doctors_by_clinic"("clinic_id" "text") RETURNS TABLE("id" "text", "user_id" "text", "name" "text", "department_name" "text", "phone" "text", "email" "text", "bio" "text")
    LANGUAGE "plpgsql"
    AS $_$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.user_id,
    COALESCE(d.name, p.name, 'Unknown Doctor') AS name,
    COALESCE(dt.name, 'General Medicine') AS department_name,
    p.phone,
    p.email,
    p.bio
  FROM doctors d
  LEFT JOIN profiles p ON d.user_id = p.id
  LEFT JOIN clinic_members cm ON d.user_id = cm.user_id AND cm.clinic_id = $1
  LEFT JOIN clinic_departments cd ON cm.department_id = cd.id
  LEFT JOIN department_types dt ON cd.department_type_id = dt.id
  WHERE d.clinic_id = $1
    AND d.is_active = true;
END;
$_$;


ALTER FUNCTION "public"."get_doctors_by_clinic"("clinic_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_patient_details"("p_patient_id" "uuid") RETURNS TABLE("id" "uuid", "name" "text", "phone" "text", "email" "text", "medical_id" "text", "gender" "text", "address" "text", "date_of_birth" "date", "created_at" timestamp with time zone, "clinic_id" "uuid", "consultations" "json")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Verify user has access to this patient's clinic
  IF NOT EXISTS (
    SELECT 1 FROM patients p
    JOIN clinic_members cm ON cm.clinic_id = p.clinic_id
    WHERE p.id = p_patient_id AND cm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Permission denied: cannot access patient details';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.phone,
    p.email,
    p.medical_id,
    p.gender,
    p.address,
    p.date_of_birth,
    p.created_at,
    p.clinic_id,
    COALESCE(
      (
        SELECT json_agg(json_build_object(
          'id', c.id,
          'appointment_id', c.appointment_id,
          'chief_complaint', c.chief_complaint,
          'history_present_illness', c.history_present_illness,
          'physical_examination', c.physical_examination,
          'assessment_diagnosis', c.assessment_diagnosis,
          'plan_treatment', c.plan_treatment,
          'prescriptions', c.prescriptions,
          'notes', c.notes,
          'created_at', c.created_at,
          'updated_at', c.updated_at
        ))
        FROM consultations c
        WHERE c.patient_id = p.id
      ),
      '[]'::json
    ) as consultations
  FROM patients p
  WHERE p.id = p_patient_id;
END;
$$;


ALTER FUNCTION "public"."get_patient_details"("p_patient_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_patients_by_clinic"("_clinic_id" "uuid", "_limit" integer DEFAULT 100, "_offset" integer DEFAULT 0) RETURNS TABLE("id" "uuid", "name" "text", "phone" "text", "email" "text", "medical_id" "text", "gender" "text", "address" "text", "date_of_birth" "date", "created_at" timestamp with time zone, "clinic_id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.phone,
    p.email,
    p.medical_id,
    p.gender,
    p.address,
    p.date_of_birth,
    p.created_at,
    p.clinic_id
  FROM patients p
  WHERE p.clinic_id = _clinic_id
  ORDER BY p.name ASC
  LIMIT _limit OFFSET _offset;
END;
$$;


ALTER FUNCTION "public"."get_patients_by_clinic"("_clinic_id" "uuid", "_limit" integer, "_offset" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profile"("user_id" "uuid") RETURNS TABLE("id" "uuid", "email" "text", "name" "text", "phone" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Only return profile if user is requesting their own or is admin
    IF auth.uid() = user_id OR 
       EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'is_admin' = 'true')
    THEN
        RETURN QUERY
        SELECT p.id, p.email, p.name, p.phone, p.created_at, p.updated_at
        FROM public.profiles p
        WHERE p.id = user_id;
    END IF;
END;
$$;


ALTER FUNCTION "public"."get_profile"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profile_details"("p_user_id" "uuid") RETURNS TABLE("id" "uuid", "name" "text", "email" "text", "phone" "text", "address" "text", "medical_license_number" "text", "medical_license_expiry" "date", "specialization" "text", "qualifications" "text", "avatar_url" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "clinics" "json")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Only allow users to view their own profile
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Permission denied: cannot access other user profiles';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.email,
    p.phone,
    p.address,
    p.medical_license_number,
    p.medical_license_expiry,
    p.specialization,
    p.qualifications,
    p.avatar_url,
    p.created_at,
    p.updated_at,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'role', cm.role,
          'department', CASE 
            WHEN cd.id IS NOT NULL THEN
              jsonb_build_object(
                'id', cd.id,
                'name', cd.name
              )
            ELSE NULL
          END
        )
      ) FILTER (WHERE c.id IS NOT NULL),
      '[]'::jsonb
    )::JSON as clinics
  FROM profiles p
  LEFT JOIN clinic_members cm ON cm.user_id = p.id
  LEFT JOIN clinics c ON c.id = cm.clinic_id
  LEFT JOIN clinic_departments cd ON cd.id = cm.department_id
  WHERE p.id = p_user_id
  GROUP BY p.id;
END;
$$;


ALTER FUNCTION "public"."get_profile_details"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profile_image_url"("p_user_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_url TEXT;
BEGIN
  -- Only allow users to get their own profile image
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Permission denied: cannot access other user profile images';
  END IF;

  SELECT avatar_url INTO v_url
  FROM profiles
  WHERE id = p_user_id;

  RETURN v_url;
END;
$$;


ALTER FUNCTION "public"."get_profile_image_url"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_public_clinic_by_slug"("p_slug" "text") RETURNS TABLE("id" "text", "name" "text", "slug" "text", "description" "text", "address" "text", "phone" "text", "email" "text", "website" "text", "operating_hours" "jsonb", "social_media" "jsonb", "clinic_images" "text"[], "established_year" integer, "license_number" "text", "accreditations" "text"[], "is_public" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id::text,
    c.name,
    c.slug,
    c.description,
    c.address,
    c.phone,
    c.email,
    c.website,
    c.operating_hours::jsonb,
    c.social_media::jsonb,
    c.clinic_images,
    c.established_year,
    c.license_number,
    c.accreditations,
    c.is_public
  FROM clinics c
  WHERE c.slug = p_slug AND c.is_public = true;
END;
$$;


ALTER FUNCTION "public"."get_public_clinic_by_slug"("p_slug" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_public_clinics"("search_term" "text" DEFAULT NULL::"text", "limit_count" integer DEFAULT NULL::integer) RETURNS TABLE("id" "text", "name" "text", "slug" "text", "description" "text", "address" "text", "phone" "text", "email" "text", "website" "text", "operating_hours" "jsonb", "social_media" "jsonb", "clinic_images" "text"[], "established_year" integer, "license_number" "text", "accreditations" "text"[], "is_public" boolean, "doctor_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id::text,
    c.name,
    c.slug,
    c.description,
    c.address,
    c.phone,
    c.email,
    c.website,
    c.operating_hours::jsonb,
    c.social_media::jsonb,
    c.clinic_images,
    c.established_year,
    c.license_number,
    c.accreditations,
    c.is_public,
    COUNT(d.id) as doctor_count
  FROM clinics c
  LEFT JOIN doctors d ON c.id = d.clinic_id
  WHERE c.is_public = true
  AND (
    search_term IS NULL
    OR c.name ILIKE '%' || search_term || '%'
    OR c.address ILIKE '%' || search_term || '%'
    OR c.description ILIKE '%' || search_term || '%'
  )
  GROUP BY c.id
  ORDER BY c.created_at DESC
  LIMIT CASE 
    WHEN limit_count IS NOT NULL THEN limit_count
    ELSE NULL
  END;
END;
$$;


ALTER FUNCTION "public"."get_public_clinics"("search_term" "text", "limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_public_doctors_by_clinic"("p_clinic_id" "text") RETURNS TABLE("id" "text", "name" "text", "primary_specialization" "text", "medical_specializations" "text"[], "years_of_experience" integer, "bio" "text", "consultation_fee" numeric, "languages_spoken" "text"[], "medical_qualifications" "text"[], "department_name" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id::text,
    d.name,
    d.primary_specialization,
    d.medical_specializations,
    d.years_of_experience,
    d.bio,
    d.consultation_fee,
    d.languages_spoken,
    d.medical_qualifications,
    dt.name as department_name
  FROM doctors d
  LEFT JOIN clinic_departments cd ON d.clinic_id = cd.clinic_id
  LEFT JOIN department_types dt ON cd.department_type_id = dt.id
  WHERE d.clinic_id::text = p_clinic_id
  AND d.clinic_id IN (
    SELECT c.id FROM clinics c WHERE c.is_public = true
  );
END;
$$;


ALTER FUNCTION "public"."get_public_doctors_by_clinic"("p_clinic_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_clinic_memberships"("user_id" "uuid") RETURNS TABLE("clinic_id" "uuid", "clinic_name" "text", "role" "public"."user_role", "joined_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as clinic_id,
    c.name as clinic_name,
    cm.role,
    cm.created_at as joined_at
  FROM clinic_members cm
  JOIN clinics c ON c.id = cm.clinic_id
  WHERE cm.user_id = $1;
END;
$_$;


ALTER FUNCTION "public"."get_user_clinic_memberships"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_clinics"() RETURNS TABLE("clinic_id" "uuid")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT clinic_id FROM clinic_members WHERE user_id = auth.uid();
$$;


ALTER FUNCTION "public"."get_user_clinics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_clinics_simple"() RETURNS TABLE("clinic_id" "uuid")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT DISTINCT clinic_id 
  FROM clinic_members 
  WHERE user_id = auth.uid();
$$;


ALTER FUNCTION "public"."get_user_clinics_simple"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
   BEGIN
     IF NEW.role = 'doctor' THEN
       INSERT INTO public.doctors (user_id, clinic_id, name, email)
       SELECT 
         NEW.user_id,
         NEW.clinic_id,
         COALESCE(p.name, 'Pending User ' || NEW.user_id),
         COALESCE(p.email, 'pending_' || NEW.user_id || '@example.com')
       FROM public.profiles p
       WHERE p.id = NEW.user_id
       ON CONFLICT (user_id, clinic_id) DO UPDATE
       SET 
         name = COALESCE(EXCLUDED.name, public.doctors.name),
         email = COALESCE(EXCLUDED.email, public.doctors.email),
         updated_at = NOW();
     END IF;
     RETURN NEW;
   END;
   $$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."invite_and_add_member"("p_email" "text", "p_name" "text", "p_clinic_id" "uuid", "p_role" "public"."user_role", "p_phone" "text" DEFAULT NULL::"text", "p_department_id" "uuid" DEFAULT NULL::"uuid", "p_availability" "text" DEFAULT NULL::"text", "p_bio" "text" DEFAULT NULL::"text") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."invite_and_add_member"("p_email" "text", "p_name" "text", "p_clinic_id" "uuid", "p_role" "public"."user_role", "p_phone" "text", "p_department_id" "uuid", "p_availability" "text", "p_bio" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_superadmin_in_clinic"("check_clinic_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM clinic_members 
    WHERE user_id = auth.uid() 
    AND clinic_id = check_clinic_id 
    AND role = 'superadmin'::user_role
  );
$$;


ALTER FUNCTION "public"."is_superadmin_in_clinic"("check_clinic_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."on_auth_user_created"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone)
  VALUES (
    NEW.id,
    LOWER(NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Pending User ' || NEW.id),
    NULL
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    phone = EXCLUDED.phone,
    updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."on_auth_user_created"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_medicines"("search_term" "text" DEFAULT ''::"text", "limit_count" integer DEFAULT 50) RETURNS TABLE("id" bigint, "name" "text", "price" numeric, "is_discontinued" boolean, "manufacturer_name" "text", "pack_size_label" "text", "pack_type" "text", "short_composition1" "text", "short_composition2" "text", "created_at" timestamp with time zone)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT 
    m.id,
    m.name,
    m.price,
    m.is_discontinued,
    m.manufacturer_name,
    m.pack_size_label,
    m.pack_type,
    m.short_composition1,
    m.short_composition2,
    m.created_at
  FROM medicines m
  WHERE 
    (search_term = '' OR 
     m.name ILIKE '%' || search_term || '%' OR
     m.short_composition1 ILIKE '%' || search_term || '%' OR
     m.short_composition2 ILIKE '%' || search_term || '%' OR
     m.manufacturer_name ILIKE '%' || search_term || '%')
    AND (m.is_discontinued IS NULL OR m.is_discontinued = false)
  ORDER BY 
    -- Exact matches first
    CASE WHEN LOWER(m.name) = LOWER(search_term) THEN 1 ELSE 2 END,
    -- Then starts with search term
    CASE WHEN LOWER(m.name) LIKE LOWER(search_term) || '%' THEN 1 ELSE 2 END,
    -- Then alphabetical
    m.name
  LIMIT limit_count;
$$;


ALTER FUNCTION "public"."search_medicines"("search_term" "text", "limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_clinic_slug"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_clinic_slug(NEW.name, NEW.id);
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_clinic_slug"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."submit_contact_form"("name" "text", "email" "text", "message" "text", "phone" "text" DEFAULT NULL::"text", "company" "text" DEFAULT NULL::"text", "city" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  message_id uuid;
BEGIN
  INSERT INTO public.contact_messages (name, email, phone, company, city, message)
  VALUES (name, email, phone, company, city, message)
  RETURNING id INTO message_id;
  
  RETURN message_id;
END;
$$;


ALTER FUNCTION "public"."submit_contact_form"("name" "text", "email" "text", "message" "text", "phone" "text", "company" "text", "city" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_doctor_name"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE doctors
  SET name = NEW.name,
      updated_at = NOW()
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_doctor_name"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_clinic_credits_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_clinic_credits_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_clinic_member_details"("member_user_id" "uuid", "target_clinic_id" "uuid", "updated_role" "public"."user_role", "updated_department_id" "uuid" DEFAULT NULL::"uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Validate user_id
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = member_user_id) THEN
    RAISE EXCEPTION 'User ID % does not exist', member_user_id;
  END IF;

  -- Validate clinic_id
  IF NOT EXISTS (SELECT 1 FROM clinics WHERE id = target_clinic_id) THEN
    RAISE EXCEPTION 'Clinic ID % does not exist', target_clinic_id;
  END IF;

  -- Validate department_id (if provided)
  IF updated_department_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM clinic_departments WHERE id = updated_department_id AND clinic_id = target_clinic_id
  ) THEN
    RAISE EXCEPTION 'Department ID % does not exist for clinic %', updated_department_id, target_clinic_id;
  END IF;

  -- Check if member exists
  IF NOT EXISTS (
    SELECT 1 FROM clinic_members 
    WHERE user_id = member_user_id AND clinic_id = target_clinic_id
  ) THEN
    RAISE EXCEPTION 'No member found for user % in clinic %', member_user_id, target_clinic_id;
  END IF;

  -- Update clinic_members
  UPDATE clinic_members
  SET
    department_id = COALESCE(updated_department_id, department_id),
    role = COALESCE(updated_role, role)
  WHERE user_id = member_user_id
  AND clinic_id = target_clinic_id;
END;
$$;


ALTER FUNCTION "public"."update_clinic_member_details"("member_user_id" "uuid", "target_clinic_id" "uuid", "updated_role" "public"."user_role", "updated_department_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_consultation"("p_consultation_id" "uuid", "p_chief_complaint" "text" DEFAULT NULL::"text", "p_history_present_illness" "text" DEFAULT NULL::"text", "p_physical_examination" "text" DEFAULT NULL::"text", "p_assessment_diagnosis" "text" DEFAULT NULL::"text", "p_plan_treatment" "text" DEFAULT NULL::"text", "p_prescriptions" "jsonb" DEFAULT NULL::"jsonb", "p_notes" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Verify user has access to this consultation's clinic and is a doctor
  IF NOT EXISTS (
    SELECT 1 FROM consultations c
    JOIN patients p ON p.id = c.patient_id
    JOIN clinic_members cm ON cm.clinic_id = p.clinic_id
    WHERE c.id = p_consultation_id 
    AND cm.user_id = auth.uid()
    AND cm.role = 'doctor'
  ) THEN
    RAISE EXCEPTION 'Permission denied: only doctors can update consultations';
  END IF;

  UPDATE consultations
  SET
    chief_complaint = COALESCE(p_chief_complaint, chief_complaint),
    history_present_illness = COALESCE(p_history_present_illness, history_present_illness),
    physical_examination = COALESCE(p_physical_examination, physical_examination),
    assessment_diagnosis = COALESCE(p_assessment_diagnosis, assessment_diagnosis),
    plan_treatment = COALESCE(p_plan_treatment, plan_treatment),
    prescriptions = COALESCE(p_prescriptions, prescriptions),
    notes = COALESCE(p_notes, notes),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_consultation_id;

  RETURN p_consultation_id;
END;
$$;


ALTER FUNCTION "public"."update_consultation"("p_consultation_id" "uuid", "p_chief_complaint" "text", "p_history_present_illness" "text", "p_physical_examination" "text", "p_assessment_diagnosis" "text", "p_plan_treatment" "text", "p_prescriptions" "jsonb", "p_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_patient"("p_patient_id" "uuid", "p_name" "text" DEFAULT NULL::"text", "p_phone" "text" DEFAULT NULL::"text", "p_email" "text" DEFAULT NULL::"text", "p_medical_id" "text" DEFAULT NULL::"text", "p_gender" "text" DEFAULT NULL::"text", "p_address" "text" DEFAULT NULL::"text", "p_date_of_birth" "date" DEFAULT NULL::"date") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Verify user has access to this patient's clinic
  IF NOT EXISTS (
    SELECT 1 FROM patients p
    JOIN clinic_members cm ON cm.clinic_id = p.clinic_id
    WHERE p.id = p_patient_id AND cm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Permission denied: cannot update patient';
  END IF;

  UPDATE patients
  SET
    name = COALESCE(p_name, name),
    phone = COALESCE(p_phone, phone),
    email = COALESCE(p_email, email),
    medical_id = COALESCE(p_medical_id, medical_id),
    gender = COALESCE(p_gender, gender),
    address = COALESCE(p_address, address),
    date_of_birth = COALESCE(p_date_of_birth, date_of_birth),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_patient_id;

  RETURN p_patient_id;
END;
$$;


ALTER FUNCTION "public"."update_patient"("p_patient_id" "uuid", "p_name" "text", "p_phone" "text", "p_email" "text", "p_medical_id" "text", "p_gender" "text", "p_address" "text", "p_date_of_birth" "date") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "email" "text",
    "phone" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_profile"("p_user_id" "uuid", "p_name" "text", "p_email" "text", "p_phone" "text") RETURNS "public"."profiles"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_profile profiles;
BEGIN
  -- Skip auth.uid() check for service role
  IF current_setting('role', true) != 'service_role' AND p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Permission denied: cannot update other user profiles';
  END IF;

  INSERT INTO profiles (id, name, email, phone, updated_at)
  VALUES (
    p_user_id, 
    COALESCE(p_name, p_email, 'Unknown'),
    COALESCE(p_email, 'unknown@example.com'),
    p_phone, 
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    name = COALESCE(EXCLUDED.name, profiles.name),
    email = COALESCE(EXCLUDED.email, profiles.email),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    updated_at = NOW()
  RETURNING * INTO v_profile;

  RETURN v_profile;
END;
$$;


ALTER FUNCTION "public"."update_profile"("p_user_id" "uuid", "p_name" "text", "p_email" "text", "p_phone" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_profile_image"("p_user_id" "uuid", "p_avatar_url" "text") RETURNS "public"."profiles"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_profile profiles;
BEGIN
  -- Only allow users to update their own profile image
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Permission denied: cannot update other user profile images';
  END IF;

  UPDATE profiles
  SET
    avatar_url = p_avatar_url,
    updated_at = NOW()
  WHERE id = p_user_id
  RETURNING * INTO v_profile;

  RETURN v_profile;
END;
$$;


ALTER FUNCTION "public"."update_profile_image"("p_user_id" "uuid", "p_avatar_url" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_bill_items"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    item JSONB;
BEGIN
    -- Validate that items is an array
    IF NOT jsonb_typeof(NEW.items) = 'array' THEN
        RAISE EXCEPTION 'items must be an array';
    END IF;

    -- Validate each item in the array
    FOR item IN SELECT value FROM jsonb_array_elements(NEW.items)
    LOOP
        IF NOT (
            jsonb_typeof(item->>'description') = 'string' AND
            (item->>'description')::text <> '' AND
            jsonb_typeof(item->>'amount') IN ('number', 'string') AND
            (item->>'amount')::decimal >= 0 AND
            jsonb_typeof(item->>'quantity') IN ('number', 'string') AND
            (item->>'quantity')::integer >= 1
        ) THEN
            RAISE EXCEPTION 'Each item must have a non-empty description, non-negative amount, and quantity >= 1';
        END IF;
    END LOOP;

    -- Calculate total amount from items
    NEW.amount = (
        SELECT COALESCE(SUM((value->>'amount')::decimal * (value->>'quantity')::integer), 0)
        FROM jsonb_array_elements(NEW.items)
    );

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_bill_items"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."appointment_billing" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "appointment_id" "uuid" NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "billing_type" character varying(50) NOT NULL,
    "amount" numeric(10,2) DEFAULT 10.00 NOT NULL,
    "credits_used" integer DEFAULT 1,
    "monthly_billing_cycle_id" "uuid",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "appointment_billing_billing_type_check" CHECK ((("billing_type")::"text" = ANY ((ARRAY['credit_deduction'::character varying, 'monthly_billing'::character varying])::"text"[])))
);


ALTER TABLE "public"."appointment_billing" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."appointments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "doctor_id" "uuid" NOT NULL,
    "date" "text" NOT NULL,
    "time" "text" NOT NULL,
    "type" "public"."appointment_type" DEFAULT 'Walk-in'::"public"."appointment_type",
    "status" "public"."appointment_status" DEFAULT 'Scheduled'::"public"."appointment_status",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."appointments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bills" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "appointment_id" "uuid",
    "amount" numeric NOT NULL,
    "items" "jsonb",
    "status" "public"."bill_status" DEFAULT 'Pending'::"public"."bill_status",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "description" "text",
    "invoice_number" "text" NOT NULL,
    "service_items" "jsonb",
    "discount_percentage" numeric(5,2) DEFAULT 0,
    "tax_percentage" numeric(5,2) DEFAULT 0,
    "billing_type" "text" DEFAULT 'simple'::"text",
    "notes" "text",
    CONSTRAINT "bills_billing_type_check" CHECK (("billing_type" = ANY (ARRAY['simple'::"text", 'itemized'::"text"])))
);


ALTER TABLE "public"."bills" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clinic_credits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "credit_balance" integer DEFAULT 0 NOT NULL,
    "total_credits_purchased" integer DEFAULT 0 NOT NULL,
    "total_credits_used" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."clinic_credits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clinic_departments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "clinic_id" "uuid",
    "department_type_id" "uuid",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."clinic_departments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clinic_members" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "clinic_id" "uuid",
    "role" "public"."user_role" NOT NULL,
    "department_id" "uuid",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."clinic_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clinics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "address" "text",
    "phone" "text",
    "email" "text",
    "website" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "slug" "text",
    "is_public" boolean DEFAULT false,
    "description" "text",
    "operating_hours" "jsonb" DEFAULT '{}'::"jsonb",
    "social_media" "jsonb" DEFAULT '{}'::"jsonb",
    "clinic_images" "text"[] DEFAULT '{}'::"text"[],
    "established_year" integer,
    "license_number" "text",
    "accreditations" "text"[] DEFAULT '{}'::"text"[]
);


ALTER TABLE "public"."clinics" OWNER TO "postgres";


COMMENT ON COLUMN "public"."clinics"."slug" IS 'URL-friendly unique identifier for clinic';



COMMENT ON COLUMN "public"."clinics"."is_public" IS 'Whether clinic profile is publicly accessible';



COMMENT ON COLUMN "public"."clinics"."description" IS 'Public description of clinic services and mission';



COMMENT ON COLUMN "public"."clinics"."operating_hours" IS 'JSON object with day-wise operating hours';



COMMENT ON COLUMN "public"."clinics"."social_media" IS 'JSON object with social media links';



COMMENT ON COLUMN "public"."clinics"."clinic_images" IS 'Array of image URLs for clinic gallery';



CREATE TABLE IF NOT EXISTS "public"."consultations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "appointment_id" "uuid",
    "clinic_id" "uuid" NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "specialty_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "doctor_id" "uuid",
    "clinical_notes" "jsonb"
);


ALTER TABLE "public"."consultations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "company" "text",
    "city" "text",
    "message" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."contact_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."department_types" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."department_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."doctors" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "bio" "text",
    "clinic_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "consultation_fee" numeric DEFAULT '0'::numeric,
    "primary_specialization" "text",
    "years_of_experience" integer,
    "languages_spoken" "text"[],
    "professional_summary" "text",
    "medical_registration_number" "text",
    "medical_qualifications" "text"[],
    "medical_specializations" "text"[],
    "medical_council" "text",
    "medical_license_state" "text",
    "medical_license_expiry" "date",
    "subspecialty" "text"[],
    "board_certifications" "text"[],
    "fellowship_details" "text",
    "medical_college" "text",
    "graduation_year" integer,
    "clinic_timings" "jsonb",
    "profile_completion_percentage" numeric DEFAULT 0,
    "availability" "text" DEFAULT 'Mon-Fri 9:00 AM - 5:00 PM'::"text",
    "medical_degree" "text",
    "medical_university" "text",
    "postgraduate_degree" "text",
    "pg_specialization" "text",
    "pg_institution" "text",
    "pg_completion_year" integer,
    "additional_qualifications" "text",
    "research_experience" "text",
    "practice_timings" "jsonb",
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."doctors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."medicines" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "price" numeric(10,2),
    "is_discontinued" boolean DEFAULT false,
    "manufacturer_name" "text",
    "pack_size_label" "text",
    "pack_type" "text",
    "short_composition1" "text",
    "short_composition2" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."medicines" OWNER TO "postgres";


ALTER TABLE "public"."medicines" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."medicines_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."monthly_billing_cycles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "billing_month" "date" NOT NULL,
    "appointments_count" integer DEFAULT 0 NOT NULL,
    "total_amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "payment_status" character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    "payment_transaction_id" "uuid",
    "due_date" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "monthly_billing_cycles_payment_status_check" CHECK ((("payment_status")::"text" = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'overdue'::character varying])::"text"[])))
);


ALTER TABLE "public"."monthly_billing_cycles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patients" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "gender" "text",
    "date_of_birth" "date",
    "medical_id" "text",
    "address" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."patients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "transaction_type" character varying(50) NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "currency" character varying(3) DEFAULT 'INR'::character varying NOT NULL,
    "credits_purchased" integer,
    "razorpay_payment_id" character varying(255),
    "razorpay_order_id" character varying(255),
    "razorpay_signature" character varying(255),
    "payment_status" character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    "payment_method" character varying(50),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payment_transactions_payment_status_check" CHECK ((("payment_status")::"text" = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying, 'refunded'::character varying])::"text"[]))),
    CONSTRAINT "payment_transactions_transaction_type_check" CHECK ((("transaction_type")::"text" = ANY ((ARRAY['credit_purchase'::character varying, 'monthly_billing'::character varying])::"text"[])))
);


ALTER TABLE "public"."payment_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prescriptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "doctor_id" "uuid" NOT NULL,
    "appointment_id" "uuid",
    "medications" "jsonb",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "consultation_id" "uuid"
);


ALTER TABLE "public"."prescriptions" OWNER TO "postgres";


ALTER TABLE ONLY "public"."appointment_billing"
    ADD CONSTRAINT "appointment_billing_appointment_id_key" UNIQUE ("appointment_id");



ALTER TABLE ONLY "public"."appointment_billing"
    ADD CONSTRAINT "appointment_billing_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bills"
    ADD CONSTRAINT "bills_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clinic_credits"
    ADD CONSTRAINT "clinic_credits_clinic_id_unique" UNIQUE ("clinic_id");



ALTER TABLE ONLY "public"."clinic_credits"
    ADD CONSTRAINT "clinic_credits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clinic_departments"
    ADD CONSTRAINT "clinic_departments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clinic_members"
    ADD CONSTRAINT "clinic_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clinic_members"
    ADD CONSTRAINT "clinic_members_user_id_clinic_id_key" UNIQUE ("user_id", "clinic_id");



ALTER TABLE ONLY "public"."clinics"
    ADD CONSTRAINT "clinics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clinics"
    ADD CONSTRAINT "clinics_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."consultations"
    ADD CONSTRAINT "consultations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_messages"
    ADD CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."department_types"
    ADD CONSTRAINT "department_types_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."department_types"
    ADD CONSTRAINT "department_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."doctors"
    ADD CONSTRAINT "doctors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."medicines"
    ADD CONSTRAINT "medicines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."monthly_billing_cycles"
    ADD CONSTRAINT "monthly_billing_cycles_clinic_id_billing_month_key" UNIQUE ("clinic_id", "billing_month");



ALTER TABLE ONLY "public"."monthly_billing_cycles"
    ADD CONSTRAINT "monthly_billing_cycles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_medical_id_clinic_id_key" UNIQUE ("medical_id", "clinic_id");



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_transactions"
    ADD CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prescriptions"
    ADD CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."doctors"
    ADD CONSTRAINT "unique_doctor_per_user_clinic" UNIQUE ("user_id", "clinic_id");



CREATE INDEX "idx_appointment_billing_appointment_id" ON "public"."appointment_billing" USING "btree" ("appointment_id");



CREATE INDEX "idx_appointment_billing_clinic_id" ON "public"."appointment_billing" USING "btree" ("clinic_id");



CREATE INDEX "idx_appointments_clinic_id" ON "public"."appointments" USING "btree" ("clinic_id");



CREATE INDEX "idx_appointments_doctor_id" ON "public"."appointments" USING "btree" ("doctor_id");



CREATE INDEX "idx_appointments_patient_id" ON "public"."appointments" USING "btree" ("patient_id");



CREATE INDEX "idx_bills_appointment_id" ON "public"."bills" USING "btree" ("appointment_id");



CREATE INDEX "idx_bills_clinic_id" ON "public"."bills" USING "btree" ("clinic_id");



CREATE INDEX "idx_bills_clinic_id_created_at" ON "public"."bills" USING "btree" ("clinic_id", "created_at" DESC);



CREATE INDEX "idx_bills_patient_id" ON "public"."bills" USING "btree" ("patient_id");



CREATE INDEX "idx_clinic_credits_clinic_id" ON "public"."clinic_credits" USING "btree" ("clinic_id");



CREATE INDEX "idx_clinic_departments_clinic_id" ON "public"."clinic_departments" USING "btree" ("clinic_id");



CREATE INDEX "idx_clinic_departments_department_type_id" ON "public"."clinic_departments" USING "btree" ("department_type_id");



CREATE INDEX "idx_clinic_members_clinic_id" ON "public"."clinic_members" USING "btree" ("clinic_id");



CREATE INDEX "idx_clinic_members_department_id" ON "public"."clinic_members" USING "btree" ("department_id");



CREATE INDEX "idx_clinic_members_user_id" ON "public"."clinic_members" USING "btree" ("user_id");



CREATE INDEX "idx_clinics_created_by" ON "public"."clinics" USING "btree" ("created_by");



CREATE INDEX "idx_clinics_is_public" ON "public"."clinics" USING "btree" ("is_public");



CREATE INDEX "idx_clinics_public" ON "public"."clinics" USING "btree" ("is_public") WHERE ("is_public" = true);



CREATE INDEX "idx_clinics_slug" ON "public"."clinics" USING "btree" ("slug");



CREATE INDEX "idx_consultations_appointment_id" ON "public"."consultations" USING "btree" ("appointment_id");



CREATE INDEX "idx_consultations_clinic_id" ON "public"."consultations" USING "btree" ("clinic_id");



CREATE INDEX "idx_consultations_doctor_id" ON "public"."consultations" USING "btree" ("doctor_id");



CREATE INDEX "idx_consultations_patient_id" ON "public"."consultations" USING "btree" ("patient_id");



CREATE INDEX "idx_contact_messages_email" ON "public"."contact_messages" USING "btree" ("email");



CREATE INDEX "idx_doctors_clinic_id" ON "public"."doctors" USING "btree" ("clinic_id");



CREATE INDEX "idx_doctors_user_id" ON "public"."doctors" USING "btree" ("user_id");



CREATE INDEX "idx_monthly_billing_cycles_clinic_id" ON "public"."monthly_billing_cycles" USING "btree" ("clinic_id");



CREATE INDEX "idx_monthly_billing_cycles_status" ON "public"."monthly_billing_cycles" USING "btree" ("payment_status");



CREATE INDEX "idx_patients_clinic_id" ON "public"."patients" USING "btree" ("clinic_id");



CREATE INDEX "idx_payment_transactions_clinic_id" ON "public"."payment_transactions" USING "btree" ("clinic_id");



CREATE INDEX "idx_payment_transactions_status" ON "public"."payment_transactions" USING "btree" ("payment_status");



CREATE INDEX "idx_prescriptions_appointment_id" ON "public"."prescriptions" USING "btree" ("appointment_id");



CREATE INDEX "idx_prescriptions_clinic_id" ON "public"."prescriptions" USING "btree" ("clinic_id");



CREATE INDEX "idx_prescriptions_consultation_id" ON "public"."prescriptions" USING "btree" ("consultation_id");



CREATE INDEX "idx_prescriptions_doctor_id" ON "public"."prescriptions" USING "btree" ("doctor_id");



CREATE INDEX "idx_prescriptions_patient_id" ON "public"."prescriptions" USING "btree" ("patient_id");



CREATE OR REPLACE TRIGGER "clinic_credits_updated_at_trigger" BEFORE UPDATE ON "public"."clinic_credits" FOR EACH ROW EXECUTE FUNCTION "public"."update_clinic_credits_updated_at"();



CREATE OR REPLACE TRIGGER "handle_new_user" AFTER INSERT ON "public"."clinic_members" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_user"();



CREATE OR REPLACE TRIGGER "monthly_billing_cycles_updated_at_trigger" BEFORE UPDATE ON "public"."monthly_billing_cycles" FOR EACH ROW EXECUTE FUNCTION "public"."update_clinic_credits_updated_at"();



CREATE OR REPLACE TRIGGER "payment_transactions_updated_at_trigger" BEFORE UPDATE ON "public"."payment_transactions" FOR EACH ROW EXECUTE FUNCTION "public"."update_clinic_credits_updated_at"();



CREATE OR REPLACE TRIGGER "profiles_name_update_trigger" AFTER UPDATE OF "name" ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."sync_doctor_name"();



CREATE OR REPLACE TRIGGER "trigger_ensure_doctor_clinic_member" AFTER INSERT OR UPDATE ON "public"."doctors" FOR EACH ROW WHEN (("new"."user_id" IS NOT NULL)) EXECUTE FUNCTION "public"."ensure_doctor_has_clinic_member"();



CREATE OR REPLACE TRIGGER "trigger_set_clinic_slug" BEFORE INSERT OR UPDATE OF "name", "slug" ON "public"."clinics" FOR EACH ROW EXECUTE FUNCTION "public"."set_clinic_slug"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."appointment_billing"
    ADD CONSTRAINT "appointment_billing_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointment_billing"
    ADD CONSTRAINT "appointment_billing_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointment_billing"
    ADD CONSTRAINT "appointment_billing_monthly_billing_cycle_id_fkey" FOREIGN KEY ("monthly_billing_cycle_id") REFERENCES "public"."monthly_billing_cycles"("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bills"
    ADD CONSTRAINT "bills_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id");



ALTER TABLE ONLY "public"."bills"
    ADD CONSTRAINT "bills_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bills"
    ADD CONSTRAINT "bills_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clinic_credits"
    ADD CONSTRAINT "clinic_credits_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clinic_departments"
    ADD CONSTRAINT "clinic_departments_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clinic_departments"
    ADD CONSTRAINT "clinic_departments_department_type_id_fkey" FOREIGN KEY ("department_type_id") REFERENCES "public"."department_types"("id");



ALTER TABLE ONLY "public"."clinic_members"
    ADD CONSTRAINT "clinic_members_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clinic_members"
    ADD CONSTRAINT "clinic_members_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."clinic_departments"("id");



ALTER TABLE ONLY "public"."clinic_members"
    ADD CONSTRAINT "clinic_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clinics"
    ADD CONSTRAINT "clinics_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."consultations"
    ADD CONSTRAINT "consultations_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."consultations"
    ADD CONSTRAINT "consultations_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."consultations"
    ADD CONSTRAINT "consultations_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."consultations"
    ADD CONSTRAINT "consultations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."doctors"
    ADD CONSTRAINT "doctors_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."doctors"
    ADD CONSTRAINT "doctors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."monthly_billing_cycles"
    ADD CONSTRAINT "monthly_billing_cycles_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."monthly_billing_cycles"
    ADD CONSTRAINT "monthly_billing_cycles_payment_transaction_id_fkey" FOREIGN KEY ("payment_transaction_id") REFERENCES "public"."payment_transactions"("id");



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payment_transactions"
    ADD CONSTRAINT "payment_transactions_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."prescriptions"
    ADD CONSTRAINT "prescriptions_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id");



ALTER TABLE ONLY "public"."prescriptions"
    ADD CONSTRAINT "prescriptions_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."prescriptions"
    ADD CONSTRAINT "prescriptions_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."prescriptions"
    ADD CONSTRAINT "prescriptions_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id");



ALTER TABLE ONLY "public"."prescriptions"
    ADD CONSTRAINT "prescriptions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



CREATE POLICY "Anyone can view departments in public clinics" ON "public"."clinic_departments" FOR SELECT USING (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE ("clinics"."is_public" = true))));



CREATE POLICY "Anyone can view doctors in public clinics" ON "public"."doctors" FOR SELECT USING (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE ("clinics"."is_public" = true))));



CREATE POLICY "Departments are visible to clinic members and public clinics" ON "public"."clinic_departments" FOR SELECT USING (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE ("clinics"."is_public" = true)
UNION
 SELECT "clinic_members"."clinic_id"
   FROM "public"."clinic_members"
  WHERE ("clinic_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Doctors are visible to clinic members and public clinics" ON "public"."doctors" FOR SELECT USING (("clinic_id" IN ( SELECT "clinics"."id"
   FROM "public"."clinics"
  WHERE ("clinics"."is_public" = true)
UNION
 SELECT "clinic_members"."clinic_id"
   FROM "public"."clinic_members"
  WHERE ("clinic_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Enable read access for clinic members" ON "public"."doctors" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."clinic_members" "cm"
  WHERE (("cm"."clinic_id" = "doctors"."clinic_id") AND ("cm"."user_id" = "auth"."uid"())))));



CREATE POLICY "Service role can insert profiles" ON "public"."profiles" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Users can insert appointments for their clinic" ON "public"."appointments" FOR INSERT WITH CHECK (("clinic_id" IN ( SELECT "get_user_clinics"."clinic_id"
   FROM "public"."get_user_clinics"() "get_user_clinics"("clinic_id"))));



CREATE POLICY "Users can insert bills for their clinic" ON "public"."bills" FOR INSERT WITH CHECK (("clinic_id" IN ( SELECT "clinic_members"."clinic_id"
   FROM "public"."clinic_members"
  WHERE ("clinic_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert patients in their clinic" ON "public"."patients" FOR INSERT WITH CHECK (("clinic_id" IN ( SELECT "clinic_members"."clinic_id"
   FROM "public"."clinic_members"
  WHERE ("clinic_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can update appointments for their clinic" ON "public"."appointments" FOR UPDATE USING (("clinic_id" IN ( SELECT "get_user_clinics"."clinic_id"
   FROM "public"."get_user_clinics"() "get_user_clinics"("clinic_id"))));



CREATE POLICY "Users can update bills for their clinic" ON "public"."bills" FOR UPDATE USING (("clinic_id" IN ( SELECT "clinic_members"."clinic_id"
   FROM "public"."clinic_members"
  WHERE ("clinic_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can update patients in their clinic" ON "public"."patients" FOR UPDATE USING (("clinic_id" IN ( SELECT "clinic_members"."clinic_id"
   FROM "public"."clinic_members"
  WHERE ("clinic_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view appointments for their clinic" ON "public"."appointments" FOR SELECT USING (("clinic_id" IN ( SELECT "get_user_clinics"."clinic_id"
   FROM "public"."get_user_clinics"() "get_user_clinics"("clinic_id"))));



CREATE POLICY "Users can view bills for their clinic" ON "public"."bills" FOR SELECT USING (("clinic_id" IN ( SELECT "clinic_members"."clinic_id"
   FROM "public"."clinic_members"
  WHERE ("clinic_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view patients in their clinic" ON "public"."patients" FOR SELECT USING (("clinic_id" IN ( SELECT "clinic_members"."clinic_id"
   FROM "public"."clinic_members"
  WHERE ("clinic_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "allow_delete_clinic_departments_safe" ON "public"."clinic_departments" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."clinics" "c"
  WHERE (("c"."id" = "clinic_departments"."clinic_id") AND ("c"."created_by" = "auth"."uid"())))));



CREATE POLICY "allow_insert_clinic_departments" ON "public"."clinic_departments" FOR INSERT WITH CHECK (("clinic_id" IN ( SELECT "get_user_clinics"."clinic_id"
   FROM "public"."get_user_clinics"() "get_user_clinics"("clinic_id"))));



CREATE POLICY "allow_select_department_types" ON "public"."department_types" FOR SELECT USING (true);



ALTER TABLE "public"."appointment_billing" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "appointment_billing_access" ON "public"."appointment_billing" USING (("clinic_id" IN ( SELECT "clinic_members"."clinic_id"
   FROM "public"."clinic_members"
  WHERE ("clinic_members"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bills" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clinic_credits" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "clinic_credits_access" ON "public"."clinic_credits" USING (("clinic_id" IN ( SELECT "clinic_members"."clinic_id"
   FROM "public"."clinic_members"
  WHERE ("clinic_members"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."clinic_departments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clinic_members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "clinic_members_delete" ON "public"."clinic_members" FOR DELETE TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."is_superadmin_in_clinic"("clinic_id")));



CREATE POLICY "clinic_members_insert" ON "public"."clinic_members" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_superadmin_in_clinic"("clinic_id"));



CREATE POLICY "clinic_members_select" ON "public"."clinic_members" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR ("clinic_id" IN ( SELECT "get_user_clinics_simple"."clinic_id"
   FROM "public"."get_user_clinics_simple"() "get_user_clinics_simple"("clinic_id")))));



CREATE POLICY "clinic_members_update" ON "public"."clinic_members" FOR UPDATE TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."is_superadmin_in_clinic"("clinic_id"))) WITH CHECK ((("user_id" = "auth"."uid"()) OR "public"."is_superadmin_in_clinic"("clinic_id")));



ALTER TABLE "public"."clinics" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "clinics_insert_for_authenticated" ON "public"."clinics" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "clinics_select_for_members" ON "public"."clinics" FOR SELECT USING ((("is_public" = true) OR ("id" IN ( SELECT "get_user_clinics"."clinic_id"
   FROM "public"."get_user_clinics"() "get_user_clinics"("clinic_id")))));



CREATE POLICY "clinics_update_for_members" ON "public"."clinics" FOR UPDATE USING (("id" IN ( SELECT "clinic_members"."clinic_id"
   FROM "public"."clinic_members"
  WHERE (("clinic_members"."user_id" = "auth"."uid"()) AND ("clinic_members"."role" = 'superadmin'::"public"."user_role"))))) WITH CHECK (("id" IN ( SELECT "clinic_members"."clinic_id"
   FROM "public"."clinic_members"
  WHERE (("clinic_members"."user_id" = "auth"."uid"()) AND ("clinic_members"."role" = 'superadmin'::"public"."user_role")))));



CREATE POLICY "clinics_update_superadmin" ON "public"."clinics" FOR UPDATE USING (("id" IN ( SELECT "clinic_members"."clinic_id"
   FROM "public"."clinic_members"
  WHERE (("clinic_members"."user_id" = "auth"."uid"()) AND ("clinic_members"."role" = 'superadmin'::"public"."user_role"))))) WITH CHECK (("id" IN ( SELECT "clinic_members"."clinic_id"
   FROM "public"."clinic_members"
  WHERE (("clinic_members"."user_id" = "auth"."uid"()) AND ("clinic_members"."role" = 'superadmin'::"public"."user_role")))));



ALTER TABLE "public"."consultations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "consultations_delete_clinic_members" ON "public"."consultations" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."clinic_members" "cm"
  WHERE (("cm"."clinic_id" = "consultations"."clinic_id") AND ("cm"."user_id" = "auth"."uid"())))));



CREATE POLICY "consultations_insert_policy" ON "public"."consultations" FOR INSERT WITH CHECK (("clinic_id" IN ( SELECT "get_user_clinics"."clinic_id"
   FROM "public"."get_user_clinics"() "get_user_clinics"("clinic_id"))));



CREATE POLICY "consultations_select_policy" ON "public"."consultations" FOR SELECT USING (("clinic_id" IN ( SELECT "get_user_clinics"."clinic_id"
   FROM "public"."get_user_clinics"() "get_user_clinics"("clinic_id"))));



CREATE POLICY "consultations_update_policy" ON "public"."consultations" FOR UPDATE USING (("clinic_id" IN ( SELECT "get_user_clinics"."clinic_id"
   FROM "public"."get_user_clinics"() "get_user_clinics"("clinic_id"))));



ALTER TABLE "public"."department_types" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "department_types_read_all" ON "public"."department_types" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "department_types_read_public" ON "public"."department_types" FOR SELECT TO "anon" USING (true);



ALTER TABLE "public"."doctors" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "doctors_delete_simple" ON "public"."doctors" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."clinic_members" "cm"
  WHERE (("cm"."clinic_id" = "doctors"."clinic_id") AND ("cm"."user_id" = "auth"."uid"()) AND ("cm"."role" = 'superadmin'::"public"."user_role")))));



CREATE POLICY "doctors_insert_simple" ON "public"."doctors" FOR INSERT WITH CHECK ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."clinic_members" "cm"
  WHERE (("cm"."clinic_id" = "doctors"."clinic_id") AND ("cm"."user_id" = "auth"."uid"()))))));



CREATE POLICY "doctors_update_simple" ON "public"."doctors" FOR UPDATE USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."clinic_members" "cm"
  WHERE (("cm"."clinic_id" = "doctors"."clinic_id") AND ("cm"."user_id" = "auth"."uid"()) AND ("cm"."role" = 'superadmin'::"public"."user_role"))))));



ALTER TABLE "public"."medicines" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "medicines_delete_policy" ON "public"."medicines" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."clinic_members"
  WHERE (("clinic_members"."user_id" = "auth"."uid"()) AND ("clinic_members"."role" = 'superadmin'::"public"."user_role")))));



CREATE POLICY "medicines_insert_policy" ON "public"."medicines" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."clinic_members"
  WHERE (("clinic_members"."user_id" = "auth"."uid"()) AND ("clinic_members"."role" = ANY (ARRAY['doctor'::"public"."user_role", 'superadmin'::"public"."user_role"]))))));



CREATE POLICY "medicines_read_all" ON "public"."medicines" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "medicines_read_public" ON "public"."medicines" FOR SELECT TO "anon" USING (true);



CREATE POLICY "medicines_select_policy" ON "public"."medicines" FOR SELECT USING (true);



CREATE POLICY "medicines_update_policy" ON "public"."medicines" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."clinic_members"
  WHERE (("clinic_members"."user_id" = "auth"."uid"()) AND ("clinic_members"."role" = ANY (ARRAY['doctor'::"public"."user_role", 'superadmin'::"public"."user_role"]))))));



ALTER TABLE "public"."monthly_billing_cycles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "monthly_billing_cycles_access" ON "public"."monthly_billing_cycles" USING (("clinic_id" IN ( SELECT "clinic_members"."clinic_id"
   FROM "public"."clinic_members"
  WHERE ("clinic_members"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."patients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_transactions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "payment_transactions_access" ON "public"."payment_transactions" USING (("clinic_id" IN ( SELECT "clinic_members"."clinic_id"
   FROM "public"."clinic_members"
  WHERE ("clinic_members"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."prescriptions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "prescriptions_delete_policy" ON "public"."prescriptions" FOR DELETE TO "authenticated" USING (("clinic_id" IN ( SELECT "clinic_members"."clinic_id"
   FROM "public"."clinic_members"
  WHERE ("clinic_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "prescriptions_insert_policy" ON "public"."prescriptions" FOR INSERT TO "authenticated" WITH CHECK (("clinic_id" IN ( SELECT "clinic_members"."clinic_id"
   FROM "public"."clinic_members"
  WHERE ("clinic_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "prescriptions_select_policy" ON "public"."prescriptions" FOR SELECT TO "authenticated" USING (("clinic_id" IN ( SELECT "clinic_members"."clinic_id"
   FROM "public"."clinic_members"
  WHERE ("clinic_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "prescriptions_update_policy" ON "public"."prescriptions" FOR UPDATE TO "authenticated" USING (("clinic_id" IN ( SELECT "clinic_members"."clinic_id"
   FROM "public"."clinic_members"
  WHERE ("clinic_members"."user_id" = "auth"."uid"())))) WITH CHECK (("clinic_id" IN ( SELECT "clinic_members"."clinic_id"
   FROM "public"."clinic_members"
  WHERE ("clinic_members"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_delete" ON "public"."profiles" FOR DELETE TO "authenticated" USING (("id" = "auth"."uid"()));



CREATE POLICY "profiles_insert" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "profiles_select" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((("id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."clinic_members" "cm"
  WHERE (("cm"."user_id" = "profiles"."id") AND ("cm"."clinic_id" IN ( SELECT "get_user_clinics_simple"."clinic_id"
           FROM "public"."get_user_clinics_simple"() "get_user_clinics_simple"("clinic_id"))))))));



CREATE POLICY "profiles_update" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "public_clinics_select" ON "public"."clinics" FOR SELECT USING (("is_public" = true));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."add_clinic_credits"("clinic_id_param" "uuid", "credits_to_add" integer, "transaction_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."add_clinic_credits"("clinic_id_param" "uuid", "credits_to_add" integer, "transaction_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_clinic_credits"("clinic_id_param" "uuid", "credits_to_add" integer, "transaction_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."add_clinic_credits"("p_clinic_id" "uuid", "p_credits" integer, "p_payment_id" "text", "p_order_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."add_clinic_credits"("p_clinic_id" "uuid", "p_credits" integer, "p_payment_id" "text", "p_order_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_clinic_credits"("p_clinic_id" "uuid", "p_credits" integer, "p_payment_id" "text", "p_order_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."add_clinic_member"("new_user_id" "text", "target_clinic_id" "text", "new_role" "public"."user_role", "new_department_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."add_clinic_member"("new_user_id" "text", "target_clinic_id" "text", "new_role" "public"."user_role", "new_department_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_clinic_member"("new_user_id" "text", "target_clinic_id" "text", "new_role" "public"."user_role", "new_department_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_clinic_with_admin"("clinic_name" "text", "user_phone" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_clinic_with_admin"("clinic_name" "text", "user_phone" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_clinic_with_admin"("clinic_name" "text", "user_phone" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_consultation"("p_patient_id" "uuid", "p_appointment_id" "uuid", "p_chief_complaint" "text", "p_history_present_illness" "text", "p_physical_examination" "text", "p_assessment_diagnosis" "text", "p_plan_treatment" "text", "p_prescriptions" "jsonb", "p_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_consultation"("p_patient_id" "uuid", "p_appointment_id" "uuid", "p_chief_complaint" "text", "p_history_present_illness" "text", "p_physical_examination" "text", "p_assessment_diagnosis" "text", "p_plan_treatment" "text", "p_prescriptions" "jsonb", "p_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_consultation"("p_patient_id" "uuid", "p_appointment_id" "uuid", "p_chief_complaint" "text", "p_history_present_illness" "text", "p_physical_examination" "text", "p_assessment_diagnosis" "text", "p_plan_treatment" "text", "p_prescriptions" "jsonb", "p_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_doctor_profile"("p_user_id" "uuid", "p_clinic_id" "uuid", "p_name" "text", "p_email" "text", "p_primary_specialization" "text", "p_consultation_fee" numeric, "p_availability" "jsonb", "p_bio" "text", "p_department_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_doctor_profile"("p_user_id" "uuid", "p_clinic_id" "uuid", "p_name" "text", "p_email" "text", "p_primary_specialization" "text", "p_consultation_fee" numeric, "p_availability" "jsonb", "p_bio" "text", "p_department_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_doctor_profile"("p_user_id" "uuid", "p_clinic_id" "uuid", "p_name" "text", "p_email" "text", "p_primary_specialization" "text", "p_consultation_fee" numeric, "p_availability" "jsonb", "p_bio" "text", "p_department_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_patient"("p_clinic_id" "uuid", "p_name" "text", "p_phone" "text", "p_email" "text", "p_medical_id" "text", "p_gender" "text", "p_address" "text", "p_date_of_birth" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."create_patient"("p_clinic_id" "uuid", "p_name" "text", "p_phone" "text", "p_email" "text", "p_medical_id" "text", "p_gender" "text", "p_address" "text", "p_date_of_birth" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_patient"("p_clinic_id" "uuid", "p_name" "text", "p_phone" "text", "p_email" "text", "p_medical_id" "text", "p_gender" "text", "p_address" "text", "p_date_of_birth" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_profile_for_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_profile_for_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_profile_for_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."deduct_appointment_credit"("appointment_id_param" "uuid", "clinic_id_param" "uuid", "credits_to_deduct" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."deduct_appointment_credit"("appointment_id_param" "uuid", "clinic_id_param" "uuid", "credits_to_deduct" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."deduct_appointment_credit"("appointment_id_param" "uuid", "clinic_id_param" "uuid", "credits_to_deduct" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_consultation"("p_consultation_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_consultation"("p_consultation_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_consultation"("p_consultation_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_patient"("p_patient_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_patient"("p_patient_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_patient"("p_patient_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_doctor_has_clinic_member"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_doctor_has_clinic_member"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_doctor_has_clinic_member"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_clinic_slug"("clinic_name" "text", "clinic_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_clinic_slug"("clinic_name" "text", "clinic_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_clinic_slug"("clinic_name" "text", "clinic_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_invoice_number"("clinic_id_arg" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_invoice_number"("clinic_id_arg" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_invoice_number"("clinic_id_arg" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_appointments_with_details_by_clinic"("clinic_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_appointments_with_details_by_clinic"("clinic_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_appointments_with_details_by_clinic"("clinic_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_bills_by_clinic"("clinic_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_bills_by_clinic"("clinic_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_bills_by_clinic"("clinic_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_clinic_billing_summary"("clinic_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_clinic_billing_summary"("clinic_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_clinic_billing_summary"("clinic_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_clinic_credit_balance"("clinic_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_clinic_credit_balance"("clinic_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_clinic_credit_balance"("clinic_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_clinic_members"("p_clinic_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_clinic_members"("p_clinic_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_clinic_members"("p_clinic_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_consultation_by_appointment"("p_appointment_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_consultation_by_appointment"("p_appointment_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_consultation_by_appointment"("p_appointment_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_consultation_details"("p_consultation_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_consultation_details"("p_consultation_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_consultation_details"("p_consultation_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_dashboard_data"("_clinic_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_dashboard_data"("_clinic_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dashboard_data"("_clinic_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_doctor_dashboard_data"("_clinic_id" "uuid", "_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_doctor_dashboard_data"("_clinic_id" "uuid", "_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_doctor_dashboard_data"("_clinic_id" "uuid", "_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_doctors_by_clinic"("clinic_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_doctors_by_clinic"("clinic_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_doctors_by_clinic"("clinic_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_patient_details"("p_patient_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_patient_details"("p_patient_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_patient_details"("p_patient_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_patients_by_clinic"("_clinic_id" "uuid", "_limit" integer, "_offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_patients_by_clinic"("_clinic_id" "uuid", "_limit" integer, "_offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_patients_by_clinic"("_clinic_id" "uuid", "_limit" integer, "_offset" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_profile"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_profile"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profile"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_profile_details"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_profile_details"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profile_details"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_profile_image_url"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_profile_image_url"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profile_image_url"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_public_clinic_by_slug"("p_slug" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_public_clinic_by_slug"("p_slug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_public_clinic_by_slug"("p_slug" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_public_clinics"("search_term" "text", "limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_public_clinics"("search_term" "text", "limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_public_clinics"("search_term" "text", "limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_public_doctors_by_clinic"("p_clinic_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_public_doctors_by_clinic"("p_clinic_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_public_doctors_by_clinic"("p_clinic_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_clinic_memberships"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_clinic_memberships"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_clinic_memberships"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_clinics"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_clinics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_clinics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_clinics_simple"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_clinics_simple"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_clinics_simple"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."invite_and_add_member"("p_email" "text", "p_name" "text", "p_clinic_id" "uuid", "p_role" "public"."user_role", "p_phone" "text", "p_department_id" "uuid", "p_availability" "text", "p_bio" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."invite_and_add_member"("p_email" "text", "p_name" "text", "p_clinic_id" "uuid", "p_role" "public"."user_role", "p_phone" "text", "p_department_id" "uuid", "p_availability" "text", "p_bio" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."invite_and_add_member"("p_email" "text", "p_name" "text", "p_clinic_id" "uuid", "p_role" "public"."user_role", "p_phone" "text", "p_department_id" "uuid", "p_availability" "text", "p_bio" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_superadmin_in_clinic"("check_clinic_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_superadmin_in_clinic"("check_clinic_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_superadmin_in_clinic"("check_clinic_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."on_auth_user_created"() TO "anon";
GRANT ALL ON FUNCTION "public"."on_auth_user_created"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."on_auth_user_created"() TO "service_role";



GRANT ALL ON FUNCTION "public"."search_medicines"("search_term" "text", "limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."search_medicines"("search_term" "text", "limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_medicines"("search_term" "text", "limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_clinic_slug"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_clinic_slug"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_clinic_slug"() TO "service_role";



GRANT ALL ON FUNCTION "public"."submit_contact_form"("name" "text", "email" "text", "message" "text", "phone" "text", "company" "text", "city" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."submit_contact_form"("name" "text", "email" "text", "message" "text", "phone" "text", "company" "text", "city" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_contact_form"("name" "text", "email" "text", "message" "text", "phone" "text", "company" "text", "city" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_doctor_name"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_doctor_name"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_doctor_name"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_clinic_credits_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_clinic_credits_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_clinic_credits_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_clinic_member_details"("member_user_id" "uuid", "target_clinic_id" "uuid", "updated_role" "public"."user_role", "updated_department_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."update_clinic_member_details"("member_user_id" "uuid", "target_clinic_id" "uuid", "updated_role" "public"."user_role", "updated_department_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_clinic_member_details"("member_user_id" "uuid", "target_clinic_id" "uuid", "updated_role" "public"."user_role", "updated_department_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_consultation"("p_consultation_id" "uuid", "p_chief_complaint" "text", "p_history_present_illness" "text", "p_physical_examination" "text", "p_assessment_diagnosis" "text", "p_plan_treatment" "text", "p_prescriptions" "jsonb", "p_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_consultation"("p_consultation_id" "uuid", "p_chief_complaint" "text", "p_history_present_illness" "text", "p_physical_examination" "text", "p_assessment_diagnosis" "text", "p_plan_treatment" "text", "p_prescriptions" "jsonb", "p_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_consultation"("p_consultation_id" "uuid", "p_chief_complaint" "text", "p_history_present_illness" "text", "p_physical_examination" "text", "p_assessment_diagnosis" "text", "p_plan_treatment" "text", "p_prescriptions" "jsonb", "p_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_patient"("p_patient_id" "uuid", "p_name" "text", "p_phone" "text", "p_email" "text", "p_medical_id" "text", "p_gender" "text", "p_address" "text", "p_date_of_birth" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."update_patient"("p_patient_id" "uuid", "p_name" "text", "p_phone" "text", "p_email" "text", "p_medical_id" "text", "p_gender" "text", "p_address" "text", "p_date_of_birth" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_patient"("p_patient_id" "uuid", "p_name" "text", "p_phone" "text", "p_email" "text", "p_medical_id" "text", "p_gender" "text", "p_address" "text", "p_date_of_birth" "date") TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON FUNCTION "public"."update_profile"("p_user_id" "uuid", "p_name" "text", "p_email" "text", "p_phone" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_profile"("p_user_id" "uuid", "p_name" "text", "p_email" "text", "p_phone" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_profile"("p_user_id" "uuid", "p_name" "text", "p_email" "text", "p_phone" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_profile_image"("p_user_id" "uuid", "p_avatar_url" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_profile_image"("p_user_id" "uuid", "p_avatar_url" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_profile_image"("p_user_id" "uuid", "p_avatar_url" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_bill_items"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_bill_items"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_bill_items"() TO "service_role";


















GRANT ALL ON TABLE "public"."appointment_billing" TO "anon";
GRANT ALL ON TABLE "public"."appointment_billing" TO "authenticated";
GRANT ALL ON TABLE "public"."appointment_billing" TO "service_role";



GRANT ALL ON TABLE "public"."appointments" TO "anon";
GRANT ALL ON TABLE "public"."appointments" TO "authenticated";
GRANT ALL ON TABLE "public"."appointments" TO "service_role";



GRANT ALL ON TABLE "public"."bills" TO "anon";
GRANT ALL ON TABLE "public"."bills" TO "authenticated";
GRANT ALL ON TABLE "public"."bills" TO "service_role";



GRANT ALL ON TABLE "public"."clinic_credits" TO "anon";
GRANT ALL ON TABLE "public"."clinic_credits" TO "authenticated";
GRANT ALL ON TABLE "public"."clinic_credits" TO "service_role";



GRANT ALL ON TABLE "public"."clinic_departments" TO "anon";
GRANT ALL ON TABLE "public"."clinic_departments" TO "authenticated";
GRANT ALL ON TABLE "public"."clinic_departments" TO "service_role";



GRANT ALL ON TABLE "public"."clinic_members" TO "anon";
GRANT ALL ON TABLE "public"."clinic_members" TO "authenticated";
GRANT ALL ON TABLE "public"."clinic_members" TO "service_role";



GRANT ALL ON TABLE "public"."clinics" TO "anon";
GRANT ALL ON TABLE "public"."clinics" TO "authenticated";
GRANT ALL ON TABLE "public"."clinics" TO "service_role";



GRANT ALL ON TABLE "public"."consultations" TO "anon";
GRANT ALL ON TABLE "public"."consultations" TO "authenticated";
GRANT ALL ON TABLE "public"."consultations" TO "service_role";



GRANT ALL ON TABLE "public"."contact_messages" TO "anon";
GRANT ALL ON TABLE "public"."contact_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_messages" TO "service_role";



GRANT ALL ON TABLE "public"."department_types" TO "anon";
GRANT ALL ON TABLE "public"."department_types" TO "authenticated";
GRANT ALL ON TABLE "public"."department_types" TO "service_role";



GRANT ALL ON TABLE "public"."doctors" TO "anon";
GRANT ALL ON TABLE "public"."doctors" TO "authenticated";
GRANT ALL ON TABLE "public"."doctors" TO "service_role";



GRANT ALL ON TABLE "public"."medicines" TO "anon";
GRANT ALL ON TABLE "public"."medicines" TO "authenticated";
GRANT ALL ON TABLE "public"."medicines" TO "service_role";



GRANT ALL ON SEQUENCE "public"."medicines_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."medicines_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."medicines_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."monthly_billing_cycles" TO "anon";
GRANT ALL ON TABLE "public"."monthly_billing_cycles" TO "authenticated";
GRANT ALL ON TABLE "public"."monthly_billing_cycles" TO "service_role";



GRANT ALL ON TABLE "public"."patients" TO "anon";
GRANT ALL ON TABLE "public"."patients" TO "authenticated";
GRANT ALL ON TABLE "public"."patients" TO "service_role";



GRANT ALL ON TABLE "public"."payment_transactions" TO "anon";
GRANT ALL ON TABLE "public"."payment_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."prescriptions" TO "anon";
GRANT ALL ON TABLE "public"."prescriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."prescriptions" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";



























RESET ALL;
