-- Remove 'Other' from gender constraint and nullify existing 'Other' values
BEGIN;

-- Nullify any existing patients with gender = 'Other' before changing the constraint
UPDATE public.patients SET gender = NULL WHERE gender = 'Other';

-- Drop the existing constraint
ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patients_gender_check;

-- Re-add the constraint without 'Other'
ALTER TABLE public.patients
  ADD CONSTRAINT patients_gender_check
  CHECK (gender IS NULL OR gender IN ('Male', 'Female'));

COMMIT;
