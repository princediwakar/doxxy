-- Migration: Strict active doctors — require department assignment
-- Adds cm.department_id IS NOT NULL to get_doctors_by_clinic RPC
-- Fixes get_dashboard_data to join through clinic_members for accurate doctor count

-- Updated get_doctors_by_clinic with department_id IS NOT NULL filter
CREATE OR REPLACE FUNCTION public.get_doctors_by_clinic(clinic_id text)
 RETURNS TABLE(id text, user_id text, name text, department_name text, phone text, email text, bio text, signature text)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    d.id::text,
    d.user_id::text,
    COALESCE(d.name, p.name, 'Unknown Doctor') AS name,
    COALESCE(
      dt.name,
      d.primary_specialization,
      'General Medicine'
    ) AS department_name,
    p.phone,
    p.email,
    d.bio,
    d.signature
  FROM doctors d
  LEFT JOIN profiles p ON p.id = d.user_id
  LEFT JOIN clinic_members cm ON cm.user_id = d.user_id AND cm.clinic_id::uuid = get_doctors_by_clinic.clinic_id::uuid
  LEFT JOIN clinic_departments cd ON cd.id = cm.department_id
  LEFT JOIN department_types dt ON dt.id = cd.department_type_id
  WHERE d.clinic_id::uuid = get_doctors_by_clinic.clinic_id::uuid
    AND d.is_active = true
    AND cm.department_id IS NOT NULL;
END;
$function$;

-- Updated get_dashboard_data with department-gated doctor count
CREATE OR REPLACE FUNCTION public.get_dashboard_data(_clinic_id uuid)
 RETURNS TABLE(total_patients bigint, total_doctors bigint, total_appointments bigint, appointments_today bigint, pending_consultations bigint, completed_consultations bigint, all_relevant_appointments json)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM patients WHERE clinic_id = _clinic_id) as total_patients,
        (SELECT COUNT(*) FROM doctors d
         JOIN clinic_members cm ON cm.user_id = d.user_id AND cm.clinic_id = _clinic_id
         WHERE d.clinic_id = _clinic_id AND d.is_active = true AND cm.department_id IS NOT NULL) as total_doctors,
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
$function$;
