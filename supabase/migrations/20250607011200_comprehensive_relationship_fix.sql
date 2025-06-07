-- COMPREHENSIVE RELATIONSHIP FIX
-- This migration addresses all relationship issues between tables

-- Step 1: Fix RLS policies to allow proper superadmin access
DROP POLICY IF EXISTS "allow_read_own_membership" ON clinic_members;
DROP POLICY IF EXISTS "allow_read_clinic_departments" ON clinic_departments;
DROP POLICY IF EXISTS "allow_read_doctors" ON doctors;

-- Create proper policies that allow superadmins to see all clinic data
CREATE POLICY "allow_read_clinic_members" ON clinic_members
FOR SELECT USING (
    user_id = auth.uid() 
    OR EXISTS (
        SELECT 1 FROM clinic_members cm 
        WHERE cm.clinic_id = clinic_members.clinic_id 
        AND cm.user_id = auth.uid() 
        AND cm.role = 'superadmin'
    )
);

CREATE POLICY "allow_update_clinic_members" ON clinic_members
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM clinic_members cm 
        WHERE cm.clinic_id = clinic_members.clinic_id 
        AND cm.user_id = auth.uid() 
        AND cm.role = 'superadmin'
    )
);

CREATE POLICY "allow_delete_clinic_members" ON clinic_members
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM clinic_members cm 
        WHERE cm.clinic_id = clinic_members.clinic_id 
        AND cm.user_id = auth.uid() 
        AND cm.role = 'superadmin'
    )
);

-- Superadmin insert policy for clinic members
CREATE POLICY "allow_superadmin_insert_clinic_members" ON clinic_members
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM clinic_members cm 
        WHERE cm.clinic_id = clinic_members.clinic_id 
        AND cm.user_id = auth.uid() 
        AND cm.role = 'superadmin'
    )
    OR (user_id = auth.uid() AND role = 'superadmin')
);

-- Fix clinic departments policies
CREATE POLICY "allow_read_clinic_departments" ON clinic_departments
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM clinic_members cm 
        WHERE cm.clinic_id = clinic_departments.clinic_id 
        AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "allow_delete_clinic_departments" ON clinic_departments
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM clinic_members cm 
        WHERE cm.clinic_id = clinic_departments.clinic_id 
        AND cm.user_id = auth.uid() 
        AND cm.role = 'superadmin'
    )
);

-- Fix doctors policies
CREATE POLICY "allow_read_doctors" ON doctors
FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM clinic_members cm 
        WHERE cm.clinic_id = doctors.clinic_id 
        AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "allow_update_doctors" ON doctors
FOR UPDATE USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM clinic_members cm 
        WHERE cm.clinic_id = doctors.clinic_id 
        AND cm.user_id = auth.uid() 
        AND cm.role = 'superadmin'
    )
);

-- Step 2: Create a function to repair existing data inconsistencies
CREATE OR REPLACE FUNCTION repair_clinic_relationships()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    doctor_record RECORD;
    member_count INTEGER;
BEGIN
    -- Fix doctors without clinic_members entries
    FOR doctor_record IN 
        SELECT d.user_id, d.clinic_id, 'doctor' as role, d.name
        FROM doctors d
        LEFT JOIN clinic_members cm ON d.user_id = cm.user_id AND d.clinic_id = cm.clinic_id
        WHERE cm.id IS NULL
    LOOP
        -- Check if clinic_member already exists (race condition protection)
        SELECT COUNT(*) INTO member_count
        FROM clinic_members 
        WHERE user_id = doctor_record.user_id AND clinic_id = doctor_record.clinic_id;
        
        IF member_count = 0 THEN
            INSERT INTO clinic_members (user_id, clinic_id, role, department_id)
            VALUES (doctor_record.user_id, doctor_record.clinic_id, doctor_record.role::user_role, NULL)
            ON CONFLICT (user_id, clinic_id) DO NOTHING;
            
            RAISE NOTICE 'Added clinic_member for doctor: % in clinic: %', doctor_record.name, doctor_record.clinic_id;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Repair completed successfully';
END;
$$;

-- Step 3: Run the repair function
SELECT repair_clinic_relationships();

-- Step 4: Improve the update_clinic_member_details function to be more robust
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
    member_exists BOOLEAN;
    doctor_exists BOOLEAN;
BEGIN
    -- Check if clinic member exists
    SELECT EXISTS(
        SELECT 1 FROM clinic_members 
        WHERE user_id = member_user_id AND clinic_id = target_clinic_id
    ) INTO member_exists;
    
    -- Check if doctor exists
    SELECT EXISTS(
        SELECT 1 FROM doctors 
        WHERE user_id = member_user_id AND clinic_id = target_clinic_id
    ) INTO doctor_exists;
    
    -- If member doesn't exist but doctor does, create the member first
    IF NOT member_exists AND doctor_exists THEN
        INSERT INTO clinic_members (user_id, clinic_id, role, department_id)
        VALUES (member_user_id, target_clinic_id, COALESCE(updated_role, 'doctor'), updated_department_id)
        ON CONFLICT (user_id, clinic_id) DO NOTHING;
        
        RAISE NOTICE 'Created missing clinic_member for doctor user_id: %', member_user_id;
    ELSIF NOT member_exists AND NOT doctor_exists THEN
        RAISE EXCEPTION 'User % not found in clinic % (neither clinic_members nor doctors table)', member_user_id, target_clinic_id;
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
        RAISE EXCEPTION 'Failed to update clinic member for user % in clinic %', member_user_id, target_clinic_id;
    END IF;
    
    RAISE NOTICE 'Successfully updated clinic member for user: %', member_user_id;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION repair_clinic_relationships TO authenticated;
GRANT EXECUTE ON FUNCTION update_clinic_member_details TO authenticated; 