-- Include superadmins (admin role) in the doctor dropdown for appointments
-- This allows superadmins to be assigned as doctors for appointments

DROP FUNCTION IF EXISTS get_doctors_by_clinic(UUID);

CREATE OR REPLACE FUNCTION get_doctors_by_clinic(clinic_id UUID)
RETURNS TABLE (
    id UUID,              -- This will be the actual doctors.id for foreign key compatibility, or user_id for admins
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
    -- Get regular doctors
    SELECT 
        d.id,  -- Return actual doctors.id for foreign key compatibility
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
    
    UNION ALL
    
    -- Get superadmins (superadmin role) who can also act as doctors
    SELECT 
        cm.user_id as id,  -- Use user_id as id for admins since they don't have doctors table entry
        cm.user_id,
        COALESCE(p.name, 'Admin User') as name,
        COALESCE(p.email, '') as email,
        COALESCE(p.phone, '') as phone,
        'Available' as availability,  -- Default availability for admins
        'Clinic Administrator' as bio,
        cm.created_at,
        cm.role::TEXT,
        COALESCE(dt.name, 'Administration') as department_name,
        cd.id as department_id,
        true as is_active
    FROM clinic_members cm
    LEFT JOIN profiles p ON cm.user_id = p.id
    LEFT JOIN clinic_departments cd ON cm.department_id = cd.id
    LEFT JOIN department_types dt ON cd.department_type_id = dt.id
    WHERE cm.clinic_id = get_doctors_by_clinic.clinic_id
      AND cm.role = 'superadmin'
      AND cm.user_id NOT IN (
          -- Exclude admins who are also in doctors table (to avoid duplicates)
          SELECT d.user_id 
          FROM doctors d 
          WHERE d.clinic_id = get_doctors_by_clinic.clinic_id
            AND COALESCE(d.is_active, true) = true
      )
    
    ORDER BY name;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION get_doctors_by_clinic TO authenticated; 