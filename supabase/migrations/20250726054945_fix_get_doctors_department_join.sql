-- Fix the get_doctors_by_clinic function to properly join departments via clinic_members
-- The original function was trying to join doctors.department_id which doesn't exist
-- Department assignment is stored in clinic_members.department_id

CREATE OR REPLACE FUNCTION "public"."get_doctors_by_clinic"("clinic_id" "text") 
RETURNS TABLE("id" "text", "user_id" "text", "name" "text", "department_name" "text", "phone" "text", "email" "text", "bio" "text")
LANGUAGE "plpgsql"
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id::text,
    d.user_id::text,
    COALESCE(d.name, p.name, 'Unknown Doctor') AS name,
    COALESCE(
      dt.name,                      -- Actual department name from clinic_departments
      d.primary_specialization,     -- Doctor's specialization as better fallback
      'General Medicine'            -- Final fallback only if no specialization
    ) AS department_name,
    p.phone,
    p.email,
    d.bio
  FROM doctors d
  LEFT JOIN profiles p ON p.id = d.user_id
  -- Fixed: Join via clinic_members to get department_id, not directly from doctors table
  LEFT JOIN clinic_members cm ON cm.user_id = d.user_id AND cm.clinic_id::uuid = get_doctors_by_clinic.clinic_id::uuid
  LEFT JOIN clinic_departments cd ON cd.id = cm.department_id AND cd.is_active = true  
  LEFT JOIN department_types dt ON dt.id = cd.department_type_id
  WHERE d.clinic_id::uuid = get_doctors_by_clinic.clinic_id::uuid
    AND d.is_active = true;
END;
$$;