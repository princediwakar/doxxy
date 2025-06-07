-- Create missing database functions for clinic member management

-- Function to add a clinic member
CREATE OR REPLACE FUNCTION add_clinic_member(
    new_user_id UUID,
    target_clinic_id UUID,
    new_role user_role,
    new_department_id UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert new clinic member
    INSERT INTO clinic_members (user_id, clinic_id, role, department_id)
    VALUES (new_user_id, target_clinic_id, new_role, new_department_id)
    ON CONFLICT (user_id, clinic_id) 
    DO UPDATE SET 
        role = EXCLUDED.role,
        department_id = EXCLUDED.department_id;
END;
$$;

-- Function to update clinic member details
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
BEGIN
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
      
    -- Check if update affected any rows
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Clinic member not found for user % in clinic %', member_user_id, target_clinic_id;
    END IF;
END;
$$;

-- Grant execution permissions to authenticated users
GRANT EXECUTE ON FUNCTION add_clinic_member TO authenticated;
GRANT EXECUTE ON FUNCTION update_clinic_member_details TO authenticated; 