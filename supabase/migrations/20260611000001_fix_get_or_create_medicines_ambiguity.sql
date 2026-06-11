-- Path: supabase/migrations/20260611000001_fix_get_or_create_medicines_ambiguity.sql
-- Fix ambiguous column reference in get_or_create_medicines.
-- The original function had a name collision between the output parameter and table column.

CREATE OR REPLACE FUNCTION get_or_create_medicines(med_names TEXT[])
RETURNS TABLE(id BIGINT, name TEXT)
LANGUAGE plpgsql
AS $$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  WITH input_rows AS (
    SELECT DISTINCT unnest(med_names) AS med_name
  ),
  inserted AS (
    INSERT INTO medicines (name, is_auto_created)
    SELECT med_name, true FROM input_rows
    ON CONFLICT (name, COALESCE(pack_size_label, ''), COALESCE(manufacturer_name, ''))
    WHERE is_discontinued = false
    DO NOTHING
    RETURNING medicines.id, medicines.name
  )
  SELECT i.id, i.name FROM inserted i
  UNION
  SELECT m.id, m.name FROM medicines m
  JOIN input_rows ir ON m.name = ir.med_name
  WHERE m.is_discontinued = false
    AND m.pack_size_label IS NULL
    AND m.manufacturer_name IS NULL;
END;
$$;
