-- Rename get_doctors_by_clinic_enhanced to get_doctors_by_clinic
-- Since we only have one function now, no need for the "enhanced" suffix

-- Drop the old enhanced function
DROP FUNCTION IF EXISTS public.get_doctors_by_clinic_enhanced(clinic_id uuid);

-- Create the function with the simple name
CREATE OR REPLACE FUNCTION public.get_doctors_by_clinic(clinic_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  name text,
  email text,
  phone text,
  bio text,
  created_at timestamp with time zone,
  role text,
  department_name text,
  department_id uuid,
  is_active boolean,
  primary_specialization text,
  medical_specializations text[],
  years_of_experience integer,
  consultation_fee numeric,
  languages_spoken text[],
  practice_timings jsonb,
  professional_summary text,
  medical_registration_number text,
  medical_qualifications text[],
  medical_council text,
  medical_license_state text,
  medical_license_expiry timestamp with time zone,
  subspecialty text[],
  board_certifications text[],
  fellowship_details text,
  medical_college text,
  graduation_year integer,
  clinic_timings jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.user_id,
    d.name,
    d.email,
    d.phone,
    d.bio,
    d.created_at,
    cm.role::text,
    COALESCE(dept.name, 'General Medicine') as department_name,
    d.department_id,
    d.is_active,
    d.primary_specialization,
    d.medical_specializations,
    d.years_of_experience,
    d.consultation_fee,
    d.languages_spoken,
    d.practice_timings,
    d.professional_summary,
    d.medical_registration_number,
    d.medical_qualifications,
    d.medical_council,
    d.medical_license_state,
    d.medical_license_expiry,
    d.subspecialty,
    d.board_certifications,
    d.fellowship_details,
    d.medical_college,
    d.graduation_year,
    d.clinic_timings
  FROM doctors d
  JOIN clinic_members cm ON d.user_id = cm.user_id AND cm.clinic_id = d.clinic_id
  LEFT JOIN departments dept ON d.department_id = dept.id
  WHERE d.clinic_id = get_doctors_by_clinic.clinic_id
    AND d.is_active = true
    AND cm.clinic_id = get_doctors_by_clinic.clinic_id
  ORDER BY d.name;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_doctors_by_clinic(uuid) TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION public.get_doctors_by_clinic(uuid) IS 
'Returns all active doctors for a clinic with complete medical profile data.'; 