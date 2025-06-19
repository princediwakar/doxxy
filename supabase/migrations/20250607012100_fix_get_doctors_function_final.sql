-- Fix get_doctors_by_clinic function to ONLY return actual doctors from doctors table
-- Remove the superadmin inclusion logic completely

CREATE OR REPLACE FUNCTION public.get_doctors_by_clinic(clinic_id uuid)
RETURNS TABLE(
    id uuid,
    user_id uuid,
    name text,
    email text,
    phone text,
    availability text,
    bio text,
    created_at timestamp with time zone,
    role text,
    department_name text,
    department_id uuid,
    is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    -- Only get actual doctors from the doctors table
    -- No more automatic inclusion of superadmins
    SELECT 
        d.id,
        d.user_id,
        d.name,
        d.email,
        d.phone,
        d.availability,
        d.bio,
        d.created_at,
        cm.role::TEXT,
        COALESCE(dt.name, 'General Medicine') as department_name,
        cd.id as department_id,
        COALESCE(d.is_active, true) as is_active
    FROM doctors d
    LEFT JOIN clinic_members cm ON d.user_id = cm.user_id AND d.clinic_id = cm.clinic_id
    LEFT JOIN clinic_departments cd ON cm.department_id = cd.id
    LEFT JOIN department_types dt ON cd.department_type_id = dt.id
    WHERE d.clinic_id = get_doctors_by_clinic.clinic_id
      AND COALESCE(d.is_active, true) = true  -- Only return active doctors
    ORDER BY d.name;
END;
$function$; 