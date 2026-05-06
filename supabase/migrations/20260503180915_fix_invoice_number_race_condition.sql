CREATE OR REPLACE FUNCTION "public"."generate_invoice_number"("clinic_id_arg" "uuid") RETURNS "text"
LANGUAGE "plpgsql" SECURITY DEFINER
AS $$
DECLARE
  clinic_name TEXT;
  latest_invoice TEXT;
  next_number INTEGER;
  prefix TEXT;
  current_year TEXT := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
BEGIN
  -- Acquire advisory lock to serialize invoice generation per clinic
  -- This prevents concurrent calls from generating the same invoice number
  PERFORM pg_advisory_xact_lock(hashtext('invoice_gen_' || clinic_id_arg::text));

  -- Get clinic name for prefix
  SELECT name INTO clinic_name FROM clinics WHERE id = clinic_id_arg;
  IF clinic_name IS NULL THEN
    RAISE EXCEPTION 'Clinic not found for ID: %', clinic_id_arg;
  END IF;

  -- Create prefix: first letter of clinic + current year
  prefix := UPPER(SUBSTRING(clinic_name FROM 1 FOR 1)) || current_year;

  -- Get the latest invoice number with matching prefix
  SELECT invoice_number INTO latest_invoice
  FROM bills
  WHERE clinic_id = clinic_id_arg
    AND invoice_number LIKE prefix || '%'
  ORDER BY created_at DESC
  LIMIT 1;

  -- Extract sequential number (last 6 digits) or start at 1
  IF latest_invoice IS NULL THEN
    next_number := 1;
  ELSE
    next_number := CAST(RIGHT(latest_invoice, 6) AS INTEGER) + 1;
  END IF;

  -- Return properly formatted invoice number
  RETURN prefix || LPAD(next_number::TEXT, 6, '0');

EXCEPTION
  WHEN OTHERS THEN
    RETURN 'TEMP-' || current_year || '-' || LPAD(FLOOR(EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000 + RANDOM() * 1000)::INTEGER::TEXT, 10, '0');
END;
$$;
