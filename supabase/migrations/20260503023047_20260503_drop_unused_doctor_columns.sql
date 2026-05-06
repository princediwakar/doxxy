-- Drop RPC function that references columns we're about to drop
DROP FUNCTION IF EXISTS public.get_public_doctors_by_clinic(text);

-- Drop 26 unused columns from doctors table
ALTER TABLE public.doctors
  DROP COLUMN IF EXISTS additional_qualifications,
  DROP COLUMN IF EXISTS availability,
  DROP COLUMN IF EXISTS board_certifications,
  DROP COLUMN IF EXISTS clinic_timings,
  DROP COLUMN IF EXISTS fellowship_details,
  DROP COLUMN IF EXISTS graduation_year,
  DROP COLUMN IF EXISTS languages_spoken,
  DROP COLUMN IF EXISTS medical_college,
  DROP COLUMN IF EXISTS medical_council,
  DROP COLUMN IF EXISTS medical_degree,
  DROP COLUMN IF EXISTS medical_license_expiry,
  DROP COLUMN IF EXISTS medical_license_state,
  DROP COLUMN IF EXISTS medical_qualifications,
  DROP COLUMN IF EXISTS medical_registration_number,
  DROP COLUMN IF EXISTS medical_specializations,
  DROP COLUMN IF EXISTS medical_university,
  DROP COLUMN IF EXISTS pg_completion_year,
  DROP COLUMN IF EXISTS pg_institution,
  DROP COLUMN IF EXISTS pg_specialization,
  DROP COLUMN IF EXISTS postgraduate_degree,
  DROP COLUMN IF EXISTS practice_timings,
  DROP COLUMN IF EXISTS professional_summary,
  DROP COLUMN IF EXISTS profile_completion_percentage,
  DROP COLUMN IF EXISTS research_experience,
  DROP COLUMN IF EXISTS subspecialty,
  DROP COLUMN IF EXISTS years_of_experience;
