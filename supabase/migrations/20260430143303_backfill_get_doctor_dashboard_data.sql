-- Migration: Backfill get_doctor_dashboard_data RPC
-- Auto-generated from live database

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
                p.age,
                p.medical_id,
                p.address,
                p.clinic_id,
                p.created_at,
                MAX(a.created_at) as last_visit
            FROM patients p
            INNER JOIN appointments a ON p.id = a.patient_id
            WHERE a.clinic_id = _clinic_id AND a.doctor_id = doc_id
            GROUP BY p.id, p.name, p.email, p.phone, p.gender, p.age, p.medical_id, p.address, p.clinic_id, p.created_at
            ORDER BY p.id, last_visit DESC
            LIMIT 10
         ) t) as my_patients;
END;
$function$
;
