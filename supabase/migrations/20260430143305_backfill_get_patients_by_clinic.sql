-- Migration: Backfill get_patients_by_clinic RPC
-- Auto-generated from live database

CREATE OR REPLACE FUNCTION public.get_patients_by_clinic(_clinic_id uuid, _limit integer DEFAULT 100, _offset integer DEFAULT 0)
 RETURNS TABLE(id uuid, name text, phone text, email text, medical_id text, gender text, address text, age integer, created_at timestamp with time zone, clinic_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.phone,
    p.email,
    p.medical_id,
    p.gender,
    p.address,
    p.age,
    p.created_at,
    p.clinic_id
  FROM patients p
  WHERE p.clinic_id = _clinic_id
  ORDER BY p.name ASC
  LIMIT _limit OFFSET _offset;
END;
$function$
;
