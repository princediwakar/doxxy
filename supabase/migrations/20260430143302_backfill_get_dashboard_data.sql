-- Migration: Backfill get_dashboard_data RPC
-- Auto-generated from live database

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
