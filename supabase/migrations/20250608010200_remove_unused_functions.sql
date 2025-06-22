-- Remove unused and one-time repair functions
-- These functions are either not used in the codebase or were meant for one-time data repair

-- Remove one-time repair functions that should have been cleaned up earlier
DROP FUNCTION IF EXISTS public.repair_clinic_relationships();
DROP FUNCTION IF EXISTS public.repair_missing_doctor_profiles();
DROP FUNCTION IF EXISTS public.set_auth_uid(uuid);

-- Remove unused functions not referenced in the codebase
DROP FUNCTION IF EXISTS public.get_patients_by_doctor(uuid, uuid, integer, integer);
DROP FUNCTION IF EXISTS public.calculate_doctor_profile_completion(uuid);

-- Note: Keeping search_medicines for potential future use in medicine search feature
-- DROP FUNCTION IF EXISTS public.search_medicines(text, integer);

-- Add comment about remaining functions
COMMENT ON FUNCTION public.search_medicines(text, integer) IS 
'Medicine search function - kept for potential future medicine search feature implementation.'; 