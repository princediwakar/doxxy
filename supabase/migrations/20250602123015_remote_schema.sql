

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


CREATE OR REPLACE FUNCTION "public"."add_clinic_member"("new_user_id" "uuid", "target_clinic_id" "uuid", "new_role" "public"."user_role", "new_department_id" "uuid" DEFAULT NULL::"uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Check if the user and clinic exist (optional, but good practice)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = new_user_id) THEN
        RAISE EXCEPTION 'User with ID % does not exist.', new_user_id;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.clinics WHERE id = target_clinic_id) THEN
        RAISE EXCEPTION 'Clinic with ID % does not exist.', target_clinic_id;
    END IF;

    -- Insert the new clinic member
    INSERT INTO public.clinic_members (user_id, clinic_id, role, department_id)
    VALUES (new_user_id, target_clinic_id, new_role, new_department_id);
END;
$$;


ALTER FUNCTION "public"."add_clinic_member"("new_user_id" "uuid", "target_clinic_id" "uuid", "new_role" "public"."user_role", "new_department_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_appointments_with_details_by_clinic"("clinic_id" "uuid") RETURNS TABLE("id" "uuid", "patient_id" "uuid", "doctor_id" "uuid", "date" "date", "time" character varying, "type" character varying, "status" character varying, "notes" "text", "created_at" timestamp with time zone, "patient_name" character varying, "doctor_name" character varying, "department_name" character varying)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
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
    p.name AS patient_name,
    d.name AS doctor_name,
    dt.name AS department_name
  FROM
    public.appointments a
  JOIN
    public.patients p ON a.patient_id = p.id
  JOIN
    public.doctors d ON a.doctor_id = d.id
  JOIN -- Join clinic_members to get the doctor's clinic role and department
    public.clinic_members cm ON d.id = cm.user_id
  LEFT JOIN -- Use LEFT JOIN in case clinic_member has no department
    public.clinic_departments cd ON cm.department_id = cd.id
  LEFT JOIN -- Use LEFT JOIN in case clinic_department has no type
    public.department_types dt ON cd.department_type_id = dt.id
  WHERE
    a.clinic_id = get_appointments_with_details_by_clinic.clinic_id
    AND cm.clinic_id = get_appointments_with_details_by_clinic.clinic_id;
$$;


ALTER FUNCTION "public"."get_appointments_with_details_by_clinic"("clinic_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dashboard_data"("_clinic_id" "uuid") RETURNS TABLE("total_patients" bigint, "total_doctors" bigint, "appointments_today" bigint, "all_relevant_appointments" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
    today_date DATE := CURRENT_DATE;
    seven_days_ago_date DATE := CURRENT_DATE - INTERVAL '7 days';
    _total_patients BIGINT;
    _total_doctors BIGINT;
    _appointments_today BIGINT;
    _all_relevant_appointments JSONB;
BEGIN
    SELECT COUNT(*) INTO _total_patients
    FROM patients
    WHERE clinic_id = _clinic_id;

    SELECT COUNT(DISTINCT cm.user_id) INTO _total_doctors
    FROM public.clinic_members cm
    JOIN public.doctors d ON cm.user_id = d.user_id
    WHERE cm.clinic_id = _clinic_id AND cm.role = 'doctor';

    SELECT COUNT(*) INTO _appointments_today
    FROM appointments
    WHERE clinic_id = _clinic_id AND date = today_date;

    SELECT jsonb_agg(jsonb_build_object(
        'id', a.id,
        'date', a.date,
        'time', a.time,
        'type', a.type,
        'status', a.status,
        'patient_id', p.id,
        'patient_name', p.name,
        'doctor_id', d.id,
        'doctor_name', d.name
    ))
    INTO _all_relevant_appointments
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN doctors d ON a.doctor_id = d.id
    WHERE a.clinic_id = _clinic_id AND a.date >= seven_days_ago_date;

    RETURN QUERY
    SELECT
        _total_patients,
        _total_doctors,
        _appointments_today,
        _all_relevant_appointments;
END;$$;


ALTER FUNCTION "public"."get_dashboard_data"("_clinic_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_doctors_by_clinic"("clinic_id" "uuid") RETURNS TABLE("id" "uuid", "name" "text", "email" "text", "phone" "text", "availability" "text", "bio" "text", "created_at" timestamp with time zone, "role" "public"."user_role", "department_name" "text", "department_id" "uuid")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT
    d.id,
    p.name,
    p.email,
    d.phone,
    d.availability,
    d.bio,
    p.created_at,
    cm.role::public.user_role,
    dt.name AS department_name,
    cm.department_id
  FROM
    public.doctors d
  JOIN
    public.profiles p ON d.user_id = p.id
  LEFT JOIN
    public.clinic_members cm ON d.user_id = cm.user_id AND d.clinic_id = cm.clinic_id AND cm.role = 'doctor'
  LEFT JOIN
    public.clinic_departments cd ON cm.department_id = cd.id
  LEFT JOIN
    public.department_types dt ON cd.department_type_id = dt.id
  WHERE d.clinic_id = get_doctors_by_clinic.clinic_id;
$$;


ALTER FUNCTION "public"."get_doctors_by_clinic"("clinic_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_patients_by_clinic"("_clinic_id" "uuid", "_limit" integer DEFAULT 10, "_offset" integer DEFAULT 0) RETURNS TABLE("id" "uuid", "clinic_id" "uuid", "created_at" timestamp with time zone, "date_of_birth" "date", "email" "text", "gender" "text", "medical_id" "text", "name" "text", "phone" "text", "address" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.clinic_id,
        p.created_at,
        p.date_of_birth,
        p.email,
        p.gender,
        p.medical_id,
        p.name,
        p.phone,
        p.address
    FROM
        patients p
    WHERE
        p.clinic_id = _clinic_id -- Use the renamed function argument
    ORDER BY
        p.created_at DESC -- Or another relevant column like p.name
    LIMIT _limit
    OFFSET _offset;
END;
$$;


ALTER FUNCTION "public"."get_patients_by_clinic"("_clinic_id" "uuid", "_limit" integer, "_offset" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name) -- Remove 'role', Add 'name'
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name'); -- Get name from new user's metadata
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_auth_uid"("uid" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  PERFORM set_config('request.jwt.claims', '{"sub":"' || uid::text || '"}', true);
END;
$$;


ALTER FUNCTION "public"."set_auth_uid"("uid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_clinic_member_details"("member_user_id" "uuid", "target_clinic_id" "uuid", "updated_role" "public"."user_role" DEFAULT NULL::"public"."user_role", "updated_department_id" "uuid" DEFAULT NULL::"uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Check if the clinic member exists
    IF NOT EXISTS (
        SELECT 1
        FROM public.clinic_members
        WHERE user_id = member_user_id
        AND clinic_id = target_clinic_id
    ) THEN
        RAISE EXCEPTION 'Clinic member with User ID % and Clinic ID % not found.', member_user_id, target_clinic_id;
    END IF;

    -- Update the clinic member details
    UPDATE public.clinic_members
    SET
        role = COALESCE(updated_role, role), -- Update role if provided, otherwise keep current
        department_id = COALESCE(updated_department_id, department_id) -- Update department_id if provided, otherwise keep current
    WHERE user_id = member_user_id
    AND clinic_id = target_clinic_id;
END;
$$;


ALTER FUNCTION "public"."update_clinic_member_details"("member_user_id" "uuid", "target_clinic_id" "uuid", "updated_role" "public"."user_role", "updated_department_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."appointments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "doctor_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "time" "text" NOT NULL,
    "type" "text" NOT NULL,
    "status" "text" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "appointments_status_check" CHECK (("status" = ANY (ARRAY['Scheduled'::"text", 'In Progress'::"text", 'Completed'::"text", 'Cancelled'::"text"]))),
    CONSTRAINT "appointments_type_check" CHECK (("type" = ANY (ARRAY['Walk-in'::"text", 'Digital'::"text"])))
);


ALTER TABLE "public"."appointments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bills" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "appointment_id" "uuid",
    "amount" numeric NOT NULL,
    "status" "text" DEFAULT 'Pending'::"text" NOT NULL,
    "invoice_number" "text",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "bills_status_check" CHECK (("status" = ANY (ARRAY['Paid'::"text", 'Pending'::"text", 'Overdue'::"text"])))
);


ALTER TABLE "public"."bills" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clinic_departments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "department_type_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."clinic_departments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clinic_members" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'staff'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "department_id" "uuid",
    CONSTRAINT "clinic_members_role_check" CHECK (("role" = ANY (ARRAY['superadmin'::"text", 'staff'::"text", 'doctor'::"text"])))
);


ALTER TABLE "public"."clinic_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clinics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid" NOT NULL,
    "address" "text",
    "phone" "text",
    "email" "text",
    "website" "text"
);


ALTER TABLE "public"."clinics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."consultations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "appointment_id" "uuid",
    "patient_id" "uuid" NOT NULL,
    "doctor_id" "uuid" NOT NULL,
    "clinical_notes" "jsonb",
    "specialty_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."consultations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."department_types" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."department_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."doctors" (
    "id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "availability" "text" DEFAULT 'Available'::"text",
    "bio" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "clinic_id" "uuid",
    "user_id" "uuid"
);


ALTER TABLE "public"."doctors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."medical_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "chief_complaint" "text",
    "diagnosis" "text",
    "notes" "text",
    "symptoms" "text",
    "treatment_plan" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."medical_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patients" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "address" "text",
    "date_of_birth" "date",
    "gender" "text",
    "medical_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."patients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prescriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "consultation_id" "uuid",
    "medical_record_id" "uuid",
    "patient_id" "uuid" NOT NULL,
    "doctor_id" "uuid" NOT NULL,
    "medications" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "instructions" "text",
    "follow_up_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."prescriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "email" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bills"
    ADD CONSTRAINT "bills_invoice_number_key" UNIQUE ("invoice_number");



ALTER TABLE ONLY "public"."bills"
    ADD CONSTRAINT "bills_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clinic_departments"
    ADD CONSTRAINT "clinic_departments_clinic_id_department_type_id_key" UNIQUE ("clinic_id", "department_type_id");



ALTER TABLE ONLY "public"."clinic_departments"
    ADD CONSTRAINT "clinic_departments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clinic_members"
    ADD CONSTRAINT "clinic_members_clinic_id_user_id_key" UNIQUE ("clinic_id", "user_id");



ALTER TABLE ONLY "public"."clinic_members"
    ADD CONSTRAINT "clinic_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."clinics"
    ADD CONSTRAINT "clinics_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."clinics"
    ADD CONSTRAINT "clinics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."consultations"
    ADD CONSTRAINT "consultations_appointment_id_key" UNIQUE ("appointment_id");



ALTER TABLE ONLY "public"."consultations"
    ADD CONSTRAINT "consultations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."department_types"
    ADD CONSTRAINT "department_types_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."department_types"
    ADD CONSTRAINT "department_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."doctors"
    ADD CONSTRAINT "doctors_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."doctors"
    ADD CONSTRAINT "doctors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."medical_records"
    ADD CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_medical_id_key" UNIQUE ("medical_id");



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prescriptions"
    ADD CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_doctors_clinic_id" ON "public"."doctors" USING "btree" ("clinic_id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bills"
    ADD CONSTRAINT "bills_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bills"
    ADD CONSTRAINT "bills_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bills"
    ADD CONSTRAINT "bills_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clinic_departments"
    ADD CONSTRAINT "clinic_departments_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clinic_departments"
    ADD CONSTRAINT "clinic_departments_department_type_id_fkey" FOREIGN KEY ("department_type_id") REFERENCES "public"."department_types"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clinic_members"
    ADD CONSTRAINT "clinic_members_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clinic_members"
    ADD CONSTRAINT "clinic_members_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."clinic_departments"("id");



ALTER TABLE ONLY "public"."clinic_members"
    ADD CONSTRAINT "clinic_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clinics"
    ADD CONSTRAINT "clinics_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."consultations"
    ADD CONSTRAINT "consultations_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."consultations"
    ADD CONSTRAINT "consultations_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."consultations"
    ADD CONSTRAINT "consultations_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."consultations"
    ADD CONSTRAINT "consultations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."doctors"
    ADD CONSTRAINT "doctors_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id");



ALTER TABLE ONLY "public"."doctors"
    ADD CONSTRAINT "doctors_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."doctors"
    ADD CONSTRAINT "doctors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."medical_records"
    ADD CONSTRAINT "medical_records_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."medical_records"
    ADD CONSTRAINT "medical_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."prescriptions"
    ADD CONSTRAINT "prescriptions_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."prescriptions"
    ADD CONSTRAINT "prescriptions_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."prescriptions"
    ADD CONSTRAINT "prescriptions_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."prescriptions"
    ADD CONSTRAINT "prescriptions_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "public"."medical_records"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."prescriptions"
    ADD CONSTRAINT "prescriptions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow authenticated users to view clinics they are members of" ON "public"."clinics" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."clinic_members" "cm"
  WHERE (("cm"."clinic_id" = "clinics"."id") AND ("cm"."user_id" = "auth"."uid"())))));



