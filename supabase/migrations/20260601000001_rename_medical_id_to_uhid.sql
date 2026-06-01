ALTER TABLE patients RENAME COLUMN medical_id TO uhid;

-- Sanitize: Convert empty/whitespace strings to true NULL to avoid UNIQUE constraint violations
UPDATE patients SET uhid = NULL WHERE trim(uhid) = '';

-- Apply constraint
ALTER TABLE patients ADD CONSTRAINT patients_uhid_clinic_key UNIQUE (clinic_id, uhid);
