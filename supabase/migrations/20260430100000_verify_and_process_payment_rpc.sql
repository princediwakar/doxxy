-- RPC: verify_and_process_payment
-- Atomically marks a payment transaction as completed and adds credits to clinic_credits.
-- Called by the verify-razorpay-payment edge function after signature verification succeeds.

CREATE OR REPLACE FUNCTION public.verify_and_process_payment(
  p_transaction_id UUID,
  p_razorpay_payment_id TEXT,
  p_razorpay_signature TEXT,
  p_clinic_id UUID,
  p_credits_purchased INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_status TEXT;
BEGIN
  -- 1. Lock the transaction row and verify ownership
  SELECT payment_status INTO v_current_status
  FROM public.payment_transactions
  WHERE id = p_transaction_id
    AND clinic_id = p_clinic_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Transaction not found');
  END IF;

  -- 2. Idempotency: if already completed, return success
  IF v_current_status = 'completed' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Transaction already processed');
  END IF;

  -- 3. Mark transaction as completed
  UPDATE public.payment_transactions
  SET
    payment_status = 'completed',
    razorpay_payment_id = p_razorpay_payment_id,
    razorpay_signature = p_razorpay_signature,
    updated_at = NOW()
  WHERE id = p_transaction_id;

  -- 4. Atomically upsert clinic_credits
  INSERT INTO public.clinic_credits (
    clinic_id,
    credit_balance,
    total_credits_purchased,
    total_credits_used,
    created_at,
    updated_at
  )
  VALUES (
    p_clinic_id,
    p_credits_purchased,
    p_credits_purchased,
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (clinic_id) DO UPDATE
  SET
    credit_balance = clinic_credits.credit_balance + p_credits_purchased,
    total_credits_purchased = COALESCE(clinic_credits.total_credits_purchased, 0) + p_credits_purchased,
    updated_at = NOW();

  RETURN jsonb_build_object('success', true, 'message', 'Payment processed successfully');
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

COMMENT ON FUNCTION public.verify_and_process_payment IS 'Atomically completes a payment transaction and adds purchased credits to clinic_credits';
