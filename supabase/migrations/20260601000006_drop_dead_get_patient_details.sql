-- Dead code: get_patient_details was created outside the migration system,
-- references the old "medical_id" column in its body, and is not called by
-- any application code. Remove it so type generation produces clean output.

DROP FUNCTION IF EXISTS public.get_patient_details(uuid);
