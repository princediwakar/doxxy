-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "appointments_staff_create" ON "public"."appointments";

-- Create a broader policy that includes doctors
CREATE POLICY "appointments_staff_create" ON "public"."appointments"
FOR INSERT WITH CHECK (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    -- Staff and superadmin can create any appointment in their clinics
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR public.is_superadmin()
    -- Doctors can create appointments where they are the assigned doctor
    OR (
      public.get_user_role_in_clinic(clinic_id) = 'doctor'
      AND doctor_id IN (
        SELECT d.id FROM doctors d WHERE d.user_id = auth.uid() AND d.clinic_id = clinic_id
      )
    )
  )
);