CREATE POLICY "Allow authenticated users to view doctors in their clinic" ON "public"."doctors" FOR SELECT TO "authenticated" USING (("clinic_id" IN ( SELECT "cm"."clinic_id"
   FROM "public"."clinic_members" "cm"
  WHERE ("cm"."user_id" = "auth"."uid"()))));



CREATE POLICY "Allow authenticated users to view profiles for clinic members" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."clinic_members" "cm"
  WHERE (("cm"."user_id" = "profiles"."id") AND ("cm"."clinic_id" IN ( SELECT "cm2"."clinic_id"
           FROM "public"."clinic_members" "cm2"
          WHERE ("cm2"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Allow clinic members to view doctors in their clinic" ON "public"."doctors" FOR SELECT TO "authenticated" USING (("clinic_id" IN ( SELECT "clinic_members"."clinic_id"
   FROM "public"."clinic_members"
  WHERE ("clinic_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Allow clinic members to view profiles in their clinic" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."clinic_members" "cm"
  WHERE (("cm"."user_id" = "profiles"."id") AND ("cm"."clinic_id" IN ( SELECT "clinic_members"."clinic_id"
           FROM "public"."clinic_members"
          WHERE ("clinic_members"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Allow public read on department_types" ON "public"."department_types" FOR SELECT USING (true);



ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "authenticated_appointments_delete" ON "public"."appointments" FOR DELETE TO "authenticated" USING (("clinic_id" IN ( SELECT "clinic_members"."clinic_id"
   FROM "public"."clinic_members"
  WHERE ("clinic_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "authenticated_appointments_insert" ON "public"."appointments" FOR INSERT TO "authenticated" WITH CHECK (("clinic_id" IN ( SELECT "clinic_members"."clinic_id"
   FROM "public"."clinic_members"
  WHERE ("clinic_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "authenticated_appointments_select" ON "public"."appointments" FOR SELECT TO "authenticated" USING (("clinic_id" IN ( SELECT "clinic_members"."clinic_id"
   FROM "public"."clinic_members"
  WHERE ("clinic_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "authenticated_appointments_update" ON "public"."appointments" FOR UPDATE TO "authenticated" USING (("clinic_id" IN ( SELECT "clinic_members"."clinic_id"
   FROM "public"."clinic_members"
  WHERE ("clinic_members"."user_id" = "auth"."uid"())))) WITH CHECK (("clinic_id" IN ( SELECT "clinic_members"."clinic_id"
   FROM "public"."clinic_members"
  WHERE ("clinic_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "authenticated_clinic_members_insert" ON "public"."clinic_members" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "authenticated_clinic_members_select" ON "public"."clinic_members" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "clinic_data_access" ON "public"."appointments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."clinic_members"
  WHERE (("clinic_members"."user_id" = "auth"."uid"()) AND ("clinic_members"."clinic_id" = "appointments"."clinic_id")))));



CREATE POLICY "clinic_data_access" ON "public"."clinic_departments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."clinic_members"
  WHERE (("clinic_members"."user_id" = "auth"."uid"()) AND ("clinic_members"."clinic_id" = "clinic_departments"."clinic_id")))));



CREATE POLICY "clinic_data_access" ON "public"."medical_records" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."clinic_members"
  WHERE (("clinic_members"."user_id" = "auth"."uid"()) AND ("clinic_members"."clinic_id" = "medical_records"."clinic_id")))));



CREATE POLICY "clinic_data_access" ON "public"."patients" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."clinic_members"
  WHERE (("clinic_members"."user_id" = "auth"."uid"()) AND ("clinic_members"."clinic_id" = "patients"."clinic_id")))));



CREATE POLICY "clinic_data_access" ON "public"."prescriptions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."clinic_members"
  WHERE (("clinic_members"."user_id" = "auth"."uid"()) AND ("clinic_members"."clinic_id" = "prescriptions"."clinic_id")))));



CREATE POLICY "clinic_data_delete" ON "public"."appointments" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."clinic_members"
  WHERE (("clinic_members"."user_id" = "auth"."uid"()) AND ("clinic_members"."clinic_id" = "appointments"."clinic_id")))));



