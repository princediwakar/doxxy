-- Complete fix for infinite recursion - no self-referencing allowed
DROP POLICY IF EXISTS "Users can view clinic members" ON clinic_members;
DROP POLICY IF EXISTS "Users can add themselves as initial superadmin" ON clinic_members;
DROP POLICY IF EXISTS "Superadmins can add clinic members" ON clinic_members;
DROP POLICY IF EXISTS "Users can update clinic members" ON clinic_members;

-- Clinic Members Policies - SIMPLIFIED to avoid any self-referencing
-- For initial clinic creation: users can add themselves as superadmin
CREATE POLICY "Users can add themselves as superadmin during clinic creation" ON clinic_members
FOR INSERT 
WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
    AND role = 'superadmin'
    AND EXISTS (
        SELECT 1 FROM clinics 
        WHERE clinics.id = clinic_id 
        AND clinics.created_by = auth.uid()
    )
);

-- Simple view policy: users can only see their own membership records
CREATE POLICY "Users can view their own memberships" ON clinic_members
FOR SELECT USING (
    user_id = auth.uid()
);

-- Users can update their own membership records
CREATE POLICY "Users can update their own memberships" ON clinic_members
FOR UPDATE USING (
    user_id = auth.uid()
);

-- For now, only allow adding during clinic creation
-- Later we can add more complex policies for inviting users 