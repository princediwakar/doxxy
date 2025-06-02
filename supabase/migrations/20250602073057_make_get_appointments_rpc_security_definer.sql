-- Drop the existing get_appointments_with_details_by_clinic function
DROP FUNCTION IF EXISTS public.get_appointments_with_details_by_clinic(clinic_id uuid);

-- Recreate the function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_appointments_with_details_by_clinic(clinic_id uuid)
 RETURNS TABLE(id uuid, patient_id uuid, doctor_id uuid, date date, "time" character varying, type character varying, status character varying, notes text, created_at timestamp with time zone, patient_name character varying, doctor_name character varying, department_name character varying)
 LANGUAGE sql
 SECURITY DEFINER -- Add SECURITY DEFINER here
 STABLE
AS $function$
  SELECT
    a.id,
    a.patient_id,
    a.doctor_id,
    a.date,
    a."time",
    a.type,
    a.status,
    a.notes,
    a.created_at,
    p.name AS patient_name,
    d.name AS doctor_name,
    dt.name AS department_name
  FROM
    public.appointments a
  JOIN
    public.patients p ON a.patient_id = p.id
  JOIN
    public.doctors d ON a.doctor_id = d.id
  JOIN -- Join clinic_members to get the doctor's clinic role and department
    public.clinic_members cm ON d.id = cm.user_id
  LEFT JOIN -- Use LEFT JOIN in case clinic_member has no department
    public.clinic_departments cd ON cm.department_id = cd.id
  LEFT JOIN -- Use LEFT JOIN in case clinic_department has no type
    public.department_types dt ON cd.department_type_id = dt.id
  WHERE
    a.clinic_id = get_appointments_with_details_by_clinic.clinic_id
    AND cm.clinic_id = get_appointments_with_details_by_clinic.clinic_id;
$function$;
