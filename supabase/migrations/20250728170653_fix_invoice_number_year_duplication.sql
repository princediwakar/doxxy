-- Fix invoice number generation to prevent year duplication
-- Issue: REGEXP_REPLACE('[^0-9]', '') extracts ALL digits including year
-- Solution: Extract only the last 6 digits (sequential part) from existing invoice numbers

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
  -- Lock bills table to prevent concurrent generation
  PERFORM 1 FROM bills WHERE clinic_id = clinic_id_arg FOR UPDATE;
  
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
    -- Extract only the last 6 digits (sequential part)
    -- Example: From "N2025000001", extract "000001" -> 1, then +1 = 2
    next_number := CAST(RIGHT(latest_invoice, 6) AS INTEGER) + 1;
  END IF;
  
  -- Return properly formatted invoice number
  RETURN prefix || LPAD(next_number::TEXT, 6, '0');
  
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback to timestamp-based temporary number
    RETURN 'TEMP-' || current_year || '-' || LPAD(FLOOR(EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000 + RANDOM() * 1000)::INTEGER::TEXT, 10, '0');
END;
$$;