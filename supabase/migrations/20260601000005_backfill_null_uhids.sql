-- Backfill ALL patients with 9-char UHIDs (156 patients across 4 clinics)
-- Migration 4 already moved legacy values into legacy_medical_id and nulled them.
-- This assigns proper {clinic_initial}{2-digit year}{6-digit seq} UHIDs to
-- every patient with a NULL uhid, ordered by created_at.
--
-- Clinics:
--   Neurovision Clinic (N): 23 NULL + 60 legacy → 83 patients
--   Mental Clinic (M):      53 NULL                → 53 patients
--   Test Clinic (T):        19 NULL                → 19 patients
--   neuro 3 (N):             1 NULL                →  1 patient
--
-- Does NOT use generate_uhid() in a loop because intra-transaction visibility
-- would cause duplicate sequence numbers. Replicates the logic instead.

DO $$
DECLARE
  clinic_record RECORD;
  clinic_initial text;
  year_suffix text;
  base_seq int;
  patient_record RECORD;
  seq_counter int;
BEGIN
  year_suffix := TO_CHAR(EXTRACT(YEAR FROM NOW()) % 100, 'FM00');

  FOR clinic_record IN
    SELECT DISTINCT c.id, UPPER(LEFT(c.name, 1)) as initial
    FROM clinics c
    INNER JOIN patients p ON p.clinic_id = c.id
    WHERE p.uhid IS NULL
  LOOP
    clinic_initial := COALESCE(clinic_record.initial, 'C');

    -- Find highest existing 9-char sequence for this clinic
    SELECT COALESCE(MAX(CAST(RIGHT(uhid, 6) AS int)), 0) INTO base_seq
    FROM patients
    WHERE clinic_id = clinic_record.id
      AND uhid LIKE clinic_initial || year_suffix || '______';

    seq_counter := base_seq + 1;

    FOR patient_record IN
      SELECT id FROM patients
      WHERE clinic_id = clinic_record.id AND uhid IS NULL
      ORDER BY created_at ASC
    LOOP
      UPDATE patients
      SET uhid = clinic_initial || year_suffix || LPAD(seq_counter::text, 6, '0')
      WHERE id = patient_record.id;

      seq_counter := seq_counter + 1;
    END LOOP;
  END LOOP;
END;
$$;
