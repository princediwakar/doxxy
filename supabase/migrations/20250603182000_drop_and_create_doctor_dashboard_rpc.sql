-- Drop the old function if it exists
DROP FUNCTION IF EXISTS public.get_doctor_dashboard_data(uuid, uuid);

-- Create the updated doctor dashboard RPC
CREATE FUNCTION public.get_doctor_dashboard_data(_clinic_id uuid, _doctor_id uuid)
RETURNS TABLE(
  total_patients bigint,
  total_appointments bigint,
  pending_consultations bigint,
  completed_consultations bigint,
  upcoming_appointments jsonb,
  my_patients jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Total unique patients for this doctor (any status)
  SELECT COUNT(DISTINCT a.patient_id) INTO total_patients
  FROM appointments a
  WHERE a.clinic_id = _clinic_id AND a.doctor_id = _doctor_id;

  -- Total appointments for this doctor
  SELECT COUNT(*) INTO total_appointments
  FROM appointments a
  WHERE a.clinic_id = _clinic_id AND a.doctor_id = _doctor_id;

  -- Pending consultations: Scheduled or In Progress
  SELECT COUNT(*) INTO pending_consultations
  FROM appointments a
  WHERE a.clinic_id = _clinic_id AND a.doctor_id = _doctor_id AND a.status IN ('Scheduled', 'In Progress');

  -- Completed consultations
  SELECT COUNT(*) INTO completed_consultations
  FROM appointments a
  WHERE a.clinic_id = _clinic_id AND a.doctor_id = _doctor_id AND a.status = 'Completed';

  -- Upcoming appointments (today and future)
  SELECT jsonb_agg(jsonb_build_object(
    'id', a.id,
    'date', a.date,
    'time', a.time,
    'type', a.type,
    'status', a.status,
    'patient_id', p.id,
    'patient_name', p.name
  ) ORDER BY a.date ASC, a.time ASC)
  INTO upcoming_appointments
  FROM appointments a
  JOIN patients p ON a.patient_id = p.id
  WHERE a.clinic_id = _clinic_id AND a.doctor_id = _doctor_id AND a.date >= CURRENT_DATE;

  -- My patients: only those with a scheduled or completed appointment in the last 30 days, ordered by latest appointment
  SELECT jsonb_agg(jsonb_build_object(
    'id', p.id,
    'name', p.name,
    'last_visit', MAX(a.date)
  ) ORDER BY MAX(a.date) DESC)
  INTO my_patients
  FROM patients p
  JOIN appointments a ON a.patient_id = p.id
  WHERE a.clinic_id = _clinic_id
    AND a.doctor_id = _doctor_id
    AND a.status IN ('Scheduled', 'Completed')
    AND a.date >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY p.id, p.name;
END;
$$; 