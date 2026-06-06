-- Fix: appointment_billing_billing_type_check doesn't include 'consultation'
-- The complete_appointment RPC inserts billing_type='consultation' which violates the constraint.
-- Drop and recreate with all valid billing types.

ALTER TABLE public.appointment_billing
  DROP CONSTRAINT IF EXISTS appointment_billing_billing_type_check;

ALTER TABLE public.appointment_billing
  ADD CONSTRAINT appointment_billing_billing_type_check
  CHECK (billing_type IN ('consultation', 'follow_up', 'procedure', 'medicine', 'lab_test', 'product', 'service', 'other'));
