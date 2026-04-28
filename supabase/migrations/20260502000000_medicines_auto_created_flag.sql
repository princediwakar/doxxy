-- Add is_auto_created flag to medicines table
-- This tracks medicines auto-created from procurement entry
-- vs. manually curated medicines

ALTER TABLE public.medicines
  ADD COLUMN IF NOT EXISTS is_auto_created BOOLEAN DEFAULT FALSE NOT NULL;

-- Create index for filtering auto-created medicines if needed
CREATE INDEX IF NOT EXISTS idx_medicines_is_auto_created
  ON public.medicines (is_auto_created);