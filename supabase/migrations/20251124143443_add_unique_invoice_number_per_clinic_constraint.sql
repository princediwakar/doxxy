-- Add unique constraint to prevent duplicate invoice numbers within the same clinic
-- This ensures that invoice numbers are unique per clinic, but can be duplicated across different clinics

-- First, we need to handle existing duplicates by updating them
-- We'll add a suffix to duplicate invoice numbers to make them unique
WITH duplicates AS (
    SELECT
        id,
        clinic_id,
        invoice_number,
        ROW_NUMBER() OVER (PARTITION BY clinic_id, invoice_number ORDER BY created_at) as row_num
    FROM
        bills
    WHERE
        invoice_number IS NOT NULL
)
UPDATE bills
SET invoice_number = invoice_number || '-dup-' || (row_num - 1)
FROM duplicates
WHERE bills.id = duplicates.id AND duplicates.row_num > 1;

-- Now add the unique constraint
ALTER TABLE bills
ADD CONSTRAINT unique_invoice_number_per_clinic
UNIQUE (clinic_id, invoice_number);