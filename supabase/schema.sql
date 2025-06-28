

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


CREATE OR REPLACE FUNCTION "public"."create_doctor_profile"("p_user_id" "uuid", "p_clinic_id" "uuid", "p_name" "text", "p_email" "text" DEFAULT NULL::"text", "p_primary_specialization" "text" DEFAULT 'General Medicine'::"text", "p_consultation_fee" numeric DEFAULT 500, "p_availability" "text" DEFAULT 'Mon-Fri 9:00 AM - 5:00 PM'::"text", "p_bio" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    new_doctor_id uuid;
    user_profile profiles%ROWTYPE;
BEGIN
    -- Get user profile information
    SELECT * INTO user_profile FROM profiles WHERE id = p_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found for user_id: %', p_user_id;
    END IF;
    
    -- Ensure user is a member of the clinic first
    INSERT INTO clinic_members (user_id, clinic_id, role)
    VALUES (p_user_id, p_clinic_id, 'doctor')
    ON CONFLICT (user_id, clinic_id) 
    DO UPDATE SET role = EXCLUDED.role;
    
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
END;
$$;


ALTER FUNCTION "public"."create_doctor_profile"("p_user_id" "uuid", "p_clinic_id" "uuid", "p_name" "text", "p_email" "text", "p_primary_specialization" "text", "p_consultation_fee" numeric, "p_availability" "text", "p_bio" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_doctor_profile"("p_user_id" "uuid", "p_clinic_id" "uuid", "p_name" "text", "p_email" "text" DEFAULT NULL::"text", "p_primary_specialization" "text" DEFAULT 'General Medicine'::"text", "p_consultation_fee" numeric DEFAULT 500, "p_availability" "text" DEFAULT 'Mon-Fri 9:00 AM - 5:00 PM'::"text", "p_bio" "text" DEFAULT NULL::"text", "p_department_id" "uuid" DEFAULT NULL::"uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    new_doctor_id uuid;
    user_profile profiles%ROWTYPE;
BEGIN
    -- Get user profile information
    SELECT * INTO user_profile FROM profiles WHERE id = p_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found for user_id: %', p_user_id;
    END IF;
    
    -- Ensure user is a member of the clinic first
    INSERT INTO clinic_members (user_id, clinic_id, role, department_id)
    VALUES (p_user_id, p_clinic_id, 'doctor', p_department_id)
    ON CONFLICT (user_id, clinic_id) 
    DO UPDATE SET role = EXCLUDED.role, department_id = EXCLUDED.department_id;
    
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
END;
$$;


ALTER FUNCTION "public"."create_doctor_profile"("p_user_id" "uuid", "p_clinic_id" "uuid", "p_name" "text", "p_email" "text", "p_primary_specialization" "text", "p_consultation_fee" numeric, "p_availability" "text", "p_bio" "text", "p_department_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_profile_for_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    new.id, 
    new.email,
    COALESCE(
      (new.raw_user_meta_data->>'name')::text,
      (new.raw_user_meta_data->>'full_name')::text,
      new.email
    )
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    email = EXCLUDED.email,
    name = EXCLUDED.name
  WHERE profiles.name IS NULL;
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."create_profile_for_new_user"() OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."get_appointments_with_details_by_clinic"("clinic_id" "uuid") RETURNS TABLE("id" "uuid", "patient_id" "uuid", "doctor_id" "uuid", "date" "text", "time" "text", "type" "public"."appointment_type", "status" "public"."appointment_status", "notes" "text", "created_at" timestamp with time zone, "patient_name" "text", "doctor_name" "text", "department_name" "text", "billing_status" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.patient_id,
    a.doctor_id,
    a.date,
    a."time",
    a.type,
    a.status,
    a.notes,
    a.created_at,
    p.name as patient_name,
    COALESCE(d.name, prof.name) as doctor_name,
    COALESCE(dt.name, 'General') as department_name,
    COALESCE(
      CASE 
        WHEN b.status = 'Paid'::bill_status THEN 'Paid'
        WHEN b.status = 'Overdue'::bill_status THEN 'Overdue'
        WHEN b.status = 'Pending'::bill_status THEN 'Pending'
        ELSE 'Pending'
      END,
      'Pending'
    ) as billing_status
  FROM appointments a
  LEFT JOIN patients p ON a.patient_id = p.id
  LEFT JOIN doctors d ON a.doctor_id = d.id
  LEFT JOIN profiles prof ON d.user_id = prof.id
  LEFT JOIN clinic_members cm ON d.user_id = cm.user_id AND a.clinic_id = cm.clinic_id
  LEFT JOIN clinic_departments cd ON cm.department_id = cd.id
  LEFT JOIN department_types dt ON cd.department_type_id = dt.id
  LEFT JOIN bills b ON a.id = b.appointment_id
  WHERE a.clinic_id = get_appointments_with_details_by_clinic.clinic_id
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


CREATE OR REPLACE FUNCTION "public"."get_doctors_by_clinic"("clinic_id" "uuid") RETURNS TABLE("id" "uuid", "user_id" "uuid", "name" "text", "email" "text", "phone" "text", "bio" "text", "created_at" timestamp with time zone, "role" "text", "department_name" "text", "department_id" "uuid", "is_active" boolean, "primary_specialization" "text", "medical_specializations" "text"[], "years_of_experience" integer, "consultation_fee" numeric, "languages_spoken" "text"[], "practice_timings" "jsonb", "professional_summary" "text", "medical_registration_number" "text", "medical_qualifications" "text"[], "medical_council" "text", "medical_license_state" "text", "medical_license_expiry" "date", "subspecialty" "text"[], "board_certifications" "text"[], "fellowship_details" "text", "medical_college" "text", "graduation_year" integer, "clinic_timings" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.user_id,
    COALESCE(d.name, p.name) as name,
    COALESCE(d.email, p.email) as email,
    COALESCE(d.phone, p.phone) as phone,
    d.bio,
    d.created_at,
    cm.role::text,
    COALESCE(dt.name, 'General Medicine') as department_name,
    cm.department_id,
    d.is_active,
    d.primary_specialization,
    d.medical_specializations,
    d.years_of_experience,
    d.consultation_fee,
    d.languages_spoken,
    d.practice_timings,
    d.professional_summary,
    d.medical_registration_number,
    d.medical_qualifications,
    d.medical_council,
    d.medical_license_state,
    d.medical_license_expiry,
    d.subspecialty,
    d.board_certifications,
    d.fellowship_details,
    d.medical_college,
    d.graduation_year,
    d.clinic_timings
  FROM doctors d
  JOIN profiles p ON d.user_id = p.id
  JOIN clinic_members cm ON d.user_id = cm.user_id AND d.clinic_id = cm.clinic_id
  LEFT JOIN clinic_departments cd ON cm.department_id = cd.id AND cd.clinic_id = d.clinic_id
  LEFT JOIN department_types dt ON cd.department_type_id = dt.id
  WHERE d.clinic_id = get_doctors_by_clinic.clinic_id
    AND d.is_active = true
  ORDER BY d.name;
END;
$$;


ALTER FUNCTION "public"."get_doctors_by_clinic"("clinic_id" "uuid") OWNER TO "postgres";


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

SET default_tablespace = '';

SET default_table_access_method = "heap";


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
    "invoice_number" "text",
    "service_items" "jsonb",
    "discount_percentage" numeric(5,2) DEFAULT 0,
    "tax_percentage" numeric(5,2) DEFAULT 0,
    "billing_type" "text" DEFAULT 'simple'::"text",
    "notes" "text",
    CONSTRAINT "bills_billing_type_check" CHECK (("billing_type" = ANY (ARRAY['simple'::"text", 'itemized'::"text"])))
);


ALTER TABLE "public"."bills" OWNER TO "postgres";


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
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
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
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."clinics" OWNER TO "postgres";


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
    "clinic_id" "uuid",
    "user_id" "uuid",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "consultation_fee" numeric,
    "primary_specialization" "text" DEFAULT 'General Medicine'::"text",
    "years_of_experience" integer,
    "languages_spoken" "text"[],
    "practice_timings" "jsonb",
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
    "research_experience" "text"
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


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "email" "text",
    "phone" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bills"
    ADD CONSTRAINT "bills_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clinic_departments"
    ADD CONSTRAINT "clinic_departments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clinic_members"
    ADD CONSTRAINT "clinic_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clinic_members"
    ADD CONSTRAINT "clinic_members_user_id_clinic_id_key" UNIQUE ("user_id", "clinic_id");



ALTER TABLE ONLY "public"."clinics"
    ADD CONSTRAINT "clinics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."consultations"
    ADD CONSTRAINT "consultations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."department_types"
    ADD CONSTRAINT "department_types_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."department_types"
    ADD CONSTRAINT "department_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."doctors"
    ADD CONSTRAINT "doctors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."medicines"
    ADD CONSTRAINT "medicines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_medical_id_clinic_id_key" UNIQUE ("medical_id", "clinic_id");



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prescriptions"
    ADD CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_appointments_clinic_id" ON "public"."appointments" USING "btree" ("clinic_id");



CREATE INDEX "idx_appointments_doctor_id" ON "public"."appointments" USING "btree" ("doctor_id");



CREATE INDEX "idx_appointments_patient_id" ON "public"."appointments" USING "btree" ("patient_id");



CREATE INDEX "idx_bills_appointment_id" ON "public"."bills" USING "btree" ("appointment_id");



CREATE INDEX "idx_bills_clinic_id" ON "public"."bills" USING "btree" ("clinic_id");



CREATE INDEX "idx_bills_patient_id" ON "public"."bills" USING "btree" ("patient_id");



CREATE INDEX "idx_clinic_departments_clinic_id" ON "public"."clinic_departments" USING "btree" ("clinic_id");



CREATE INDEX "idx_clinic_departments_department_type_id" ON "public"."clinic_departments" USING "btree" ("department_type_id");



CREATE INDEX "idx_clinic_members_clinic_id" ON "public"."clinic_members" USING "btree" ("clinic_id");



CREATE INDEX "idx_clinic_members_department_id" ON "public"."clinic_members" USING "btree" ("department_id");



CREATE INDEX "idx_clinic_members_user_id" ON "public"."clinic_members" USING "btree" ("user_id");



CREATE INDEX "idx_clinics_created_by" ON "public"."clinics" USING "btree" ("created_by");



CREATE INDEX "idx_consultations_appointment_id" ON "public"."consultations" USING "btree" ("appointment_id");



CREATE INDEX "idx_consultations_clinic_id" ON "public"."consultations" USING "btree" ("clinic_id");



CREATE INDEX "idx_consultations_doctor_id" ON "public"."consultations" USING "btree" ("doctor_id");



CREATE INDEX "idx_consultations_patient_id" ON "public"."consultations" USING "btree" ("patient_id");



CREATE INDEX "idx_doctors_clinic_id" ON "public"."doctors" USING "btree" ("clinic_id");



CREATE INDEX "idx_doctors_user_id" ON "public"."doctors" USING "btree" ("user_id");



CREATE INDEX "idx_patients_clinic_id" ON "public"."patients" USING "btree" ("clinic_id");



CREATE INDEX "idx_prescriptions_appointment_id" ON "public"."prescriptions" USING "btree" ("appointment_id");



CREATE INDEX "idx_prescriptions_clinic_id" ON "public"."prescriptions" USING "btree" ("clinic_id");



CREATE INDEX "idx_prescriptions_consultation_id" ON "public"."prescriptions" USING "btree" ("consultation_id");



CREATE INDEX "idx_prescriptions_doctor_id" ON "public"."prescriptions" USING "btree" ("doctor_id");



CREATE INDEX "idx_prescriptions_patient_id" ON "public"."prescriptions" USING "btree" ("patient_id");



CREATE OR REPLACE TRIGGER "trigger_ensure_doctor_clinic_member" AFTER INSERT OR UPDATE ON "public"."doctors" FOR EACH ROW WHEN (("new"."user_id" IS NOT NULL)) EXECUTE FUNCTION "public"."ensure_doctor_has_clinic_member"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



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



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



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



CREATE POLICY "allow_read_clinic_departments_safe" ON "public"."clinic_departments" FOR SELECT USING ((("auth"."uid"() IS NOT NULL) AND ((EXISTS ( SELECT 1
   FROM "public"."clinics" "c"
  WHERE (("c"."id" = "clinic_departments"."clinic_id") AND ("c"."created_by" = "auth"."uid"())))) OR ("clinic_id" IN ( SELECT "c"."id"
   FROM "public"."clinics" "c"
  WHERE ("c"."created_by" = "auth"."uid"()))))));



CREATE POLICY "allow_select_clinic_departments" ON "public"."clinic_departments" FOR SELECT USING (("clinic_id" IN ( SELECT "get_user_clinics"."clinic_id"
   FROM "public"."get_user_clinics"() "get_user_clinics"("clinic_id"))));



CREATE POLICY "allow_select_department_types" ON "public"."department_types" FOR SELECT USING (true);



ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bills" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clinic_departments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clinic_members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "clinic_members_delete_simple" ON "public"."clinic_members" FOR DELETE USING (("clinic_id" IN ( SELECT "c"."id"
   FROM "public"."clinics" "c"
  WHERE ("c"."created_by" = "auth"."uid"()))));



CREATE POLICY "clinic_members_insert_simple" ON "public"."clinic_members" FOR INSERT WITH CHECK ((("user_id" = "auth"."uid"()) OR ("clinic_id" IN ( SELECT "c"."id"
   FROM "public"."clinics" "c"
  WHERE ("c"."created_by" = "auth"."uid"())))));



CREATE POLICY "clinic_members_select_simple" ON "public"."clinic_members" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR ("clinic_id" IN ( SELECT "c"."id"
   FROM "public"."clinics" "c"
  WHERE ("c"."created_by" = "auth"."uid"())))));



