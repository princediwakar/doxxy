-- Add unique constraint on (consultation_id, patient_id, doctor_id) to prescriptions table
-- This enables upsert with onConflict and ensures one prescription record per consultation+patient+doctor triplet

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'prescriptions_consultation_patient_doctor_unique'
          AND conrelid = 'public.prescriptions'::regclass
    ) THEN
        ALTER TABLE "public"."prescriptions"
        ADD CONSTRAINT "prescriptions_consultation_patient_doctor_unique"
        UNIQUE ("consultation_id", "patient_id", "doctor_id");
    END IF;
END $$;
