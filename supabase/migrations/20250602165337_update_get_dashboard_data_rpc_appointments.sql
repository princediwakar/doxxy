-- Drop the existing RPC function
DROP FUNCTION IF EXISTS public.get_dashboard_data(uuid);

-- Recreate the RPC function with updated appointment fetching and ordering
CREATE OR REPLACE FUNCTION public.get_dashboard_data(_clinic_id uuid)
 RETURNS TABLE(total_patients bigint, total_doctors bigint, appointments_today bigint, all_relevant_appointments jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
    today_date DATE := CURRENT_DATE;
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

    -- Fetch all upcoming appointments from today onwards, ordered by date and time ascending
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
    ) ORDER BY a.date ASC, a.time ASC)
    INTO _all_relevant_appointments
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN doctors d ON a.doctor_id = d.id
    WHERE a.clinic_id = _clinic_id AND a.date >= today_date; -- Filter from today onwards

    RETURN QUERY
    SELECT
        _total_patients,
        _total_doctors,
        _appointments_today,
        _all_relevant_appointments;
        END;$function$;
