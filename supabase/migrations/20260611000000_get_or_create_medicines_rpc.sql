-- Path: supabase/migrations/20260611000000_get_or_create_medicines_rpc.sql
-- Atomic medicine resolution for bulk CSV imports and procurement.
-- Targets the existing composite partial index to avoid duplicates.
-- Returns only baseline records (NULL pack_size_label, NULL manufacturer_name)
-- so each name maps to exactly one ID — no Map collision in application code.

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
