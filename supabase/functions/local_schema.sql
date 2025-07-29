

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


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






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
    'doctor',
    'staff',
    'superadmin'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
      RAISE NOTICE 'Found pending invitation for %: % with department_id: %', user_email, existing_invitation.id, existing_invitation.department_id;
      
      -- Create clinic membership WITH department_id
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
      
      RAISE NOTICE 'Invitation processed successfully for % with role % and department %', user_email, existing_invitation.role, existing_invitation.department_id;
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
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."invite_user_by_email"("p_email" "text", "p_clinic_id" "uuid", "p_role" "public"."user_role" DEFAULT 'staff'::"public"."user_role", "p_name" "text" DEFAULT NULL::"text", "p_phone" "text" DEFAULT NULL::"text", "p_department_id" "uuid" DEFAULT NULL::"uuid") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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

  -- Insert or update pending invitation WITH department_id
  INSERT INTO public.pending_invitations (
    email,
    clinic_id,
    role,
    name,
    phone,
    department_id,
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
    p_department_id,
    NOW(),
    NOW(),
    NOW() + INTERVAL '30 days'
  )
  ON CONFLICT (email, clinic_id) 
  DO UPDATE SET
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    department_id = EXCLUDED.department_id,
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
$$;


ALTER FUNCTION "public"."invite_user_by_email"("p_email" "text", "p_clinic_id" "uuid", "p_role" "public"."user_role", "p_name" "text", "p_phone" "text", "p_department_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."appointment_billing" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "appointment_id" "uuid" NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "billing_type" character varying(50) NOT NULL,
    "amount" numeric(10,2) DEFAULT 10.00 NOT NULL,
    "credits_used" integer DEFAULT 1,
    "monthly_billing_cycle_id" "uuid",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
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
    "notes" "text"
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
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "department_type_id" "uuid" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."clinic_departments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clinic_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "role" "public"."user_role" DEFAULT 'staff'::"public"."user_role" NOT NULL,
    "department_id" "uuid",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."clinic_members" OWNER TO "postgres";


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


ALTER TABLE "public"."clinics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."consultations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "appointment_id" "uuid",
    "clinic_id" "uuid" NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "doctor_id" "uuid",
    "specialty_data" "jsonb",
    "clinical_notes" "jsonb",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."consultations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."department_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."department_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."departments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "department_type_id" "uuid" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."departments" OWNER TO "postgres";


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
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
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
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."payment_transactions" OWNER TO "postgres";


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


ALTER TABLE "public"."pending_invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prescriptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "doctor_id" "uuid" NOT NULL,
    "appointment_id" "uuid",
    "consultation_id" "uuid",
    "medications" "jsonb",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."prescriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "email" "text",
    "phone" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


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
    ADD CONSTRAINT "clinic_members_user_clinic_unique" UNIQUE ("user_id", "clinic_id");



ALTER TABLE ONLY "public"."clinics"
    ADD CONSTRAINT "clinics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."consultations"
    ADD CONSTRAINT "consultations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."department_types"
    ADD CONSTRAINT "department_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."doctors"
    ADD CONSTRAINT "doctors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."medicines"
    ADD CONSTRAINT "medicines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."monthly_billing_cycles"
    ADD CONSTRAINT "monthly_billing_cycles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_transactions"
    ADD CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pending_invitations"
    ADD CONSTRAINT "pending_invitations_email_clinic_id_key" UNIQUE ("email", "clinic_id");



ALTER TABLE ONLY "public"."pending_invitations"
    ADD CONSTRAINT "pending_invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prescriptions"
    ADD CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."doctors"
    ADD CONSTRAINT "unique_doctor_per_user_clinic" UNIQUE ("user_id", "clinic_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "unique_email" UNIQUE ("email");



CREATE INDEX "idx_appointment_billing_clinic_id" ON "public"."appointment_billing" USING "btree" ("clinic_id");



CREATE INDEX "idx_appointment_billing_monthly_cycle_id" ON "public"."appointment_billing" USING "btree" ("monthly_billing_cycle_id");



CREATE INDEX "idx_appointments_clinic_id" ON "public"."appointments" USING "btree" ("clinic_id");



CREATE INDEX "idx_appointments_date" ON "public"."appointments" USING "btree" ("date");



CREATE INDEX "idx_appointments_doctor_id" ON "public"."appointments" USING "btree" ("doctor_id");



CREATE INDEX "idx_appointments_patient_id" ON "public"."appointments" USING "btree" ("patient_id");



CREATE INDEX "idx_appointments_status" ON "public"."appointments" USING "btree" ("status");



CREATE INDEX "idx_bills_appointment_id" ON "public"."bills" USING "btree" ("appointment_id");



CREATE INDEX "idx_bills_clinic_id" ON "public"."bills" USING "btree" ("clinic_id");



CREATE INDEX "idx_bills_invoice_number" ON "public"."bills" USING "btree" ("invoice_number");



CREATE INDEX "idx_bills_patient_id" ON "public"."bills" USING "btree" ("patient_id");



CREATE INDEX "idx_bills_status" ON "public"."bills" USING "btree" ("status");



CREATE INDEX "idx_consultations_appointment_id" ON "public"."consultations" USING "btree" ("appointment_id");



CREATE INDEX "idx_consultations_clinic_id" ON "public"."consultations" USING "btree" ("clinic_id");



CREATE INDEX "idx_consultations_doctor_id" ON "public"."consultations" USING "btree" ("doctor_id");



CREATE INDEX "idx_consultations_patient_id" ON "public"."consultations" USING "btree" ("patient_id");



CREATE INDEX "idx_medicines_manufacturer" ON "public"."medicines" USING "btree" ("manufacturer_name");



CREATE INDEX "idx_medicines_name" ON "public"."medicines" USING "btree" ("name");



CREATE INDEX "idx_monthly_billing_cycles_billing_month" ON "public"."monthly_billing_cycles" USING "btree" ("billing_month");



CREATE INDEX "idx_monthly_billing_cycles_clinic_id" ON "public"."monthly_billing_cycles" USING "btree" ("clinic_id");



CREATE INDEX "idx_monthly_billing_cycles_payment_status" ON "public"."monthly_billing_cycles" USING "btree" ("payment_status");



CREATE INDEX "idx_patients_clinic_id" ON "public"."patients" USING "btree" ("clinic_id");



CREATE INDEX "idx_patients_email" ON "public"."patients" USING "btree" ("email");



CREATE INDEX "idx_patients_medical_id" ON "public"."patients" USING "btree" ("medical_id");



CREATE INDEX "idx_patients_phone" ON "public"."patients" USING "btree" ("phone");



CREATE INDEX "idx_payment_transactions_clinic_id" ON "public"."payment_transactions" USING "btree" ("clinic_id");



CREATE INDEX "idx_payment_transactions_razorpay_payment_id" ON "public"."payment_transactions" USING "btree" ("razorpay_payment_id");



CREATE INDEX "idx_payment_transactions_status" ON "public"."payment_transactions" USING "btree" ("payment_status");



CREATE INDEX "idx_prescriptions_appointment_id" ON "public"."prescriptions" USING "btree" ("appointment_id");



CREATE INDEX "idx_prescriptions_clinic_id" ON "public"."prescriptions" USING "btree" ("clinic_id");



CREATE INDEX "idx_prescriptions_consultation_id" ON "public"."prescriptions" USING "btree" ("consultation_id");



CREATE INDEX "idx_prescriptions_doctor_id" ON "public"."prescriptions" USING "btree" ("doctor_id");



CREATE INDEX "idx_prescriptions_patient_id" ON "public"."prescriptions" USING "btree" ("patient_id");



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
    ADD CONSTRAINT "clinic_departments_department_type_id_fkey" FOREIGN KEY ("department_type_id") REFERENCES "public"."department_types"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clinic_members"
    ADD CONSTRAINT "clinic_members_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clinic_members"
    ADD CONSTRAINT "clinic_members_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."clinic_departments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."clinic_members"
    ADD CONSTRAINT "clinic_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."consultations"
    ADD CONSTRAINT "consultations_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."consultations"
    ADD CONSTRAINT "consultations_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."consultations"
    ADD CONSTRAINT "consultations_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id");



ALTER TABLE ONLY "public"."consultations"
    ADD CONSTRAINT "consultations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_department_type_id_fkey" FOREIGN KEY ("department_type_id") REFERENCES "public"."department_types"("id") ON DELETE CASCADE;



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



ALTER TABLE ONLY "public"."pending_invitations"
    ADD CONSTRAINT "pending_invitations_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."prescriptions"
    ADD CONSTRAINT "prescriptions_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id");



