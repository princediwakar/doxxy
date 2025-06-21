-- Drop temporary/debug functions
DROP FUNCTION IF EXISTS public.debug_clinic_creation(uuid);
DROP FUNCTION IF EXISTS public.repair_clinic_relationships();
DROP FUNCTION IF EXISTS public.repair_missing_doctor_profiles();
DROP FUNCTION IF EXISTS public.set_auth_uid(uuid);

-- Drop redundant trigger
DROP TRIGGER IF EXISTS delete_doctor_on_clinic_member_delete ON public.clinic_members;
DROP FUNCTION IF EXISTS public.delete_doctor_on_clinic_member_delete();

-- Drop redundant functions
DROP FUNCTION IF EXISTS public.get_doctors_by_clinic(clinic_id uuid);

-- Add comment to document the cleanup
COMMENT ON FUNCTION public.handle_clinic_member_removal() IS 'Handles cleanup of doctor-specific data when a clinic member is removed. This is the single source of truth for member removal cleanup.';
COMMENT ON FUNCTION public.get_doctors_by_clinic_enhanced(clinic_id uuid) IS 'Enhanced version of get_doctors_by_clinic with additional doctor profile fields. This is the single source of truth for doctor data retrieval.';

-- Note: get_doctors_by_clinic() is still in use by several components
-- We will remove it in a separate migration after updating those components 