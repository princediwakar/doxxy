-- Delete older duplicate bills, keep only the most recent per appointment
DELETE FROM bills
WHERE id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (PARTITION BY appointment_id ORDER BY created_at DESC) as rn
    FROM bills
    WHERE appointment_id IS NOT NULL
  ) ranked
  WHERE ranked.rn > 1
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE bills
ADD CONSTRAINT bills_appointment_id_unique UNIQUE (appointment_id);
