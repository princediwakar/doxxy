-- Fix get_doctors_by_clinic function to return proper user_id for updates
-- The function should return the doctor's user_id as 'id' for the frontend to use correctly

DROP FUNCTION IF EXISTS get_doctors_by_clinic(UUID);

CREATE OR REPLACE FUNCTION get_doctors_by_clinic(clinic_id UUID)
RETURNS TABLE (
    id UUID,              -- This will be the user_id (for compatibility with frontend)
    user_id UUID,         -- Also include explicit user_id
    name TEXT,
    email TEXT,
    phone TEXT,
    availability TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ,
    role TEXT,
    department_name TEXT,
    department_id UUID,
    is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.user_id as id,  -- Return user_id as 'id' for frontend compatibility
        d.user_id,
        d.name,
        d.email,
        d.phone,
        d.availability,
        d.bio,
        d.created_at,
        cm.role::TEXT,
        COALESCE(dt.name, 'No Department') as department_name,
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
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION get_doctors_by_clinic TO authenticated; 