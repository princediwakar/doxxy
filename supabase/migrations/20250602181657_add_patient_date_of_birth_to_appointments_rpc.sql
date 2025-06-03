CREATE OR REPLACE FUNCTION public.get_appointments_with_details_by_clinic(clinic_id uuid) -- Use a different parameter name if needed
 RETURNS TABLE(
  id uuid,
  patient_id uuid,
  doctor_id uuid,
  date date,
  time time without time zone,
  type text,
  status text,
  notes text,
  created_at timestamp with time zone,
  patient_name text,
  patient_date_of_birth date,
  patient_gender text,
  doctor_name text,
  department_name text
) -- Update return type
 LANGUAGE plpgsql
 SECURITY DEFINER -- Keep SECURITY DEFINER as it joins across tables
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.patient_id,
    a.doctor_id,
    a.date,
    a.time,
    a.type,
    a.status::text, -- Cast status to text
    a.notes::text, -- Cast notes to text
    a.created_at,
    p.name AS patient_name,
    p.date_of_birth AS patient_date_of_birth, -- Select date_of_birth
    p.gender AS patient_gender,
    d.name AS doctor_name,
    dt.name AS department_name
  FROM
    appointments a
  JOIN
    patients p ON a.patient_id = p.id
  JOIN
    doctors d ON a.doctor_id = d.id
  LEFT JOIN -- Use LEFT JOIN in case a doctor doesn't have a department assigned
    clinic_departments cd ON d.clinic_id = cd.clinic_id -- Join clinic_departments on clinic_id
  LEFT JOIN -- Use LEFT JOIN for department_types as well
    department_types dt ON cd.department_type_id = dt.id
  WHERE
    a.clinic_id = get_appointments_with_details_by_clinic.clinic_id; -- Use the function parameter name
END;
$$;

-- Grant execute permissions to authenticated role
GRANT EXECUTE ON FUNCTION public.get_appointments_with_details_by_clinic(uuid) TO authenticated;
