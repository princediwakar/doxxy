-- Schema cleanup: duplicate FKs, type fixes, missing column, dead code
-- See: https://github.com/anthropics/claude-code/issues (PR description has full rationale)

BEGIN;

-- ============================================================================
-- 1. DROP DUPLICATE FOREIGN KEY CONSTRAINTS
-- Both clinic_members and doctors have two FKs pointing to profiles.id
-- ============================================================================
ALTER TABLE public.clinic_members DROP CONSTRAINT IF EXISTS fk_clinic_members_profiles;
ALTER TABLE public.doctors DROP CONSTRAINT IF EXISTS fk_doctors_profiles;

-- ============================================================================
-- 2. FIX appointments.date and time: text → proper types
-- Data is clean ISO format (YYYY-MM-DD / HH:MM) — verified before migration
-- ============================================================================
ALTER TABLE public.appointments
  ALTER COLUMN date TYPE date USING date::date,
  ALTER COLUMN time TYPE time without time zone USING time::time;

-- ============================================================================
-- 3. ADD updated_at TO procurement_items (only modern table missing it)
-- ============================================================================
ALTER TABLE public.procurement_items
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.update_procurement_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_procurement_items_updated_at ON public.procurement_items;
CREATE TRIGGER set_procurement_items_updated_at
  BEFORE UPDATE ON public.procurement_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_procurement_items_updated_at();

-- ============================================================================
-- 4. ADD CHECK CONSTRAINT ON patients.gender
-- Clean up empty strings, then constrain to known values
-- ============================================================================
UPDATE public.patients SET gender = NULL WHERE gender = '';

ALTER TABLE public.patients
  ADD CONSTRAINT patients_gender_check
  CHECK (gender IS NULL OR gender IN ('Male', 'Female', 'Other'));

-- ============================================================================
-- 5. DROP DEAD bills.items COLUMN
-- 0 of 68 rows have data. Codebase exclusively uses service_items.
-- validate_bill_items trigger function is not attached to any table.
-- ============================================================================
ALTER TABLE public.bills DROP COLUMN IF EXISTS items;
DROP FUNCTION IF EXISTS public.validate_bill_items();

COMMIT;
