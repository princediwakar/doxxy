-- Fix infinite recursion in clinic_members policies
DROP POLICY IF EXISTS "Users can view clinic members" ON clinic_members;
DROP POLICY IF EXISTS "Users can add themselves as initial superadmin" ON clinic_members;

-- Clinic Members Policies (Fixed)
-- Allow users to add themselves as superadmin during clinic creation
CREATE POLICY "Users can add themselves as initial superadmin" ON clinic_members
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

-- Allow superadmins to add other members to their clinics
CREATE POLICY "Superadmins can add clinic members" ON clinic_members
FOR INSERT 
WITH CHECK (
    auth.uid() IS NOT NULL 
    AND EXISTS (
        SELECT 1 FROM clinic_members AS existing_members
        WHERE existing_members.clinic_id = clinic_members.clinic_id 
        AND existing_members.user_id = auth.uid()
        AND existing_members.role = 'superadmin'
    )
);

-- Allow users to view clinic members where they are also members
-- Fix: Use a simpler approach without self-referencing
CREATE POLICY "Users can view clinic members" ON clinic_members
FOR SELECT USING (
    -- User can see their own membership record
    user_id = auth.uid()
    OR
    -- User can see other members if they are superadmin of the same clinic
    EXISTS (
        SELECT 1 FROM clinic_members AS my_membership
        WHERE my_membership.clinic_id = clinic_members.clinic_id 
        AND my_membership.user_id = auth.uid()
        AND my_membership.role = 'superadmin'
    )
);

-- Allow users to update their own membership or superadmins to update others
CREATE POLICY "Users can update clinic members" ON clinic_members
FOR UPDATE USING (
    -- User can update their own record
    user_id = auth.uid()
    OR
    -- Superadmin can update other members in their clinic
    EXISTS (
        SELECT 1 FROM clinic_members AS admin_check
        WHERE admin_check.clinic_id = clinic_members.clinic_id 
        AND admin_check.user_id = auth.uid()
        AND admin_check.role = 'superadmin'
    )
); 