ALTER TABLE ONLY "public"."prescriptions"
    ADD CONSTRAINT "prescriptions_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."prescriptions"
    ADD CONSTRAINT "prescriptions_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id");



ALTER TABLE ONLY "public"."prescriptions"
    ADD CONSTRAINT "prescriptions_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id");



ALTER TABLE ONLY "public"."prescriptions"
    ADD CONSTRAINT "prescriptions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE "public"."appointment_billing" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bills" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clinic_credits" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "clinic_isolation_appointment_billing" ON "public"."appointment_billing" USING (("clinic_id" IN ( SELECT "cm"."clinic_id"
   FROM "public"."clinic_members" "cm"
  WHERE ("cm"."user_id" = "auth"."uid"()))));



CREATE POLICY "clinic_isolation_appointments" ON "public"."appointments" USING (("clinic_id" IN ( SELECT "cm"."clinic_id"
   FROM "public"."clinic_members" "cm"
  WHERE ("cm"."user_id" = "auth"."uid"()))));



CREATE POLICY "clinic_isolation_bills" ON "public"."bills" USING (("clinic_id" IN ( SELECT "cm"."clinic_id"
   FROM "public"."clinic_members" "cm"
  WHERE ("cm"."user_id" = "auth"."uid"()))));



CREATE POLICY "clinic_isolation_clinic_credits" ON "public"."clinic_credits" USING (("clinic_id" IN ( SELECT "cm"."clinic_id"
   FROM "public"."clinic_members" "cm"
  WHERE ("cm"."user_id" = "auth"."uid"()))));