CREATE POLICY "clinic_members_update_simple" ON "public"."clinic_members" FOR UPDATE USING ((("user_id" = "auth"."uid"()) OR ("clinic_id" IN ( SELECT "c"."id"
   FROM "public"."clinics" "c"
  WHERE ("c"."created_by" = "auth"."uid"())))));



ALTER TABLE "public"."clinics" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "clinics_insert" ON "public"."clinics" FOR INSERT WITH CHECK (true);



CREATE POLICY "clinics_select" ON "public"."clinics" FOR SELECT USING (true);



CREATE POLICY "clinics_update" ON "public"."clinics" FOR UPDATE USING (true);



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



CREATE POLICY "doctors_read_policy" ON "public"."doctors" FOR SELECT TO "authenticated" USING (("clinic_id" IN ( SELECT "cm"."clinic_id"
   FROM "public"."clinic_members" "cm"
  WHERE ("cm"."user_id" = "auth"."uid"()))));



CREATE POLICY "doctors_select_simple" ON "public"."doctors" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
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



ALTER TABLE "public"."patients" ENABLE ROW LEVEL SECURITY;


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


CREATE POLICY "profiles_own_profile" ON "public"."profiles" TO "authenticated" USING (("id" = "auth"."uid"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."create_clinic_with_admin"("clinic_name" "text", "user_phone" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_clinic_with_admin"("clinic_name" "text", "user_phone" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_clinic_with_admin"("clinic_name" "text", "user_phone" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_doctor_profile"("p_user_id" "uuid", "p_clinic_id" "uuid", "p_name" "text", "p_email" "text", "p_primary_specialization" "text", "p_consultation_fee" numeric, "p_availability" "text", "p_bio" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_doctor_profile"("p_user_id" "uuid", "p_clinic_id" "uuid", "p_name" "text", "p_email" "text", "p_primary_specialization" "text", "p_consultation_fee" numeric, "p_availability" "text", "p_bio" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_doctor_profile"("p_user_id" "uuid", "p_clinic_id" "uuid", "p_name" "text", "p_email" "text", "p_primary_specialization" "text", "p_consultation_fee" numeric, "p_availability" "text", "p_bio" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_doctor_profile"("p_user_id" "uuid", "p_clinic_id" "uuid", "p_name" "text", "p_email" "text", "p_primary_specialization" "text", "p_consultation_fee" numeric, "p_availability" "text", "p_bio" "text", "p_department_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_doctor_profile"("p_user_id" "uuid", "p_clinic_id" "uuid", "p_name" "text", "p_email" "text", "p_primary_specialization" "text", "p_consultation_fee" numeric, "p_availability" "text", "p_bio" "text", "p_department_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_doctor_profile"("p_user_id" "uuid", "p_clinic_id" "uuid", "p_name" "text", "p_email" "text", "p_primary_specialization" "text", "p_consultation_fee" numeric, "p_availability" "text", "p_bio" "text", "p_department_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_profile_for_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_profile_for_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_profile_for_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_doctor_has_clinic_member"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_doctor_has_clinic_member"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_doctor_has_clinic_member"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_appointments_with_details_by_clinic"("clinic_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_appointments_with_details_by_clinic"("clinic_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_appointments_with_details_by_clinic"("clinic_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_bills_by_clinic"("clinic_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_bills_by_clinic"("clinic_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_bills_by_clinic"("clinic_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_consultation_by_appointment"("p_appointment_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_consultation_by_appointment"("p_appointment_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_consultation_by_appointment"("p_appointment_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_dashboard_data"("_clinic_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_dashboard_data"("_clinic_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dashboard_data"("_clinic_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_doctor_dashboard_data"("_clinic_id" "uuid", "_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_doctor_dashboard_data"("_clinic_id" "uuid", "_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_doctor_dashboard_data"("_clinic_id" "uuid", "_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_doctors_by_clinic"("clinic_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_doctors_by_clinic"("clinic_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_doctors_by_clinic"("clinic_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_patients_by_clinic"("_clinic_id" "uuid", "_limit" integer, "_offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_patients_by_clinic"("_clinic_id" "uuid", "_limit" integer, "_offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_patients_by_clinic"("_clinic_id" "uuid", "_limit" integer, "_offset" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_clinic_memberships"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_clinic_memberships"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_clinic_memberships"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_clinics"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_clinics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_clinics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."search_medicines"("search_term" "text", "limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."search_medicines"("search_term" "text", "limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_medicines"("search_term" "text", "limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_bill_items"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_bill_items"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_bill_items"() TO "service_role";


















GRANT ALL ON TABLE "public"."appointments" TO "anon";
GRANT ALL ON TABLE "public"."appointments" TO "authenticated";
GRANT ALL ON TABLE "public"."appointments" TO "service_role";



GRANT ALL ON TABLE "public"."bills" TO "anon";
GRANT ALL ON TABLE "public"."bills" TO "authenticated";
GRANT ALL ON TABLE "public"."bills" TO "service_role";



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



GRANT ALL ON TABLE "public"."patients" TO "anon";
GRANT ALL ON TABLE "public"."patients" TO "authenticated";
GRANT ALL ON TABLE "public"."patients" TO "service_role";



GRANT ALL ON TABLE "public"."prescriptions" TO "anon";
GRANT ALL ON TABLE "public"."prescriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."prescriptions" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";









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
