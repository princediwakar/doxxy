-- FIX INFINITE RECURSION IN CLINIC_MEMBERS POLICIES
-- The issue is that the policy references clinic_members from within clinic_members policy

-- Step 1: Drop all problematic policies
DROP POLICY IF EXISTS "allow_read_clinic_members" ON clinic_members;
DROP POLICY IF EXISTS "allow_update_clinic_members" ON clinic_members;
DROP POLICY IF EXISTS "allow_delete_clinic_members" ON clinic_members;
DROP POLICY IF EXISTS "allow_superadmin_insert_clinic_members" ON clinic_members;
DROP POLICY IF EXISTS "temp_read_all_clinic_members" ON clinic_members;

-- Step 2: Create simple, non-recursive policies

-- Allow users to read their own clinic memberships
CREATE POLICY "allow_read_own_clinic_membership" ON clinic_members
FOR SELECT USING (user_id = auth.uid());

-- Allow users to read clinic memberships for clinics they created
CREATE POLICY "allow_read_clinic_members_as_creator" ON clinic_members
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM clinics c 
        WHERE c.id = clinic_members.clinic_id 
        AND c.created_by = auth.uid()
    )
);

-- Allow clinic creators to update/delete members
CREATE POLICY "allow_manage_clinic_members_as_creator" ON clinic_members
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM clinics c 
        WHERE c.id = clinic_members.clinic_id 
        AND c.created_by = auth.uid()
    )
);

-- Allow users to insert themselves as superadmin when creating clinics
CREATE POLICY "allow_insert_own_superadmin_membership" ON clinic_members
FOR INSERT WITH CHECK (
    user_id = auth.uid() 
    AND role = 'superadmin'
    AND EXISTS (
        SELECT 1 FROM clinics c 
        WHERE c.id = clinic_members.clinic_id 
        AND c.created_by = auth.uid()
    )
);

-- Temporary: Allow broad read access for debugging (can be removed later)
CREATE POLICY "temp_read_all_authenticated" ON clinic_members
FOR SELECT USING (auth.uid() IS NOT NULL); 