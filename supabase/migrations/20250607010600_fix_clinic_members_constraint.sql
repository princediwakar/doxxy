-- Add unique constraint for clinic_members to prevent duplicate memberships

-- Check if the constraint already exists, if not, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'clinic_members_user_clinic_unique' 
        AND table_name = 'clinic_members'
    ) THEN
        ALTER TABLE clinic_members 
        ADD CONSTRAINT clinic_members_user_clinic_unique 
        UNIQUE (user_id, clinic_id);
    END IF;
END $$;

-- Update the add_clinic_member function to handle the constraint properly
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
    -- Insert new clinic member with proper conflict handling
    INSERT INTO clinic_members (user_id, clinic_id, role, department_id)
    VALUES (new_user_id, target_clinic_id, new_role, new_department_id)
    ON CONFLICT (user_id, clinic_id) 
    DO UPDATE SET 
        role = EXCLUDED.role,
        department_id = EXCLUDED.department_id;
END;
$$; 