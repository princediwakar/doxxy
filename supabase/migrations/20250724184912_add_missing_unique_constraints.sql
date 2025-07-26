-- Add missing unique constraints to match production schema
-- This resolves the unique email constraint errors

-- Add unique email constraint to profiles table
ALTER TABLE "public"."profiles" 
ADD CONSTRAINT "unique_email" UNIQUE ("email");

-- Add unique constraint for doctors (if not already exists)
ALTER TABLE "public"."doctors" 
DROP CONSTRAINT IF EXISTS "doctors_user_clinic_unique";

ALTER TABLE "public"."doctors" 
ADD CONSTRAINT "unique_doctor_per_user_clinic" UNIQUE ("user_id", "clinic_id");