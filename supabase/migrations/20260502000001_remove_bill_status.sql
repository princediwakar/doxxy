-- Migration: Remove bill_status enum and bills.status column
-- The status was always hardcoded to "Pending" with no mechanism to transition to Paid/Overdue.
-- billing_status from get_appointments_with_details_by_clinic was never consumed by the frontend.
-- get_bills_by_clinic was unused.

-- 1. Drop unused RPC that references bills.status
DROP FUNCTION IF EXISTS public.get_bills_by_clinic(uuid);

-- 2. Drop and recreate get_appointments_with_details_by_clinic without billing_status column
DROP FUNCTION IF EXISTS public.get_appointments_with_details_by_clinic(uuid);
CREATE FUNCTION public.get_appointments_with_details_by_clinic(clinic_id uuid)
 RETURNS TABLE(id text, patient_id text, doctor_id text, date text, "time" text, type appointment_type, status appointment_status, notes text, created_at text, patient_name text, doctor_name text, department_name text, user_id text, doctor_avatar_url text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (a.id)
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
    d.user_id::text,
    prof.avatar_url AS doctor_avatar_url
  FROM appointments a
  LEFT JOIN patients p ON a.patient_id = p.id
  LEFT JOIN doctors d ON a.doctor_id = d.id
  LEFT JOIN profiles prof ON d.user_id = prof.id
  LEFT JOIN clinic_members cm ON d.user_id = cm.user_id AND a.clinic_id = cm.clinic_id
  LEFT JOIN clinic_departments cd ON cm.department_id = cd.id
  LEFT JOIN department_types dt ON cd.department_type_id = dt.id
  LEFT JOIN bills b ON a.id = b.appointment_id
  WHERE a.clinic_id = get_appointments_with_details_by_clinic.clinic_id::uuid
  ORDER BY a.id, b.created_at DESC;
END;
$function$;

-- 3. Drop the status column from bills
ALTER TABLE public.bills DROP COLUMN IF EXISTS status;

-- 4. Drop the bill_status enum
DROP TYPE IF EXISTS public.bill_status;
