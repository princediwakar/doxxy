

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






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "public";






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
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    INSERT INTO clinic_members (user_id, clinic_id, role, department_id)
    VALUES (new_user_id, target_clinic_id, new_role, new_department_id);
END;
$$;


ALTER FUNCTION "public"."add_clinic_member"("new_user_id" "uuid", "target_clinic_id" "uuid", "new_role" "public"."user_role", "new_department_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_appointments_with_details_by_clinic"("clinic_id" "uuid") RETURNS TABLE("id" "uuid", "patient_id" "uuid", "doctor_id" "uuid", "date" "text", "time" "text", "type" "public"."appointment_type", "status" "public"."appointment_status", "notes" "text", "created_at" timestamp with time zone, "patient_name" "text", "doctor_name" "text", "department_name" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.patient_id,
        a.doctor_id,
        a.date,
        a.time,
        a.type,
        a.status,
        a.notes,
        a.created_at,
        p.name AS patient_name,
        d.name AS doctor_name,
        dt.name AS department_name
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN doctors d ON a.doctor_id = d.id
    LEFT JOIN clinic_members cm ON d.user_id = cm.user_id AND cm.clinic_id = a.clinic_id
    LEFT JOIN clinic_departments cd ON cm.department_id = cd.id
    LEFT JOIN department_types dt ON cd.department_type_id = dt.id
    WHERE a.clinic_id = get_appointments_with_details_by_clinic.clinic_id;
END;
$$;


ALTER FUNCTION "public"."get_appointments_with_details_by_clinic"("clinic_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dashboard_data"("_clinic_id" "uuid") RETURNS TABLE("total_patients" bigint, "total_doctors" bigint, "total_appointments" bigint, "appointments_today" bigint, "pending_consultations" bigint, "completed_consultations" bigint, "all_relevant_appointments" "jsonb")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM patients WHERE clinic_id = _clinic_id) AS total_patients,
        (SELECT COUNT(*) FROM doctors d JOIN clinic_members cm ON d.user_id = cm.user_id WHERE cm.clinic_id = _clinic_id) AS total_doctors,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = _clinic_id) AS total_appointments,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = _clinic_id AND date = CURRENT_DATE::TEXT) AS appointments_today,
        (SELECT COUNT(*) FROM consultations WHERE clinic_id = _clinic_id AND appointment_id IS NULL) AS pending_consultations,
        (SELECT COUNT(*) FROM consultations WHERE clinic_id = _clinic_id AND appointment_id IS NOT NULL) AS completed_consultations,
        (SELECT jsonb_agg(
            jsonb_build_object(
                'id', a.id,
                'patient_name', p.name,
                'doctor_name', d.name,
                'date', a.date,
                'time', a.time,
                'status', a.status,
                'patient_id', a.patient_id,
                'doctor_id', a.doctor_id,
                'type', a.type
            )
        ) FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN doctors d ON a.doctor_id = d.id
        WHERE a.clinic_id = _clinic_id) AS all_relevant_appointments;
END;
$$;


