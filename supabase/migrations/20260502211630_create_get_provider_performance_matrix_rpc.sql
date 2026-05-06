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
    AND a.date >= _start_date::text
    AND a.date <= _end_date::text
  GROUP BY a.doctor_id, d.name, prof.name
  ORDER BY doctor_name;
END;
$function$;
