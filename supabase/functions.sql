

CREATE OR REPLACE FUNCTION add_clinic_credits(
  p_clinic_id UUID,
  p_credits_to_add INTEGER,
  p_transaction_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $
DECLARE
  v_clinic_credits_data JSON;
BEGIN
  -- Insert or update clinic credits
  INSERT INTO clinic_credits (
    clinic_id,
    credit_balance,
    total_credits_purchased,
    total_credits_used,
    updated_at
  ) VALUES (
    p_clinic_id,
    p_credits_to_add,
    p_credits_to_add,
    0,
    NOW()
  )
  ON CONFLICT (clinic_id) 
  DO UPDATE SET
    credit_balance = clinic_credits.credit_balance + p_credits_to_add,
    total_credits_purchased = clinic_credits.total_credits_purchased + p_credits_to_add,
    updated_at = NOW();

  -- Get the updated clinic credits data
  SELECT to_json(cc.*) INTO v_clinic_credits_data
  FROM clinic_credits cc
  WHERE cc.clinic_id = p_clinic_id;

  -- Return the updated clinic credits data
  RETURN json_build_object(
    'success', true,
    'clinic_credits', v_clinic_credits_data
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION add_clinic_credits TO authenticated;
