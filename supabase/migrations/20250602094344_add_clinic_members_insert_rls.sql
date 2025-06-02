-- Add an INSERT policy on clinic_members for authenticated users
-- This policy allows authenticated users to insert their own user_id into clinic_members.
CREATE POLICY authenticated_clinic_members_insert ON clinic_members FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
);
