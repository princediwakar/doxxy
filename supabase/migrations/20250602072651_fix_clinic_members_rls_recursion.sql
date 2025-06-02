-- Drop the problematic recursive SELECT policy on clinic_members
DROP POLICY IF EXISTS authenticated_clinic_members_select ON clinic_members;

-- Add a corrected SELECT policy on clinic_members for authenticated users
-- This policy allows authenticated users to view clinic_members if their clinic_id matches
-- a clinic the authenticated user is a member of, using EXISTS to avoid recursion.
CREATE POLICY authenticated_clinic_members_select ON clinic_members FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM clinic_members cm WHERE cm.clinic_id = clinic_members.clinic_id AND cm.user_id = auth.uid())
);
