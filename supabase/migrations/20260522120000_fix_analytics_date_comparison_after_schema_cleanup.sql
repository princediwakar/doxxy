-- Fix: schema_cleanup changed appointments.date from text → date.
-- The analytics functions still cast _start_date/_end_date to ::text,
-- causing "operator does not exist: date >= text".
-- Remove ::text casts so date columns compare directly.

CREATE OR REPLACE FUNCTION public.get_clinic_analytics(
  _clinic_id uuid,
  _start_date date,
  _end_date date
)
RETURNS TABLE(
  total_patients_seen bigint,
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
     WHERE clinic_id = _clinic_id AND date >= _start_date AND date <= _end_date) as total_patients_seen,
    (SELECT COUNT(*) FROM appointments
     WHERE clinic_id = _clinic_id AND date >= _start_date AND date <= _end_date) as total_appointments,
    (SELECT COUNT(*) FROM appointments
     WHERE clinic_id = _clinic_id AND date >= _start_date AND date <= _end_date AND status = 'Completed') as completed,
    (SELECT COUNT(*) FROM appointments
     WHERE clinic_id = _clinic_id AND date >= _start_date AND date <= _end_date AND (status = 'Scheduled' OR status = 'In Progress')) as pending,
    (SELECT COUNT(*) FROM appointments
     WHERE clinic_id = _clinic_id AND date >= _start_date AND date <= _end_date AND status = 'No-Show') as no_shows,
    (SELECT COUNT(*) FROM appointments
     WHERE clinic_id = _clinic_id AND date >= _start_date AND date <= _end_date AND status = 'Cancelled') as cancelled,
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
       LEFT JOIN appointments a ON a.clinic_id = _clinic_id AND a.date = d.date
       GROUP BY d.date
       ORDER BY d.date
     ) t) as daily_breakdown;
END;
$function$;

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
     WHERE doctor_id = _doctor_id AND date >= _start_date AND date <= _end_date) as total_patients,
    (SELECT COUNT(*) FROM appointments
     WHERE doctor_id = _doctor_id AND date >= _start_date AND date <= _end_date) as total_appointments,
    (SELECT COUNT(*) FROM appointments
     WHERE doctor_id = _doctor_id AND date >= _start_date AND date <= _end_date AND status = 'Completed') as completed,
    (SELECT COUNT(*) FROM appointments
     WHERE doctor_id = _doctor_id AND date >= _start_date AND date <= _end_date AND (status = 'Scheduled' OR status = 'In Progress')) as pending,
    (SELECT COUNT(*) FROM appointments
     WHERE doctor_id = _doctor_id AND date >= _start_date AND date <= _end_date AND status = 'No-Show') as no_shows,
    (SELECT COUNT(*) FROM appointments
     WHERE doctor_id = _doctor_id AND date >= _start_date AND date <= _end_date AND status = 'Cancelled') as cancelled,
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
       LEFT JOIN appointments a ON a.doctor_id = _doctor_id AND a.date = d.date
       GROUP BY d.date
       ORDER BY d.date
     ) t) as daily_breakdown;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_provider_performance_matrix(
  _clinic_id uuid,
  _start_date date,
  _end_date date
)
RETURNS TABLE(
  doctor_id uuid,
  doctor_name text,
  total_booked bigint,
  completed bigint,
  pending bigint,
  no_shows bigint,
  cancelled bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    a.doctor_id,
    COALESCE(d.name, prof.name, 'Unknown') as doctor_name,
    COUNT(*)::bigint as total_booked,
    COUNT(*) FILTER (WHERE a.status = 'Completed')::bigint as completed,
    COUNT(*) FILTER (WHERE a.status IN ('Scheduled', 'In Progress'))::bigint as pending,
    COUNT(*) FILTER (WHERE a.status = 'No-Show')::bigint as no_shows,
    COUNT(*) FILTER (WHERE a.status = 'Cancelled')::bigint as cancelled
  FROM appointments a
  LEFT JOIN doctors d ON a.doctor_id = d.id
  LEFT JOIN profiles prof ON d.user_id = prof.id
  WHERE a.clinic_id = _clinic_id
    AND a.date >= _start_date
    AND a.date <= _end_date
  GROUP BY a.doctor_id, d.name, prof.name
  ORDER BY doctor_name;
END;
$function$;
