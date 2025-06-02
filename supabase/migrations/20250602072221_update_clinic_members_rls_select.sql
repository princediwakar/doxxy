-- Drop existing SELECT policies on clinic_members for authenticated users
DROP POLICY IF EXISTS authenticated_clinic_members_select ON clinic_members;
DROP POLICY IF EXISTS clinic_members_select ON clinic_members; -- Drop if a generic select policy exists

-- Allow authenticated users to SELECT clinic_members within their clinic
CREATE POLICY authenticated_clinic_members_select ON clinic_members FOR SELECT TO authenticated
USING (
  clinic_id IN (SELECT clinic_id FROM clinic_members WHERE user_id = auth.uid())
);