CREATE POLICY "clinic_data_delete" ON "public"."clinic_departments" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."clinic_members"
  WHERE (("clinic_members"."user_id" = "auth"."uid"()) AND ("clinic_members"."clinic_id" = "clinic_departments"."clinic_id")))));



CREATE POLICY "clinic_data_delete" ON "public"."medical_records" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."clinic_members"
  WHERE (("clinic_members"."user_id" = "auth"."uid"()) AND ("clinic_members"."clinic_id" = "medical_records"."clinic_id")))));



CREATE POLICY "clinic_data_delete" ON "public"."patients" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."clinic_members"
  WHERE (("clinic_members"."user_id" = "auth"."uid"()) AND ("clinic_members"."clinic_id" = "patients"."clinic_id")))));



CREATE POLICY "clinic_data_delete" ON "public"."prescriptions" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."clinic_members"
  WHERE (("clinic_members"."user_id" = "auth"."uid"()) AND ("clinic_members"."clinic_id" = "prescriptions"."clinic_id")))));



CREATE POLICY "clinic_data_insert" ON "public"."appointments" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."clinic_members"
  WHERE (("clinic_members"."user_id" = "auth"."uid"()) AND ("clinic_members"."clinic_id" = "appointments"."clinic_id")))));



CREATE POLICY "clinic_data_insert" ON "public"."clinic_departments" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."clinic_members"
  WHERE (("clinic_members"."user_id" = "auth"."uid"()) AND ("clinic_members"."clinic_id" = "clinic_departments"."clinic_id")))));



