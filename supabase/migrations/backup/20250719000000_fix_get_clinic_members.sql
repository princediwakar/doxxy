-- Fix get_clinic_members function to only select existing profile fields

CREATE OR REPLACE FUNCTION "public"."get_clinic_members"("p_clinic_id" "uuid") 
RETURNS TABLE(
  "id" "uuid", 
  "user_id" "uuid", 
  "clinic_id" "uuid", 
  "role" "public"."user_role", 
  "department_id" "uuid", 
  "created_at" timestamp with time zone, 
  "profile" "jsonb", 
  "department" "jsonb"
)
LANGUAGE "plpgsql" SECURITY DEFINER
SET "search_path" TO 'public'
AS $$
BEGIN
  -- Verify user has access to this clinic
  IF NOT EXISTS (
    SELECT 1 FROM clinic_members auth_cm
    WHERE auth_cm.clinic_id = p_clinic_id AND auth_cm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Permission denied: cannot access clinic members';
  END IF;

  RETURN QUERY
  SELECT 
    cm.id,
    cm.user_id,
    cm.clinic_id,
    cm.role,
    cm.department_id,
    cm.created_at,
    (
      SELECT jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'email', p.email,
        'phone', p.phone,
        'created_at', p.created_at,
        'updated_at', p.updated_at
      )
      FROM profiles p
      WHERE p.id = cm.user_id
    ) AS profile,
    (
      SELECT jsonb_build_object(
        'id', cd.id,
        'department_types', jsonb_build_object(
          'id', dt.id,
          'name', dt.name
        )
      )
      FROM clinic_departments cd
      JOIN department_types dt ON dt.id = cd.department_type_id
      WHERE cd.id = cm.department_id
    ) AS department
  FROM clinic_members cm
  WHERE cm.clinic_id = p_clinic_id
  ORDER BY cm.created_at DESC;
END;
$$;