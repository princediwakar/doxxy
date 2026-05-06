DROP FUNCTION IF EXISTS public.get_user_clinic_memberships(uuid);

CREATE OR REPLACE FUNCTION public.get_user_clinic_memberships(user_id uuid)
 RETURNS TABLE(
   member_id uuid,
   member_user_id uuid,
   clinic_id uuid,
   role user_role,
   department_id uuid,
   created_at timestamp with time zone,
   clinic_data jsonb
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    cm.id,
    cm.user_id,
    cm.clinic_id,
    cm.role,
    cm.department_id,
    cm.created_at,
    row_to_json(c.*)::jsonb as clinic_data
  FROM clinic_members cm
  JOIN clinics c ON c.id = cm.clinic_id
  WHERE cm.user_id = user_id
  ORDER BY cm.created_at ASC;
END;
$function$;
