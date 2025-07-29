-- PRODUCTION RLS POLICY FIX
-- Run this SQL directly in your Supabase dashboard SQL editor
-- This will replace the old broad policies with the new tightened ones

-- ================================
-- STEP 1: ENSURE HELPER FUNCTIONS
-- ================================

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM clinic_members 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'
  );
$$;

CREATE OR REPLACE FUNCTION public.user_clinic_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT clinic_id FROM clinic_members WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_user_role_in_clinic(check_clinic_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role::text FROM clinic_members 
  WHERE user_id = auth.uid() 
  AND clinic_id = check_clinic_id
  LIMIT 1;
$$;

-- ================================
-- STEP 2: REMOVE OLD POLICIES
-- ================================

-- Remove the old broad policies you saw in production
DROP POLICY IF EXISTS "appointment_billing_clinic_isolation" ON "public"."appointment_billing";
DROP POLICY IF EXISTS "appointments_clinic_isolation" ON "public"."appointments";
DROP POLICY IF EXISTS "bills_clinic_isolation" ON "public"."bills";
DROP POLICY IF EXISTS "clinic_credits_clinic_isolation" ON "public"."clinic_credits";
DROP POLICY IF EXISTS "patients_clinic_isolation" ON "public"."patients";
DROP POLICY IF EXISTS "consultations_clinic_isolation" ON "public"."consultations";
DROP POLICY IF EXISTS "payment_transactions_clinic_isolation" ON "public"."payment_transactions";

-- ================================
-- STEP 3: PATIENTS - ADMIN CONTROLS
-- ================================

CREATE POLICY "patients_read_clinic_members" ON "public"."patients"
FOR SELECT USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  OR public.is_superadmin()
);

CREATE POLICY "patients_admin_create" ON "public"."patients"
FOR INSERT WITH CHECK (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR public.is_superadmin()
  )
);

CREATE POLICY "patients_admin_update" ON "public"."patients"
FOR UPDATE USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR public.is_superadmin()
  )
);

-- ================================
-- STEP 4: APPOINTMENTS - DOCTOR ISOLATION
-- ================================

CREATE POLICY "appointments_read_role_filtered" ON "public"."appointments"
FOR SELECT USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    -- Doctors see only their appointments
    (public.get_user_role_in_clinic(clinic_id) = 'doctor' 
     AND doctor_id IN (
       SELECT d.id FROM doctors d WHERE d.user_id = auth.uid() AND d.clinic_id = appointments.clinic_id
     ))
    OR
    -- Staff and superadmins see all
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR
    public.is_superadmin()
  )
);

CREATE POLICY "appointments_staff_create" ON "public"."appointments"
FOR INSERT WITH CHECK (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR public.is_superadmin()
  )
);

CREATE POLICY "appointments_role_based_update" ON "public"."appointments"
FOR UPDATE USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    -- Doctors can update their own appointments
    (public.get_user_role_in_clinic(clinic_id) = 'doctor' 
     AND doctor_id IN (
       SELECT d.id FROM doctors d WHERE d.user_id = auth.uid() AND d.clinic_id = appointments.clinic_id
     ))
    OR
    -- Staff and superadmins can update all
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR
    public.is_superadmin()
  )
);

-- ================================
-- STEP 5: CONSULTATIONS - DOCTOR ONLY
-- ================================

CREATE POLICY "consultations_read_role_based" ON "public"."consultations"
FOR SELECT USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    -- Doctors see their consultations
    (public.get_user_role_in_clinic(clinic_id) = 'doctor' 
     AND doctor_id IN (
       SELECT d.id FROM doctors d WHERE d.user_id = auth.uid() AND d.clinic_id = consultations.clinic_id
     ))
    OR
    -- Staff and superadmins see all for admin purposes
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR
    public.is_superadmin()
  )
);

CREATE POLICY "consultations_doctor_only_create" ON "public"."consultations"
FOR INSERT WITH CHECK (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    public.get_user_role_in_clinic(clinic_id) = 'doctor'
    OR public.is_superadmin()
  )
);

CREATE POLICY "consultations_doctor_only_update" ON "public"."consultations"
FOR UPDATE USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    -- Only the creating doctor can update
    (public.get_user_role_in_clinic(clinic_id) = 'doctor'
     AND doctor_id IN (
       SELECT d.id FROM doctors d WHERE d.user_id = auth.uid() AND d.clinic_id = consultations.clinic_id
     ))
    OR public.is_superadmin()
  )
);

-- ================================
-- STEP 6: BILLS - ADMIN CONTROLS
-- ================================

CREATE POLICY "bills_read_clinic_access" ON "public"."bills"
FOR SELECT USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  OR public.is_superadmin()
);

CREATE POLICY "bills_admin_create" ON "public"."bills"
FOR INSERT WITH CHECK (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR public.is_superadmin()
  )
);

CREATE POLICY "bills_admin_update" ON "public"."bills"
FOR UPDATE USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR public.is_superadmin()
  )
);

-- ================================
-- STEP 7: PAYMENT_TRANSACTIONS - ADMIN ONLY
-- ================================

CREATE POLICY "payment_transactions_admin_read" ON "public"."payment_transactions"
FOR SELECT USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR public.is_superadmin()
  )
);

CREATE POLICY "payment_transactions_admin_create" ON "public"."payment_transactions"
FOR INSERT WITH CHECK (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR public.is_superadmin()
  )
);

CREATE POLICY "payment_transactions_superadmin_update" ON "public"."payment_transactions"
FOR UPDATE USING (public.is_superadmin());

-- ================================
-- STEP 8: APPOINTMENT_BILLING - ADMIN OVERSIGHT
-- ================================

CREATE POLICY "appointment_billing_admin_read" ON "public"."appointment_billing"
FOR SELECT USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR public.is_superadmin()
  )
);

CREATE POLICY "appointment_billing_system_create" ON "public"."appointment_billing"
FOR INSERT WITH CHECK (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR public.is_superadmin()
  )
);

-- ================================
-- STEP 9: CLINIC_CREDITS - ADMIN CONTROL
-- ================================

CREATE POLICY "clinic_credits_admin_read" ON "public"."clinic_credits"
FOR SELECT USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR public.is_superadmin()
  )
);

CREATE POLICY "clinic_credits_system_modify" ON "public"."clinic_credits"
FOR ALL USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR public.is_superadmin()
  )
);

-- ================================
-- STEP 10: GRANT PERMISSIONS
-- ================================

GRANT EXECUTE ON FUNCTION public.is_superadmin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_clinic_ids() TO authenticated;  
GRANT EXECUTE ON FUNCTION public.get_user_role_in_clinic(UUID) TO authenticated;

-- ================================
-- SUCCESS MESSAGE
-- ================================

SELECT 'RLS policies successfully updated! Check the Authentication -> Policies section to verify the new role-based policies are in place.' as status;