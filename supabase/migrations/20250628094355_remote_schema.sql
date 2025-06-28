drop policy "doctors_create_policy" on "public"."doctors";

drop policy "doctors_delete_policy" on "public"."doctors";

drop policy "doctors_read_policy" on "public"."doctors";

drop policy "doctors_update_policy" on "public"."doctors";

drop function if exists "public"."get_appointments_with_details_by_clinic"(clinic_id text);

drop function if exists "public"."get_doctors_by_clinic"(clinic_id text);

drop function if exists "public"."get_patients_by_clinic"(clinic_id text);

drop function if exists "public"."get_appointments_with_details_by_clinic"(clinic_id uuid);

drop index if exists "public"."idx_appointments_date";

drop index if exists "public"."idx_appointments_status";

drop index if exists "public"."idx_bills_status";

drop index if exists "public"."idx_clinic_members_role";

drop index if exists "public"."idx_patients_medical_id";

alter table "public"."bills" add column "billing_type" text default 'simple'::text;

alter table "public"."bills" add column "description" text;

alter table "public"."bills" add column "discount_percentage" numeric(5,2) default 0;

alter table "public"."bills" add column "invoice_number" text;

alter table "public"."bills" add column "notes" text;

alter table "public"."bills" add column "service_items" jsonb;

alter table "public"."bills" add column "tax_percentage" numeric(5,2) default 0;

alter table "public"."clinic_departments" enable row level security;

alter table "public"."consultations" add column "clinical_notes" jsonb;

alter table "public"."consultations" add column "doctor_id" uuid;

alter table "public"."prescriptions" add column "consultation_id" uuid;

CREATE INDEX idx_clinic_departments_clinic_id ON public.clinic_departments USING btree (clinic_id);

CREATE INDEX idx_clinic_departments_department_type_id ON public.clinic_departments USING btree (department_type_id);

CREATE INDEX idx_clinic_members_department_id ON public.clinic_members USING btree (department_id);

CREATE INDEX idx_clinics_created_by ON public.clinics USING btree (created_by);

CREATE INDEX idx_consultations_doctor_id ON public.consultations USING btree (doctor_id);

CREATE INDEX idx_prescriptions_appointment_id ON public.prescriptions USING btree (appointment_id);

CREATE INDEX idx_prescriptions_clinic_id ON public.prescriptions USING btree (clinic_id);

CREATE INDEX idx_prescriptions_consultation_id ON public.prescriptions USING btree (consultation_id);

CREATE INDEX idx_prescriptions_doctor_id ON public.prescriptions USING btree (doctor_id);

CREATE INDEX idx_prescriptions_patient_id ON public.prescriptions USING btree (patient_id);

alter table "public"."bills" add constraint "bills_billing_type_check" CHECK ((billing_type = ANY (ARRAY['simple'::text, 'itemized'::text]))) not valid;

alter table "public"."bills" validate constraint "bills_billing_type_check";

alter table "public"."consultations" add constraint "consultations_doctor_id_fkey" FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE not valid;

alter table "public"."consultations" validate constraint "consultations_doctor_id_fkey";

alter table "public"."prescriptions" add constraint "prescriptions_consultation_id_fkey" FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE not valid;

