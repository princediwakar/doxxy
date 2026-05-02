-- RPC: get_doctor_analytics
-- Returns doctor-specific appointment metrics for a date range with daily breakdown
CREATE OR REPLACE FUNCTION public.get_doctor_analytics(
  _doctor_id uuid,
  _start_date date,
  _end_date date
)
RETURNS TABLE(
  total_patients bigint,
  total_appointments bigint,
  completed bigint,
  pending bigint,
  no_shows bigint,
  cancelled bigint,
  daily_breakdown json
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(DISTINCT patient_id) FROM appointments
     WHERE doctor_id = _doctor_id AND date >= _start_date::text AND date <= _end_date::text) as total_patients,
    (SELECT COUNT(*) FROM appointments
     WHERE doctor_id = _doctor_id AND date >= _start_date::text AND date <= _end_date::text) as total_appointments,
    (SELECT COUNT(*) FROM appointments
     WHERE doctor_id = _doctor_id AND date >= _start_date::text AND date <= _end_date::text AND status = 'Completed') as completed,
    (SELECT COUNT(*) FROM appointments
     WHERE doctor_id = _doctor_id AND date >= _start_date::text AND date <= _end_date::text AND (status = 'Scheduled' OR status = 'In Progress')) as pending,
    (SELECT COUNT(*) FROM appointments
     WHERE doctor_id = _doctor_id AND date >= _start_date::text AND date <= _end_date::text AND status = 'No-Show') as no_shows,
    (SELECT COUNT(*) FROM appointments
     WHERE doctor_id = _doctor_id AND date >= _start_date::text AND date <= _end_date::text AND status = 'Cancelled') as cancelled,
    (SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
     FROM (
       SELECT
         d.date::text as date,
         COUNT(a.id) FILTER (WHERE a.status = 'Completed')::bigint as completed,
         COUNT(a.id) FILTER (WHERE a.status IN ('Scheduled', 'In Progress'))::bigint as pending,
         COUNT(a.id) FILTER (WHERE a.status = 'No-Show')::bigint as no_shows,
         COUNT(a.id) FILTER (WHERE a.status = 'Cancelled')::bigint as cancelled,
         COUNT(a.id)::bigint as total
       FROM generate_series(_start_date, _end_date, '1 day'::interval) d(date)
       LEFT JOIN appointments a ON a.doctor_id = _doctor_id AND a.date = d.date::text
       GROUP BY d.date
       ORDER BY d.date
     ) t) as daily_breakdown;
END;
$function$;
