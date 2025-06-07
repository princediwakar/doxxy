-- Fix update_clinic_member_details function to be more robust

CREATE OR REPLACE FUNCTION update_clinic_member_details(
    member_user_id UUID,
    target_clinic_id UUID,
    updated_role user_role DEFAULT NULL,
    updated_department_id UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    row_count INTEGER;
BEGIN
    -- Debug logging: Check if user exists
    IF NOT EXISTS (SELECT 1 FROM clinic_members WHERE user_id = member_user_id AND clinic_id = target_clinic_id) THEN
        -- Check if the user exists in the doctors table for this clinic
        IF EXISTS (SELECT 1 FROM doctors WHERE user_id = member_user_id AND clinic_id = target_clinic_id) THEN
            -- User is a doctor but not in clinic_members - this shouldn't happen with proper flow
            -- Let's add them to clinic_members first
            INSERT INTO clinic_members (user_id, clinic_id, role, department_id)
            VALUES (member_user_id, target_clinic_id, COALESCE(updated_role, 'doctor'), updated_department_id)
            ON CONFLICT (user_id, clinic_id) DO NOTHING;
        ELSE
            RAISE EXCEPTION 'User % not found in clinic % (not in clinic_members or doctors table)', member_user_id, target_clinic_id;
        END IF;
    END IF;

    -- Update existing clinic member
    UPDATE clinic_members 
    SET 
        role = COALESCE(updated_role, role),
        department_id = CASE 
            WHEN updated_department_id IS NOT NULL THEN updated_department_id
            ELSE department_id
        END
    WHERE user_id = member_user_id 
      AND clinic_id = target_clinic_id;
      
    GET DIAGNOSTICS row_count = ROW_COUNT;
    
    -- Check if update affected any rows
    IF row_count = 0 THEN
        RAISE EXCEPTION 'Failed to update clinic member for user % in clinic % (row_count: %)', member_user_id, target_clinic_id, row_count;
    END IF;
END;
$$;

-- Grant execution permissions to authenticated users
GRANT EXECUTE ON FUNCTION update_clinic_member_details TO authenticated; 