ALTER FUNCTION "public"."get_dashboard_data"("_clinic_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_doctor_dashboard_data"("_clinic_id" "uuid", "_user_id" "uuid") RETURNS TABLE("total_patients" bigint, "total_appointments" bigint, "pending_consultations" bigint, "completed_consultations" bigint, "upcoming_appointments" "jsonb", "my_patients" "jsonb")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(DISTINCT a.patient_id) FROM appointments a
         JOIN doctors d ON a.doctor_id = d.id
         WHERE d.user_id = _user_id AND a.clinic_id = _clinic_id) AS total_patients,
        (SELECT COUNT(*) FROM appointments a
         JOIN doctors d ON a.doctor_id = d.id
         WHERE d.user_id = _user_id AND a.clinic_id = _clinic_id) AS total_appointments,
        (SELECT COUNT(*) FROM consultations c
         JOIN doctors d ON c.doctor_id = d.id
         WHERE d.user_id = _user_id AND c.clinic_id = _clinic_id AND c.appointment_id IS NULL) AS pending_consultations,
        (SELECT COUNT(*) FROM consultations c
         JOIN doctors d ON c.doctor_id = d.id
         WHERE d.user_id = _user_id AND c.clinic_id = _clinic_id AND c.appointment_id IS NOT NULL) AS completed_consultations,
        (SELECT jsonb_agg(
            jsonb_build_object(
                'id', a.id,
                'patient_name', p.name,
                'date', a.date,
                'time', a.time,
                'status', a.status,
                'patient_id', a.patient_id,
                'doctor_id', a.doctor_id,
                'type', a.type
            )
        ) FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN doctors d ON a.doctor_id = d.id
        WHERE d.user_id = _user_id AND a.clinic_id = _clinic_id AND a.date >= CURRENT_DATE::TEXT) AS upcoming_appointments,
        (SELECT jsonb_agg(
            jsonb_build_object(
                'id', p.id,
                'name', p.name,
                'email', p.email,
                'phone', p.phone,
                'address', p.address,
                'clinic_id', p.clinic_id,
                'created_at', p.created_at,
                'date_of_birth', p.date_of_birth,
                'gender', p.gender,
                'medical_id', p.medical_id,
                'last_visit', (SELECT MAX(a.date) FROM appointments a WHERE a.patient_id = p.id AND a.clinic_id = _clinic_id)
            )
        ) FROM patients p
        JOIN appointments a ON p.id = a.patient_id
        JOIN doctors d ON a.doctor_id = d.id
        WHERE d.user_id = _user_id AND p.clinic_id = _clinic_id) AS my_patients;
END;
$$;


