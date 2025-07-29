-- Add missing unique constraints to match production schema
-- This resolves the unique email constraint errors

-- Add unique email constraint to profiles table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_email' AND conrelid = 'public.profiles'::regclass
    ) THEN
        ALTER TABLE "public"."profiles" ADD CONSTRAINT "unique_email" UNIQUE ("email");
    END IF;
END $$;

-- Add unique constraint for doctors (if not already exists)
DO $$
BEGIN
    -- Drop old constraint if exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'doctors_user_clinic_unique' AND conrelid = 'public.doctors'::regclass
    ) THEN
        ALTER TABLE "public"."doctors" DROP CONSTRAINT "doctors_user_clinic_unique";
    END IF;
    
    -- Add new constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_doctor_per_user_clinic' AND conrelid = 'public.doctors'::regclass
    ) THEN
        ALTER TABLE "public"."doctors" ADD CONSTRAINT "unique_doctor_per_user_clinic" UNIQUE ("user_id", "clinic_id");
    END IF;
END $$;