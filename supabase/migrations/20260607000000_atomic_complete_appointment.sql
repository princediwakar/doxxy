-- Atomic complete_appointment RPC
-- Replaces the two-step (UPDATE status + deduct_appointment_credit) with a single
-- transaction that locks the appointment row, checks credits, and completes atomically.
-- Prevents: double-deduction race, completed-without-deduction, and credit-overdraft.

CREATE OR REPLACE FUNCTION public.complete_appointment(
  p_appointment_id UUID,
  p_clinic_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status TEXT;
  v_balance INTEGER;
BEGIN
  -- 1. Lock the appointment row to prevent concurrent completions
  SELECT status INTO v_status
  FROM appointments
  WHERE id = p_appointment_id
    AND clinic_id = p_clinic_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Appointment not found');
  END IF;

  -- 2. Idempotency: reject if already completed
  IF v_status = 'Completed' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Appointment already completed');
  END IF;

  -- 3. Lock and check clinic credits
  SELECT credit_balance INTO v_balance
  FROM clinic_credits
  WHERE clinic_id = p_clinic_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Clinic credits record not found');
  END IF;

  IF v_balance < 1 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient credits');
  END IF;

  -- 4. Mark appointment completed
  UPDATE appointments
  SET status = 'Completed'
  WHERE id = p_appointment_id;

  -- 5. Create billing record (skip if one already exists — safety net)
  INSERT INTO appointment_billing (
    appointment_id,
    clinic_id,
    billing_type,
    credits_used,
    amount,
    created_at
  )
  VALUES (
    p_appointment_id,
    p_clinic_id,
    'consultation',
    1,
    1,
    NOW()
  )
  ON CONFLICT (appointment_id) DO NOTHING;

  -- 6. Deduct clinic credit
  UPDATE clinic_credits
  SET
    credit_balance = credit_balance - 1,
    total_credits_used = COALESCE(total_credits_used, 0) + 1,
    updated_at = NOW()
  WHERE clinic_id = p_clinic_id;

  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

COMMENT ON FUNCTION public.complete_appointment IS 'Atomically completes an appointment: locks the row, validates credits, updates status, creates billing record, and deducts credits in a single transaction';
