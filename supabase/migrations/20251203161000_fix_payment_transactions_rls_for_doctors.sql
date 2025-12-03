-- Fix RLS policy for payment_transactions table to allow doctors to read transactions
-- Doctors need to check payment transactions to calculate credit balance for consultations

-- Drop the existing read policy
DROP POLICY IF EXISTS payment_transactions_admin_read ON payment_transactions;

-- Create new read policy that includes doctors
CREATE POLICY payment_transactions_read_for_clinic_members ON payment_transactions
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

-- Note: We keep the existing create and update policies as they are
-- Only doctors need read access to calculate credit balance