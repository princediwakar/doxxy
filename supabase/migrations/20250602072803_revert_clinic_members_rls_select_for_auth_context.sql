-- Drop the current recursive SELECT policy on clinic_members
DROP POLICY IF EXISTS authenticated_clinic_members_select ON clinic_members;

-- Add a simple SELECT policy on clinic_members for authenticated users to view their own entry
CREATE POLICY authenticated_clinic_members_select ON clinic_members FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
);