CREATE POLICY "clinic_isolation_consultations" ON "public"."consultations" USING (("clinic_id" IN ( SELECT "cm"."clinic_id"
   FROM "public"."clinic_members" "cm"
  WHERE ("cm"."user_id" = "auth"."uid"()))));



CREATE POLICY "clinic_isolation_monthly_billing_cycles" ON "public"."monthly_billing_cycles" USING (("clinic_id" IN ( SELECT "cm"."clinic_id"
   FROM "public"."clinic_members" "cm"
  WHERE ("cm"."user_id" = "auth"."uid"()))));



CREATE POLICY "clinic_isolation_patients" ON "public"."patients" USING (("clinic_id" IN ( SELECT "cm"."clinic_id"
   FROM "public"."clinic_members" "cm"
  WHERE ("cm"."user_id" = "auth"."uid"()))));



CREATE POLICY "clinic_isolation_payment_transactions" ON "public"."payment_transactions" USING (("clinic_id" IN ( SELECT "cm"."clinic_id"
   FROM "public"."clinic_members" "cm"
  WHERE ("cm"."user_id" = "auth"."uid"()))));



CREATE POLICY "clinic_isolation_prescriptions" ON "public"."prescriptions" USING (("clinic_id" IN ( SELECT "cm"."clinic_id"
   FROM "public"."clinic_members" "cm"
  WHERE ("cm"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."consultations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."medicines" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "medicines_read_access" ON "public"."medicines" FOR SELECT USING (true);



ALTER TABLE "public"."monthly_billing_cycles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."prescriptions" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";































































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."invite_user_by_email"("p_email" "text", "p_clinic_id" "uuid", "p_role" "public"."user_role", "p_name" "text", "p_phone" "text", "p_department_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."invite_user_by_email"("p_email" "text", "p_clinic_id" "uuid", "p_role" "public"."user_role", "p_name" "text", "p_phone" "text", "p_department_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."invite_user_by_email"("p_email" "text", "p_clinic_id" "uuid", "p_role" "public"."user_role", "p_name" "text", "p_phone" "text", "p_department_id" "uuid") TO "service_role";


















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



GRANT ALL ON TABLE "public"."department_types" TO "anon";
GRANT ALL ON TABLE "public"."department_types" TO "authenticated";
GRANT ALL ON TABLE "public"."department_types" TO "service_role";



GRANT ALL ON TABLE "public"."departments" TO "anon";
GRANT ALL ON TABLE "public"."departments" TO "authenticated";
GRANT ALL ON TABLE "public"."departments" TO "service_role";



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



GRANT ALL ON TABLE "public"."pending_invitations" TO "anon";
GRANT ALL ON TABLE "public"."pending_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."pending_invitations" TO "service_role";



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
