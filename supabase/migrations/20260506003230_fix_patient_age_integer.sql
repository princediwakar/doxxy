DROP FUNCTION IF EXISTS public.get_appointments_with_details_by_clinic(uuid, uuid);
DROP FUNCTION IF EXISTS public.get_appointments_with_details_by_clinic(uuid);

CREATE OR REPLACE FUNCTION public.get_appointments_with_details_by_clinic(clinic_id uuid, filter_doctor_id uuid DEFAULT NULL)
 RETURNS TABLE(id text, patient_id text, doctor_id text, date text, "time" text, type appointment_type, status appointment_status, notes text, created_at text, patient_name text, doctor_name text, department_name text, user_id text, doctor_avatar_url text, patient_gender text, patient_age integer)
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
    prof.avatar_url AS doctor_avatar_url,
    p.gender::text,
    p.age
  FROM appointments a
  LEFT JOIN patients p ON a.patient_id = p.id
  LEFT JOIN doctors d ON a.doctor_id = d.id
  LEFT JOIN profiles prof ON d.user_id = prof.id
  LEFT JOIN clinic_members cm ON d.user_id = cm.user_id AND a.clinic_id = cm.clinic_id
  LEFT JOIN clinic_departments cd ON cm.department_id = cd.id
  LEFT JOIN department_types dt ON cd.department_type_id = dt.id
  LEFT JOIN bills b ON a.id = b.appointment_id
  WHERE a.clinic_id = get_appointments_with_details_by_clinic.clinic_id::uuid
    AND ($2 IS NULL OR a.doctor_id = $2)
  ORDER BY a.id, b.created_at DESC;
END;
$function$
;