CREATE POLICY "clinic_data_insert" ON "public"."medical_records" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."clinic_members"
  WHERE (("clinic_members"."user_id" = "auth"."uid"()) AND ("clinic_members"."clinic_id" = "medical_records"."clinic_id")))));



CREATE POLICY "clinic_data_insert" ON "public"."patients" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."clinic_members"
  WHERE (("clinic_members"."user_id" = "auth"."uid"()) AND ("clinic_members"."clinic_id" = "patients"."clinic_id")))));



CREATE POLICY "clinic_data_insert" ON "public"."prescriptions" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."clinic_members"
  WHERE (("clinic_members"."user_id" = "auth"."uid"()) AND ("clinic_members"."clinic_id" = "prescriptions"."clinic_id")))));



CREATE POLICY "clinic_data_update" ON "public"."appointments" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."clinic_members"
  WHERE (("clinic_members"."user_id" = "auth"."uid"()) AND ("clinic_members"."clinic_id" = "appointments"."clinic_id")))));



CREATE POLICY "clinic_data_update" ON "public"."clinic_departments" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."clinic_members"
  WHERE (("clinic_members"."user_id" = "auth"."uid"()) AND ("clinic_members"."clinic_id" = "clinic_departments"."clinic_id")))));



CREATE POLICY "clinic_data_update" ON "public"."medical_records" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."clinic_members"
  WHERE (("clinic_members"."user_id" = "auth"."uid"()) AND ("clinic_members"."clinic_id" = "medical_records"."clinic_id")))));



