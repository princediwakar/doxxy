-- Fix RLS policy for clinic_credits table to allow doctors to read credits
-- Doctors need to check clinic credits to start consultations

-- Drop the existing read policy
DROP POLICY IF EXISTS clinic_credits_admin_read ON clinic_credits;

-- Create new read policy that includes doctors
CREATE POLICY clinic_credits_read_for_clinic_members ON clinic_credits
FOR SELECT
TO authenticated
USING (
  clinic_id IN (
    SELECT user_clinic_ids()
  )
  AND (
    get_user_role_in_clinic(clinic_id) = ANY(ARRAY['staff', 'superadmin', 'doctor'])
    OR is_superadmin()
  )
);

-- Update the modify policy to be consistent
DROP POLICY IF EXISTS clinic_credits_system_modify ON clinic_credits;

CREATE POLICY clinic_credits_modify_for_clinic_members ON clinic_credits
FOR ALL
TO authenticated
USING (
  clinic_id IN (
    SELECT user_clinic_ids()
  )
  AND (
    get_user_role_in_clinic(clinic_id) = ANY(ARRAY['staff', 'superadmin'])
    OR is_superadmin()
  )
);