-- Add the new consultation_fee column
ALTER TABLE public.doctors ADD COLUMN consultation_fee NUMERIC;

-- Populate the new column with data from the old columns
UPDATE public.doctors
SET consultation_fee = COALESCE(consultation_fee_min, consultation_fee_max);

-- Drop the old columns
ALTER TABLE public.doctors DROP COLUMN consultation_fee_min;
ALTER TABLE public.doctors DROP COLUMN consultation_fee_max; 