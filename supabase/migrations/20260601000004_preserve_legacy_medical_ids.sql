-- Preserve all existing UHID values before backfilling 9-char format.
-- 60 patients have manually-entered values like "2025114".
-- Archive them to legacy_medical_id so the backfill can assign fresh UHIDs to everyone.

ALTER TABLE patients ADD COLUMN legacy_medical_id text;

-- Save every non-null UHID, then clear the column for backfill
UPDATE patients
SET legacy_medical_id = uhid,
    uhid = NULL
WHERE uhid IS NOT NULL;
