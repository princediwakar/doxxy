-- Refactor get_doctor_dashboard_data to use user_id and clinic_id
DROP FUNCTION IF EXISTS public.get_doctor_dashboard_data(uuid, uuid);

CREATE FUNCTION public.get_doctor_dashboard_data(_clinic_id uuid, _user_id uuid)
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
DECLARE
  doctor_id uuid;
BEGIN
  -- Get the doctor's id for this user and clinic
  SELECT id INTO doctor_id FROM doctors WHERE user_id = _user_id AND clinic_id = _clinic_id;
  IF doctor_id IS NULL THEN
    -- No doctor record found for this user in this clinic
    total_patients := 0;
    total_appointments := 0;
    pending_consultations := 0;
    completed_consultations := 0;
    upcoming_appointments := '[]'::jsonb;
    my_patients := '[]'::jsonb;
    RETURN;
  END IF;

  -- Total unique patients for this doctor (any status)
  SELECT COUNT(DISTINCT a.patient_id) INTO total_patients
  FROM appointments a
  WHERE a.clinic_id = _clinic_id AND a.doctor_id = doctor_id;

  -- Total appointments for this doctor
  SELECT COUNT(*) INTO total_appointments
  FROM appointments a
  WHERE a.clinic_id = _clinic_id AND a.doctor_id = doctor_id;

  -- Pending consultations: Scheduled or In Progress
  SELECT COUNT(*) INTO pending_consultations
  FROM appointments a
  WHERE a.clinic_id = _clinic_id AND a.doctor_id = doctor_id AND a.status IN ('Scheduled', 'In Progress');

  -- Completed consultations
  SELECT COUNT(*) INTO completed_consultations
  FROM appointments a
  WHERE a.clinic_id = _clinic_id AND a.doctor_id = doctor_id AND a.status = 'Completed';

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
  WHERE a.clinic_id = _clinic_id AND a.doctor_id = doctor_id AND a.date >= CURRENT_DATE;

  -- My patients: only those with a scheduled or completed appointment in the last 30 days, ordered by latest appointment
  SELECT jsonb_agg(row_to_json(t) ORDER BY t.last_visit DESC)
  INTO my_patients
  FROM (
    SELECT
      p.id,
      p.name,
      MAX(a.date) AS last_visit
    FROM patients p
    JOIN appointments a ON a.patient_id = p.id
    WHERE a.clinic_id = _clinic_id
      AND a.doctor_id = doctor_id
      AND a.status IN ('Scheduled', 'Completed')
      AND a.date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY p.id, p.name
  ) t;
END;
$$; 