ALTER FUNCTION "public"."get_doctor_dashboard_data"("_clinic_id" "uuid", "_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_doctors_by_clinic"("clinic_id" "uuid") RETURNS TABLE("id" "uuid", "name" "text", "email" "text", "phone" "text", "availability" "text", "bio" "text", "created_at" timestamp with time zone, "role" "public"."user_role", "department_name" "text", "department_id" "uuid")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.name,
        d.email,
        d.phone,
        d.availability,
        d.bio,
        d.created_at,
        cm.role,
        dt.name AS department_name,
        cd.id AS department_id
    FROM doctors d
    JOIN clinic_members cm ON d.user_id = cm.user_id
    LEFT JOIN clinic_departments cd ON cm.department_id = cd.id
    LEFT JOIN department_types dt ON cd.department_type_id = dt.id
    WHERE cm.clinic_id = get_doctors_by_clinic.clinic_id;
END;
$$;


ALTER FUNCTION "public"."get_doctors_by_clinic"("clinic_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_patients_by_clinic"("_clinic_id" "uuid", "_limit" integer DEFAULT 10, "_offset" integer DEFAULT 0) RETURNS TABLE("id" "uuid", "clinic_id" "uuid", "created_at" timestamp with time zone, "date_of_birth" "text", "email" "text", "gender" "text", "medical_id" "text", "name" "text", "phone" "text", "address" "text")
    LANGUAGE "plpgsql"
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
    FROM patients p
    WHERE p.clinic_id = _clinic_id
    ORDER BY p.created_at DESC
    LIMIT _limit OFFSET _offset;
END;
$$;


ALTER FUNCTION "public"."get_patients_by_clinic"("_clinic_id" "uuid", "_limit" integer, "_offset" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_update_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email,
      name = NEW.raw_user_meta_data->>'name'
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_update_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_invalid_appointment_status_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF OLD.status IN ('Completed', 'Cancelled') AND NEW.status != OLD.status THEN
        RAISE EXCEPTION 'Cannot change status of a Completed or Cancelled appointment';
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."prevent_invalid_appointment_status_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_auth_uid"("uid" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    PERFORM set_config('auth.uid', uid::text, true);
END;
$$;


ALTER FUNCTION "public"."set_auth_uid"("uid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_profiles_created_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.created_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_profiles_created_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_clinic_member_details"("member_user_id" "uuid", "target_clinic_id" "uuid", "updated_role" "public"."user_role" DEFAULT NULL::"public"."user_role", "updated_department_id" "uuid" DEFAULT NULL::"uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE clinic_members
    SET role = COALESCE(updated_role, role),
        department_id = COALESCE(updated_department_id, department_id)
    WHERE user_id = member_user_id AND clinic_id = target_clinic_id;
END;
$$;


ALTER FUNCTION "public"."update_clinic_member_details"("member_user_id" "uuid", "target_clinic_id" "uuid", "updated_role" "public"."user_role", "updated_department_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."appointments" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "doctor_id" "uuid" NOT NULL,
    "date" "text" NOT NULL,
    "time" "text" NOT NULL,
    "type" "public"."appointment_type" NOT NULL,
    "status" "public"."appointment_status" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."appointments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bills" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "appointment_id" "uuid",
    "amount" numeric NOT NULL,
    "description" "text",
    "invoice_number" "text",
    "status" "public"."bill_status" DEFAULT 'Pending'::"public"."bill_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."bills" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clinic_departments" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "department_type_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."clinic_departments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clinic_members" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "department_id" "uuid",
    "role" "public"."user_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."clinic_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."clinics" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "address" "text",
    "email" "text",
    "phone" "text",
    "website" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "created_by" "uuid" NOT NULL
);


ALTER TABLE "public"."clinics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."consultations" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "doctor_id" "uuid" NOT NULL,
    "appointment_id" "uuid",
    "clinical_notes" "jsonb",
    "specialty_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."consultations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."department_types" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."department_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."doctors" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "availability" "text",
    "bio" "text",
    "clinic_id" "uuid",
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."doctors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."medical_records" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "chief_complaint" "text",
    "symptoms" "text",
    "diagnosis" "text",
    "treatment_plan" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."medical_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patients" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "address" "text",
    "date_of_birth" "text",
    "gender" "text",
    "medical_id" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."patients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prescriptions" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "clinic_id" "uuid" NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "doctor_id" "uuid" NOT NULL,
    "consultation_id" "uuid",
    "medical_record_id" "uuid",
    "medications" "jsonb" NOT NULL,
    "instructions" "text",
    "follow_up_date" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."prescriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "public"."uuid_generate_v4"() NOT NULL,
    "name" "text",
    "email" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "phone" "text"
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



ALTER TABLE ONLY "public"."clinics"
    ADD CONSTRAINT "clinics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."consultations"
    ADD CONSTRAINT "consultations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."department_types"
    ADD CONSTRAINT "department_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."doctors"
    ADD CONSTRAINT "doctors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."medical_records"
    ADD CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."consultations"
    ADD CONSTRAINT "one_to_one_appointment" UNIQUE ("appointment_id");



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prescriptions"
    ADD CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "appointments_status_protection" BEFORE UPDATE ON "public"."appointments" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_invalid_appointment_status_update"();



CREATE OR REPLACE TRIGGER "profiles_set_created_at" BEFORE INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_profiles_created_at"();



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bills"
    ADD CONSTRAINT "bills_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."bills"
    ADD CONSTRAINT "bills_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bills"
    ADD CONSTRAINT "bills_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clinic_departments"
    ADD CONSTRAINT "clinic_departments_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clinic_departments"
    ADD CONSTRAINT "clinic_departments_department_type_id_fkey" FOREIGN KEY ("department_type_id") REFERENCES "public"."department_types"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."clinic_members"
    ADD CONSTRAINT "clinic_members_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."clinic_members"
    ADD CONSTRAINT "clinic_members_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."clinic_departments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."clinic_members"
    ADD CONSTRAINT "clinic_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."consultations"
    ADD CONSTRAINT "consultations_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."consultations"
    ADD CONSTRAINT "consultations_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."consultations"
    ADD CONSTRAINT "consultations_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."consultations"
    ADD CONSTRAINT "consultations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."doctors"
    ADD CONSTRAINT "doctors_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."doctors"
    ADD CONSTRAINT "doctors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."medical_records"
    ADD CONSTRAINT "medical_records_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."medical_records"
    ADD CONSTRAINT "medical_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."prescriptions"
    ADD CONSTRAINT "prescriptions_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."prescriptions"
    ADD CONSTRAINT "prescriptions_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."prescriptions"
    ADD CONSTRAINT "prescriptions_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."prescriptions"
    ADD CONSTRAINT "prescriptions_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "public"."medical_records"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."prescriptions"
    ADD CONSTRAINT "prescriptions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;





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



GRANT ALL ON FUNCTION "public"."get_doctor_dashboard_data"("_clinic_id" "uuid", "_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_doctor_dashboard_data"("_clinic_id" "uuid", "_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_doctor_dashboard_data"("_clinic_id" "uuid", "_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_doctors_by_clinic"("clinic_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_doctors_by_clinic"("clinic_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_doctors_by_clinic"("clinic_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_patients_by_clinic"("_clinic_id" "uuid", "_limit" integer, "_offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_patients_by_clinic"("_clinic_id" "uuid", "_limit" integer, "_offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_patients_by_clinic"("_clinic_id" "uuid", "_limit" integer, "_offset" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_update_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_update_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_update_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_invalid_appointment_status_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_invalid_appointment_status_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_invalid_appointment_status_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_auth_uid"("uid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."set_auth_uid"("uid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_auth_uid"("uid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_profiles_created_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_profiles_created_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_profiles_created_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_clinic_member_details"("member_user_id" "uuid", "target_clinic_id" "uuid", "updated_role" "public"."user_role", "updated_department_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."update_clinic_member_details"("member_user_id" "uuid", "target_clinic_id" "uuid", "updated_role" "public"."user_role", "updated_department_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_clinic_member_details"("member_user_id" "uuid", "target_clinic_id" "uuid", "updated_role" "public"."user_role", "updated_department_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."uuid_generate_v1"() TO "postgres";
GRANT ALL ON FUNCTION "public"."uuid_generate_v1"() TO "anon";
GRANT ALL ON FUNCTION "public"."uuid_generate_v1"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."uuid_generate_v1"() TO "service_role";



GRANT ALL ON FUNCTION "public"."uuid_generate_v1mc"() TO "postgres";
GRANT ALL ON FUNCTION "public"."uuid_generate_v1mc"() TO "anon";
GRANT ALL ON FUNCTION "public"."uuid_generate_v1mc"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."uuid_generate_v1mc"() TO "service_role";



GRANT ALL ON FUNCTION "public"."uuid_generate_v3"("namespace" "uuid", "name" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."uuid_generate_v3"("namespace" "uuid", "name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."uuid_generate_v3"("namespace" "uuid", "name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."uuid_generate_v3"("namespace" "uuid", "name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."uuid_generate_v4"() TO "postgres";
GRANT ALL ON FUNCTION "public"."uuid_generate_v4"() TO "anon";
GRANT ALL ON FUNCTION "public"."uuid_generate_v4"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."uuid_generate_v4"() TO "service_role";



GRANT ALL ON FUNCTION "public"."uuid_generate_v5"("namespace" "uuid", "name" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."uuid_generate_v5"("namespace" "uuid", "name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."uuid_generate_v5"("namespace" "uuid", "name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."uuid_generate_v5"("namespace" "uuid", "name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."uuid_nil"() TO "postgres";
GRANT ALL ON FUNCTION "public"."uuid_nil"() TO "anon";
GRANT ALL ON FUNCTION "public"."uuid_nil"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."uuid_nil"() TO "service_role";



GRANT ALL ON FUNCTION "public"."uuid_ns_dns"() TO "postgres";
GRANT ALL ON FUNCTION "public"."uuid_ns_dns"() TO "anon";
GRANT ALL ON FUNCTION "public"."uuid_ns_dns"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."uuid_ns_dns"() TO "service_role";



GRANT ALL ON FUNCTION "public"."uuid_ns_oid"() TO "postgres";
GRANT ALL ON FUNCTION "public"."uuid_ns_oid"() TO "anon";
GRANT ALL ON FUNCTION "public"."uuid_ns_oid"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."uuid_ns_oid"() TO "service_role";



GRANT ALL ON FUNCTION "public"."uuid_ns_url"() TO "postgres";
GRANT ALL ON FUNCTION "public"."uuid_ns_url"() TO "anon";
GRANT ALL ON FUNCTION "public"."uuid_ns_url"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."uuid_ns_url"() TO "service_role";



GRANT ALL ON FUNCTION "public"."uuid_ns_x500"() TO "postgres";
GRANT ALL ON FUNCTION "public"."uuid_ns_x500"() TO "anon";
GRANT ALL ON FUNCTION "public"."uuid_ns_x500"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."uuid_ns_x500"() TO "service_role";


















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
