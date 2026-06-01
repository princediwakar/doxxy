CREATE OR REPLACE FUNCTION generate_uhid(clinic_id_arg uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  clinic_initial text;
  year_suffix text;
  latest_uhid text;
  next_seq int;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('uhid_gen_' || clinic_id_arg::text));

  SELECT UPPER(LEFT(name, 1)) INTO clinic_initial
  FROM clinics WHERE id = clinic_id_arg;

  IF clinic_initial IS NULL THEN
    clinic_initial := 'C';
  END IF;

  year_suffix := TO_CHAR(EXTRACT(YEAR FROM NOW()) % 100, 'FM00');

  -- Strict 9-character match
  SELECT uhid INTO latest_uhid
  FROM patients
  WHERE clinic_id = clinic_id_arg
    AND uhid LIKE clinic_initial || year_suffix || '______'
  ORDER BY uhid DESC
  LIMIT 1;

  IF latest_uhid IS NULL THEN
    next_seq := 1;
  ELSE
    next_seq := CAST(RIGHT(latest_uhid, 6) AS int) + 1;
  END IF;

  RETURN clinic_initial || year_suffix || LPAD(next_seq::text, 6, '0');
END;
$$;
