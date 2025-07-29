-- PRODUCTION FIX: Apply Tightened RLS Policies
-- This migration ensures the production environment has the correct tightened RLS policies
-- Date: 2025-07-29
-- Status: CRITICAL - Production security fix

-- ================================
-- SECTION 1: ENSURE HELPER FUNCTIONS
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
-- SECTION 2: REMOVE OLD BROAD POLICIES
-- ================================

-- Remove old permissive policies shown in production
DROP POLICY IF EXISTS "appointment_billing_clinic_isolation" ON "public"."appointment_billing";
DROP POLICY IF EXISTS "appointments_clinic_isolation" ON "public"."appointments";
DROP POLICY IF EXISTS "bills_clinic_isolation" ON "public"."bills";
DROP POLICY IF EXISTS "clinic_credits_clinic_isolation" ON "public"."clinic_credits";
DROP POLICY IF EXISTS "patients_clinic_isolation" ON "public"."patients";
DROP POLICY IF EXISTS "consultations_clinic_isolation" ON "public"."consultations";
DROP POLICY IF EXISTS "payment_transactions_clinic_isolation" ON "public"."payment_transactions";

-- Also remove any other variations that might exist
DROP POLICY IF EXISTS "patients_strict_clinic_isolation" ON "public"."patients";
DROP POLICY IF EXISTS "appointments_clinic_and_doctor_access" ON "public"."appointments";

-- ================================
-- SECTION 3: APPLY TIGHTENED POLICIES - PATIENTS
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
-- SECTION 4: APPLY TIGHTENED POLICIES - APPOINTMENTS
-- ================================

CREATE POLICY "appointments_read_role_filtered" ON "public"."appointments"
FOR SELECT USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    (public.get_user_role_in_clinic(clinic_id) = 'doctor' 
     AND doctor_id IN (
       SELECT d.id FROM doctors d WHERE d.user_id = auth.uid() AND d.clinic_id = appointments.clinic_id
     ))
    OR
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
    (public.get_user_role_in_clinic(clinic_id) = 'doctor' 
     AND doctor_id IN (
       SELECT d.id FROM doctors d WHERE d.user_id = auth.uid() AND d.clinic_id = appointments.clinic_id
     ))
    OR
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR
    public.is_superadmin()
  )
);

-- ================================
-- SECTION 5: APPLY TIGHTENED POLICIES - CONSULTATIONS
-- ================================

CREATE POLICY "consultations_read_role_based" ON "public"."consultations"
FOR SELECT USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    (public.get_user_role_in_clinic(clinic_id) = 'doctor' 
     AND doctor_id IN (
       SELECT d.id FROM doctors d WHERE d.user_id = auth.uid() AND d.clinic_id = consultations.clinic_id
     ))
    OR
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
    (public.get_user_role_in_clinic(clinic_id) = 'doctor'
     AND doctor_id IN (
       SELECT d.id FROM doctors d WHERE d.user_id = auth.uid() AND d.clinic_id = consultations.clinic_id
     ))
    OR public.is_superadmin()
  )
);

-- ================================
-- SECTION 6: APPLY TIGHTENED POLICIES - BILLS
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
-- SECTION 7: APPLY TIGHTENED POLICIES - PAYMENT_TRANSACTIONS
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
-- SECTION 8: APPLY TIGHTENED POLICIES - APPOINTMENT_BILLING
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
-- SECTION 9: APPLY TIGHTENED POLICIES - CLINIC_CREDITS
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
-- SECTION 10: GRANT PERMISSIONS
-- ================================

GRANT EXECUTE ON FUNCTION public.is_superadmin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_clinic_ids() TO authenticated;  
GRANT EXECUTE ON FUNCTION public.get_user_role_in_clinic(UUID) TO authenticated;

-- ================================
-- SECTION 11: VERIFICATION
-- ================================

-- Log successful completion
SELECT 
    'PRODUCTION RLS POLICIES FIXED' as status,
    'Tightened role-based policies now applied to production' as details,
    'Old broad clinic_isolation policies removed and replaced with granular controls' as changes,
    NOW() as completed_at;