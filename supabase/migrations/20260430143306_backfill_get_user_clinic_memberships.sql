-- Migration: Backfill get_user_clinic_memberships RPC
-- Auto-generated from live database

CREATE OR REPLACE FUNCTION public.get_user_clinic_memberships(user_id uuid)
 RETURNS TABLE(clinic_id uuid, clinic_name text, role user_role, joined_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as clinic_id,
    c.name as clinic_name,
    cm.role,
    cm.created_at as joined_at
  FROM clinic_members cm
  JOIN clinics c ON c.id = cm.clinic_id
  WHERE cm.user_id = $1;
END;
$function$
;
