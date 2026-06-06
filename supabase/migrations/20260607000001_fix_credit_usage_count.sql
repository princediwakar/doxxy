-- Fix calculate_clinic_credit_usage to only count 'Completed' appointments
-- The old version counted both 'Completed' and 'In Progress', inflating credit usage.

DROP FUNCTION IF EXISTS public.calculate_clinic_credit_usage(UUID);

CREATE OR REPLACE FUNCTION public.calculate_clinic_credit_usage(clinic_id_param UUID)
RETURNS TABLE (
  clinic_id UUID,
  credits_used INTEGER,
  appointments_count INTEGER,
  completed_count INTEGER,
  in_progress_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH appointment_counts AS (
    SELECT
      a.clinic_id,
      COUNT(*) FILTER (WHERE a.status = 'Completed') as completed_count,
      COUNT(*) FILTER (WHERE a.status = 'In Progress') as in_progress_count,
      COUNT(*) FILTER (WHERE a.status = 'Completed') as total_consultations
    FROM appointments a
    WHERE a.clinic_id = clinic_id_param
    GROUP BY a.clinic_id
  )
  SELECT
    ac.clinic_id,
    ac.total_consultations as credits_used,
    ac.total_consultations as appointments_count,
    ac.completed_count,
    ac.in_progress_count
  FROM appointment_counts ac;
END;
$$;

COMMENT ON FUNCTION public.calculate_clinic_credit_usage IS 'Calculates credit usage based on completed appointments only';
