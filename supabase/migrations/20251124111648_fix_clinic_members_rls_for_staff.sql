-- Fix RLS policy for clinic_members to allow staff users to see members in their clinic
-- This will fix the issue where staff users see "General Medicine" instead of correct department names

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS clinic_members_restricted ON clinic_members;

-- Create a new policy that allows clinic members to see other members in their clinic
CREATE POLICY clinic_members_clinic_access ON clinic_members
FOR ALL
USING (
  -- Allow users to see their own records
  user_id = auth.uid()
  OR
  -- Allow superadmins to see all records
  is_superadmin()
  OR
  -- Allow clinic members to see other members in their clinic
  clinic_id IN (SELECT user_clinic_ids())
);