alter table "public"."prescriptions" validate constraint "prescriptions_consultation_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_clinic_with_admin(clinic_name text, user_phone text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_dashboard_data(_clinic_id uuid)
 RETURNS TABLE(total_patients bigint, total_doctors bigint, total_appointments bigint, appointments_today bigint, pending_consultations bigint, completed_consultations bigint, all_relevant_appointments json)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_doctor_dashboard_data(_clinic_id uuid, _user_id uuid)
 RETURNS TABLE(total_patients bigint, total_appointments bigint, pending_consultations bigint, completed_consultations bigint, upcoming_appointments json, my_patients json)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_patients_by_clinic(_clinic_id uuid, _limit integer DEFAULT 100, _offset integer DEFAULT 0)
 RETURNS TABLE(id uuid, name text, phone text, email text, medical_id text, gender text, address text, date_of_birth date, created_at timestamp with time zone, clinic_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_clinic_memberships(user_id uuid)
 RETURNS TABLE(clinic_id uuid, clinic_name text, role user_role, joined_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.search_medicines(search_term text DEFAULT ''::text, limit_count integer DEFAULT 50)
 RETURNS TABLE(id bigint, name text, price numeric, is_discontinued boolean, manufacturer_name text, pack_size_label text, pack_type text, short_composition1 text, short_composition2 text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.validate_bill_items()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_appointments_with_details_by_clinic(clinic_id uuid)
 RETURNS TABLE(id uuid, patient_id uuid, doctor_id uuid, date text, "time" text, type appointment_type, status appointment_status, notes text, created_at timestamp with time zone, patient_name text, doctor_name text, department_name text, billing_status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

create policy "allow_delete_clinic_departments_safe"
on "public"."clinic_departments"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM clinics c
  WHERE ((c.id = clinic_departments.clinic_id) AND (c.created_by = auth.uid())))));


create policy "allow_read_clinic_departments_safe"
on "public"."clinic_departments"
as permissive
for select
to public
using (((auth.uid() IS NOT NULL) AND ((EXISTS ( SELECT 1
   FROM clinics c
  WHERE ((c.id = clinic_departments.clinic_id) AND (c.created_by = auth.uid())))) OR (clinic_id IN ( SELECT c.id
   FROM clinics c
  WHERE (c.created_by = auth.uid()))))));


create policy "clinic_members_delete_simple"
on "public"."clinic_members"
as permissive
for delete
to public
using ((clinic_id IN ( SELECT c.id
   FROM clinics c
  WHERE (c.created_by = auth.uid()))));


create policy "clinic_members_insert_simple"
on "public"."clinic_members"
as permissive
for insert
to public
with check (((user_id = auth.uid()) OR (clinic_id IN ( SELECT c.id
   FROM clinics c
  WHERE (c.created_by = auth.uid())))));


create policy "clinic_members_select_simple"
on "public"."clinic_members"
as permissive
for select
to public
using (((user_id = auth.uid()) OR (clinic_id IN ( SELECT c.id
   FROM clinics c
  WHERE (c.created_by = auth.uid())))));


create policy "clinic_members_update_simple"
on "public"."clinic_members"
as permissive
for update
to public
using (((user_id = auth.uid()) OR (clinic_id IN ( SELECT c.id
   FROM clinics c
  WHERE (c.created_by = auth.uid())))));


create policy "clinics_insert"
on "public"."clinics"
as permissive
for insert
to public
with check (true);


create policy "clinics_select"
on "public"."clinics"
as permissive
for select
to public
using (true);


create policy "clinics_update"
on "public"."clinics"
as permissive
for update
to public
using (true);


create policy "consultations_delete_clinic_members"
on "public"."consultations"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM clinic_members cm
  WHERE ((cm.clinic_id = consultations.clinic_id) AND (cm.user_id = auth.uid())))));


create policy "doctors_delete_simple"
on "public"."doctors"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM clinic_members cm
  WHERE ((cm.clinic_id = doctors.clinic_id) AND (cm.user_id = auth.uid()) AND (cm.role = 'superadmin'::user_role)))));


create policy "doctors_insert_simple"
on "public"."doctors"
as permissive
for insert
to public
with check (((user_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM clinic_members cm
  WHERE ((cm.clinic_id = doctors.clinic_id) AND (cm.user_id = auth.uid()))))));


create policy "doctors_select_simple"
on "public"."doctors"
as permissive
for select
to public
using (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM clinic_members cm
  WHERE ((cm.clinic_id = doctors.clinic_id) AND (cm.user_id = auth.uid()))))));


create policy "doctors_update_simple"
on "public"."doctors"
as permissive
for update
to public
using (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM clinic_members cm
  WHERE ((cm.clinic_id = doctors.clinic_id) AND (cm.user_id = auth.uid()) AND (cm.role = 'superadmin'::user_role))))));


create policy "prescriptions_delete_policy"
on "public"."prescriptions"
as permissive
for delete
to authenticated
using ((clinic_id IN ( SELECT clinic_members.clinic_id
   FROM clinic_members
  WHERE (clinic_members.user_id = auth.uid()))));


create policy "prescriptions_insert_policy"
on "public"."prescriptions"
as permissive
for insert
to authenticated
with check ((clinic_id IN ( SELECT clinic_members.clinic_id
   FROM clinic_members
  WHERE (clinic_members.user_id = auth.uid()))));


create policy "prescriptions_select_policy"
on "public"."prescriptions"
as permissive
for select
to authenticated
using ((clinic_id IN ( SELECT clinic_members.clinic_id
   FROM clinic_members
  WHERE (clinic_members.user_id = auth.uid()))));


create policy "prescriptions_update_policy"
on "public"."prescriptions"
as permissive
for update
to authenticated
using ((clinic_id IN ( SELECT clinic_members.clinic_id
   FROM clinic_members
  WHERE (clinic_members.user_id = auth.uid()))))
with check ((clinic_id IN ( SELECT clinic_members.clinic_id
   FROM clinic_members
  WHERE (clinic_members.user_id = auth.uid()))));



