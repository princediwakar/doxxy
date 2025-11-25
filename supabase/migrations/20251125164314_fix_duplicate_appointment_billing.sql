-- Fix duplicate appointment billing constraint violation
-- This migration provides a safer implementation for the deduct_appointment_credit function

-- Create or replace the deduct_appointment_credit function with UPSERT logic
CREATE OR REPLACE FUNCTION public.deduct_appointment_credit(
  appointment_id_param UUID,
  clinic_id_param UUID,
  credits_to_deduct INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance INTEGER;
  appointment_exists BOOLEAN;
  billing_record_exists BOOLEAN;
BEGIN
  -- Check if appointment exists and belongs to the clinic
  SELECT EXISTS (
    SELECT 1 FROM appointments
    WHERE id = appointment_id_param
    AND clinic_id = clinic_id_param
  ) INTO appointment_exists;

  IF NOT appointment_exists THEN
    RAISE EXCEPTION 'Appointment not found or does not belong to clinic';
  END IF;

  -- Check if clinic has sufficient credits
  SELECT credit_balance INTO current_balance
  FROM clinic_credits
  WHERE clinic_id = clinic_id_param;

  IF current_balance IS NULL OR current_balance < credits_to_deduct THEN
    RETURN FALSE;
  END IF;

  -- Check if billing record already exists
  SELECT EXISTS (
    SELECT 1 FROM appointment_billing
    WHERE appointment_id = appointment_id_param
  ) INTO billing_record_exists;

  -- Use UPSERT pattern to handle existing records
  IF billing_record_exists THEN
    -- Update existing billing record
    UPDATE appointment_billing
    SET
      credits_used = COALESCE(credits_used, 0) + credits_to_deduct,
      amount = COALESCE(amount, 0) + credits_to_deduct,
      updated_at = NOW()
    WHERE appointment_id = appointment_id_param;
  ELSE
    -- Insert new billing record
    INSERT INTO appointment_billing (
      appointment_id,
      clinic_id,
      billing_type,
      credits_used,
      amount,
      created_at
    ) VALUES (
      appointment_id_param,
      clinic_id_param,
      'consultation',
      credits_to_deduct,
      credits_to_deduct,
      NOW()
    );
  END IF;

  -- Update clinic credits
  UPDATE clinic_credits
  SET
    credit_balance = credit_balance - credits_to_deduct,
    total_credits_used = COALESCE(total_credits_used, 0) + credits_to_deduct,
    updated_at = NOW()
  WHERE clinic_id = clinic_id_param;

  RETURN TRUE;
EXCEPTION
  WHEN unique_violation THEN
    -- Handle duplicate key violation gracefully
    RAISE NOTICE 'Duplicate appointment billing record detected for appointment_id: %', appointment_id_param;
    RETURN FALSE;
  WHEN OTHERS THEN
    -- Re-raise other exceptions
    RAISE;
END;
$$;

-- Add comment to the function
COMMENT ON FUNCTION public.deduct_appointment_credit IS 'Deducts credits for an appointment, handling duplicate billing records gracefully';

-- Ensure the appointment_billing table has proper constraints
-- This constraint ensures one billing record per appointment
ALTER TABLE public.appointment_billing
DROP CONSTRAINT IF EXISTS appointment_billing_appointment_id_key,
ADD CONSTRAINT appointment_billing_appointment_id_key UNIQUE (appointment_id);