CREATE POLICY "clinic_data_update" ON "public"."patients" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."clinic_members"
  WHERE (("clinic_members"."user_id" = "auth"."uid"()) AND ("clinic_members"."clinic_id" = "patients"."clinic_id")))));



CREATE POLICY "clinic_data_update" ON "public"."prescriptions" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."clinic_members"
  WHERE (("clinic_members"."user_id" = "auth"."uid"()) AND ("clinic_members"."clinic_id" = "prescriptions"."clinic_id")))));



ALTER TABLE "public"."clinic_departments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."clinic_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."doctors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."medical_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."prescriptions" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."add_clinic_member"("new_user_id" "uuid", "target_clinic_id" "uuid", "new_role" "public"."user_role", "new_department_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."add_clinic_member"("new_user_id" "uuid", "target_clinic_id" "uuid", "new_role" "public"."user_role", "new_department_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_clinic_member"("new_user_id" "uuid", "target_clinic_id" "uuid", "new_role" "public"."user_role", "new_department_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_appointments_with_details_by_clinic"("clinic_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_appointments_with_details_by_clinic"("clinic_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_appointments_with_details_by_clinic"("clinic_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_dashboard_data"("_clinic_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_dashboard_data"("_clinic_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dashboard_data"("_clinic_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_doctors_by_clinic"("clinic_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_doctors_by_clinic"("clinic_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_doctors_by_clinic"("clinic_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_patients_by_clinic"("_clinic_id" "uuid", "_limit" integer, "_offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_patients_by_clinic"("_clinic_id" "uuid", "_limit" integer, "_offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_patients_by_clinic"("_clinic_id" "uuid", "_limit" integer, "_offset" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_auth_uid"("uid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."set_auth_uid"("uid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_auth_uid"("uid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_clinic_member_details"("member_user_id" "uuid", "target_clinic_id" "uuid", "updated_role" "public"."user_role", "updated_department_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."update_clinic_member_details"("member_user_id" "uuid", "target_clinic_id" "uuid", "updated_role" "public"."user_role", "updated_department_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_clinic_member_details"("member_user_id" "uuid", "target_clinic_id" "uuid", "updated_role" "public"."user_role", "updated_department_id" "uuid") TO "service_role";


















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



GRANT ALL ON TABLE "public"."medical_records" TO "anon";
GRANT ALL ON TABLE "public"."medical_records" TO "authenticated";
GRANT ALL ON TABLE "public"."medical_records" TO "service_role";



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
