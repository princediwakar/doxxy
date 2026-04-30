-- Migration: Backfill create_clinic_with_admin RPC
-- Auto-generated from live database

CREATE OR REPLACE FUNCTION public.create_clinic_with_admin(clinic_name text, user_phone text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  clinic_id uuid;
  user_id uuid;
  result JSON;
BEGIN
  -- Get the current user ID
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Insert the clinic
  INSERT INTO clinics (name)
  VALUES (clinic_name)
  RETURNING id INTO clinic_id;

  -- Add the user as a clinic member with superadmin role
  INSERT INTO clinic_members (user_id, clinic_id, role)
  VALUES (user_id, clinic_id, 'superadmin');

  -- Create initial credit record with 100 free credits for new clinic
  INSERT INTO clinic_credits (
    clinic_id, 
    credit_balance, 
    total_credits_purchased, 
    total_credits_used
  )
  VALUES (
    clinic_id, 
    100,  -- 100 free credits
    100,  -- Count as purchased for accounting
    0     -- No credits used yet
  );

  -- Create a transaction record for the free credits
  INSERT INTO payment_transactions (
    clinic_id,
    transaction_type,
    amount,
    currency,
    credits_purchased,
    payment_status,
    payment_method,
    metadata
  )
  VALUES (
    clinic_id,
    'credit_purchase',
    0.00,  -- Free credits
    'INR',
    100,   -- 100 credits
    'completed',
    'free_credits',
    json_build_object(
      'type', 'welcome_bonus',
      'description', 'Free credits for new clinic',
      'automated', true
    )
  );

  -- Update user phone if provided
  IF user_phone IS NOT NULL THEN
    UPDATE auth.users 
    SET phone = user_phone 
    WHERE id = user_id;
  END IF;

  -- Return the clinic ID
  result := json_build_object('clinic_id', clinic_id);
  RETURN result;
END;
$function$
;
