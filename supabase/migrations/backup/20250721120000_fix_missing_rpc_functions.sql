-- Fix missing RPC function get_doctors_by_clinic
-- This function was missing from the production database

-- Drop function if it exists (in case there's a broken version)
DROP FUNCTION IF EXISTS public.get_doctors_by_clinic(text);

-- Create the function with correct signature
CREATE OR REPLACE FUNCTION public.get_doctors_by_clinic(clinic_id text)
RETURNS TABLE(
    id text,
    user_id text, 
    name text,
    department_name text,
    phone text,
    email text,
    bio text
)
LANGUAGE plpgsql
AS $_$
BEGIN
  RETURN QUERY
  SELECT 
    d.id::text,
    d.user_id::text,
    COALESCE(d.name, p.name, 'Unknown Doctor') AS name,
    COALESCE(dt.name, 'General Medicine') AS department_name,
    p.phone,
    p.email,
    d.bio
  FROM doctors d
  LEFT JOIN profiles p ON p.user_id = d.user_id
  LEFT JOIN clinic_departments cd ON cd.id = d.department_id  
  LEFT JOIN department_types dt ON dt.id = cd.department_type_id
  WHERE d.clinic_id::text = get_doctors_by_clinic.clinic_id
    AND d.is_active = true;
END;
$_$;

-- Grant permissions
GRANT ALL ON FUNCTION public.get_doctors_by_clinic(text) TO anon;
GRANT ALL ON FUNCTION public.get_doctors_by_clinic(text) TO authenticated; 
GRANT ALL ON FUNCTION public.get_doctors_by_clinic(text) TO service_role;