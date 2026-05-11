-- Migration: Add doctor signature column and update RPC
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS signature TEXT;

-- Update RPC to also return signature (must drop first due to changed return type)
DROP FUNCTION IF EXISTS public.get_doctors_by_clinic(text);

CREATE OR REPLACE FUNCTION public.get_doctors_by_clinic(clinic_id text)
 RETURNS TABLE(id text, user_id text, name text, department_name text, phone text, email text, bio text, signature text)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    d.id::text,
    d.user_id::text,
    COALESCE(d.name, p.name, 'Unknown Doctor') AS name,
    COALESCE(
      dt.name,
      d.primary_specialization,
      'General Medicine'
    ) AS department_name,
    p.phone,
    p.email,
    d.bio,
    d.signature
  FROM doctors d
  LEFT JOIN profiles p ON p.id = d.user_id
  LEFT JOIN clinic_members cm ON cm.user_id = d.user_id AND cm.clinic_id::uuid = get_doctors_by_clinic.clinic_id::uuid
  LEFT JOIN clinic_departments cd ON cd.id = cm.department_id
  LEFT JOIN department_types dt ON dt.id = cd.department_type_id
  WHERE d.clinic_id::uuid = get_doctors_by_clinic.clinic_id::uuid
    AND d.is_active = true;
END;
$function$;
