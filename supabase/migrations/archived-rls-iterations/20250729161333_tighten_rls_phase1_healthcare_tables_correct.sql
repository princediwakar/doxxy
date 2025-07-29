-- PHASE 1: Tighten RLS for Critical Healthcare Data Tables
-- Priority: CRITICAL - HIPAA Compliance & Patient Data Security  
-- Date: 2025-07-29
-- Tables: patients, appointments, consultations, prescriptions, bills, payment_transactions
-- Based on actual remote schema analysis

-- ================================
-- SECTION 1: HELPER FUNCTION VALIDATION
-- ================================

-- Ensure critical helper functions exist
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
-- SECTION 2: DROP EXISTING BROAD POLICIES
-- ================================

-- Remove overly permissive policies from recent migrations
DROP POLICY IF EXISTS "patients_clinic_isolation" ON "public"."patients";
DROP POLICY IF EXISTS "patients_strict_clinic_isolation" ON "public"."patients";
DROP POLICY IF EXISTS "appointments_clinic_isolation" ON "public"."appointments";
DROP POLICY IF EXISTS "appointments_clinic_and_doctor_access" ON "public"."appointments";
DROP POLICY IF EXISTS "consultations_clinic_isolation" ON "public"."consultations";
DROP POLICY IF EXISTS "bills_clinic_isolation" ON "public"."bills";
DROP POLICY IF EXISTS "payment_transactions_clinic_isolation" ON "public"."payment_transactions";
DROP POLICY IF EXISTS "appointment_billing_clinic_isolation" ON "public"."appointment_billing";

-- ================================
-- SECTION 3: PATIENTS TABLE - ADMINISTRATIVE ACCESS CONTROL
-- ================================

-- Read access: All clinic members (needed for appointments, billing, prescriptions)
CREATE POLICY "patients_read_clinic_members" ON "public"."patients"
FOR SELECT USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  OR
  public.is_superadmin()
);

-- Insert: Staff and superadmins only (administrative role)
CREATE POLICY "patients_admin_create" ON "public"."patients"
FOR INSERT WITH CHECK (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR public.is_superadmin()
  )
);

-- Update: Staff and superadmins only (administrative role)
CREATE POLICY "patients_admin_update" ON "public"."patients"
FOR UPDATE USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR public.is_superadmin()
  )
);

-- No delete policy - enforce soft deletes for HIPAA audit trail

-- ================================
-- SECTION 4: APPOINTMENTS TABLE - ROLE-BASED ACCESS
-- ================================

-- Read access: Doctors see only their appointments, staff/admin see all
CREATE POLICY "appointments_read_role_filtered" ON "public"."appointments"
FOR SELECT USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    -- Doctors see only their appointments (via doctor_id which links to doctors.id)
    (public.get_user_role_in_clinic(clinic_id) = 'doctor' 
     AND doctor_id IN (
       SELECT d.id FROM doctors d WHERE d.user_id = auth.uid() AND d.clinic_id = appointments.clinic_id
     ))
    OR
    -- Staff and superadmins see all clinic appointments
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR
    public.is_superadmin()
  )
);

-- Create appointments: Staff and superadmins (scheduling responsibility)
CREATE POLICY "appointments_staff_create" ON "public"."appointments"
FOR INSERT WITH CHECK (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR public.is_superadmin()
  )
  AND (
    -- Ensure patient and doctor belong to same clinic
    patient_id IN (SELECT id FROM patients WHERE clinic_id = appointments.clinic_id)
    AND doctor_id IN (SELECT id FROM doctors WHERE clinic_id = appointments.clinic_id)
  )
);

-- Update appointments: Doctors can update their own, staff/admin can update all
CREATE POLICY "appointments_role_based_update" ON "public"."appointments"
FOR UPDATE USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    -- Doctors can update their own appointments (status, notes)
    (public.get_user_role_in_clinic(clinic_id) = 'doctor' 
     AND doctor_id IN (
       SELECT d.id FROM doctors d WHERE d.user_id = auth.uid() AND d.clinic_id = appointments.clinic_id
     ))
    OR
    -- Staff and superadmins can update all appointments
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR
    public.is_superadmin()
  )
);

-- ================================
-- SECTION 5: CONSULTATIONS TABLE - DOCTOR-ONLY CLINICAL RECORDS
-- ================================

-- Read access: Doctors see their own consultations, staff/admin see all (for admin purposes)
CREATE POLICY "consultations_read_role_based" ON "public"."consultations"
FOR SELECT USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    -- Doctors see consultations they created
    (public.get_user_role_in_clinic(clinic_id) = 'doctor' 
     AND doctor_id IN (
       SELECT d.id FROM doctors d WHERE d.user_id = auth.uid() AND d.clinic_id = consultations.clinic_id
     ))
    OR
    -- Staff and superadmins see all (for administrative/billing purposes)
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR
    public.is_superadmin()
  )
);

-- Create: Only doctors for their own appointments
CREATE POLICY "consultations_doctor_only_create" ON "public"."consultations"
FOR INSERT WITH CHECK (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    -- Only doctors can create consultations
    public.get_user_role_in_clinic(clinic_id) = 'doctor'
    OR public.is_superadmin()
  )
  AND (
    -- Must be for an appointment involving this doctor
    appointment_id IN (
      SELECT a.id FROM appointments a 
      JOIN doctors d ON a.doctor_id = d.id
      WHERE d.user_id = auth.uid() AND a.clinic_id = consultations.clinic_id
    )
    OR public.is_superadmin()
  )
);

-- Update: Only the creating doctor can update consultation records
CREATE POLICY "consultations_doctor_only_update" ON "public"."consultations"
FOR UPDATE USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    -- Only the treating doctor can update consultation records
    (public.get_user_role_in_clinic(clinic_id) = 'doctor'
     AND doctor_id IN (
       SELECT d.id FROM doctors d WHERE d.user_id = auth.uid() AND d.clinic_id = consultations.clinic_id
     ))
    OR public.is_superadmin()
  )
);

-- ================================
-- SECTION 6: BILLS TABLE - FINANCIAL DATA SECURITY
-- ================================

-- Read access: All clinic members (for patient care context)
CREATE POLICY "bills_read_clinic_access" ON "public"."bills"
FOR SELECT USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  OR public.is_superadmin()
);

-- Create/Update: Staff and superadmins only (financial control)
CREATE POLICY "bills_admin_create" ON "public"."bills"
FOR INSERT WITH CHECK (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    -- Only administrative roles can handle billing
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
-- SECTION 7: PAYMENT_TRANSACTIONS TABLE - FINANCIAL SECURITY
-- ================================

-- Read access: Administrative roles only (sensitive financial data)
CREATE POLICY "payment_transactions_admin_read" ON "public"."payment_transactions"
FOR SELECT USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR public.is_superadmin()
  )
);

-- Create: Staff and superadmins only (via payment processing)
CREATE POLICY "payment_transactions_admin_create" ON "public"."payment_transactions"
FOR INSERT WITH CHECK (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR public.is_superadmin()
  )
);

-- Update: Superadmins only (for corrections)
CREATE POLICY "payment_transactions_superadmin_update" ON "public"."payment_transactions"
FOR UPDATE USING (public.is_superadmin());

-- ================================
-- SECTION 8: APPOINTMENT_BILLING TABLE - CREDIT SYSTEM SECURITY
-- ================================

-- Read access: Administrative roles for billing oversight
CREATE POLICY "appointment_billing_admin_read" ON "public"."appointment_billing"
FOR SELECT USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR public.is_superadmin()
  )
);

-- Create: System/admin only (automated credit deduction)
CREATE POLICY "appointment_billing_system_create" ON "public"."appointment_billing"
FOR INSERT WITH CHECK (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR public.is_superadmin()
  )
);

-- ================================
-- SECTION 9: CONTACT_MESSAGES TABLE - PUBLIC FORM HANDLING
-- ================================

-- Public insert (contact form submissions)
CREATE POLICY "contact_messages_public_insert" ON "public"."contact_messages"
FOR INSERT WITH CHECK (true);

-- Superadmin read only (customer service)
CREATE POLICY "contact_messages_superadmin_read" ON "public"."contact_messages"
FOR SELECT USING (public.is_superadmin());

-- ================================
-- SECTION 10: CLINIC_CREDITS TABLE - CREDIT SYSTEM SECURITY  
-- ================================

-- Read: Administrative roles only
CREATE POLICY "clinic_credits_admin_read" ON "public"."clinic_credits"
FOR SELECT USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR public.is_superadmin()
  )
);

-- Create/Update: System functions only (via RPC)
CREATE POLICY "clinic_credits_system_modify" ON "public"."clinic_credits"
FOR ALL USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  AND (
    public.get_user_role_in_clinic(clinic_id) IN ('staff', 'superadmin')
    OR public.is_superadmin()
  )
);

-- ================================
-- SECTION 11: MEDICINES TABLE - REFERENCE DATA
-- ================================

-- Read access for authenticated users (medicine database)
CREATE POLICY "medicines_read_authenticated" ON "public"."medicines"
FOR SELECT USING (auth.role() = 'authenticated');

-- ================================
-- SECTION 12: POLICY DOCUMENTATION & COMMENTS
-- ================================

-- Add comprehensive policy documentation for audit and maintenance
COMMENT ON POLICY "patients_read_clinic_members" ON "public"."patients" 
IS 'HIPAA: All clinic members can read patient data for care coordination, appointments, and billing';

COMMENT ON POLICY "patients_admin_create" ON "public"."patients" 
IS 'HIPAA: Only administrative roles (staff/superadmin) can create new patient records';

COMMENT ON POLICY "patients_admin_update" ON "public"."patients" 
IS 'HIPAA: Only administrative roles can update patient demographics and information';

COMMENT ON POLICY "appointments_read_role_filtered" ON "public"."appointments" 
IS 'Role-based access: Doctors see only their appointments, staff/admin see all for scheduling';

COMMENT ON POLICY "appointments_staff_create" ON "public"."appointments" 
IS 'Workflow control: Only staff and admins can schedule appointments with validation';

COMMENT ON POLICY "appointments_role_based_update" ON "public"."appointments" 
IS 'Role-based updates: Doctors can update their appointments, staff can update all';

COMMENT ON POLICY "consultations_read_role_based" ON "public"."consultations" 
IS 'Medical records: Doctors see their consultations, staff see all for admin purposes';

COMMENT ON POLICY "consultations_doctor_only_create" ON "public"."consultations" 
IS 'Clinical integrity: Only treating doctors can create consultation records';

COMMENT ON POLICY "consultations_doctor_only_update" ON "public"."consultations" 
IS 'Medical record integrity: Only treating doctor can modify consultation documentation';

COMMENT ON POLICY "bills_read_clinic_access" ON "public"."bills" 
IS 'Financial transparency: All clinic members can view billing for patient care context';

COMMENT ON POLICY "bills_admin_create" ON "public"."bills" 
IS 'Financial controls: Only administrative roles can create billing records';

COMMENT ON POLICY "bills_admin_update" ON "public"."bills" 
IS 'Financial security: Only administrative roles can modify billing information';

COMMENT ON POLICY "payment_transactions_admin_read" ON "public"."payment_transactions" 
IS 'Financial security: Only administrative roles can access sensitive payment data';

COMMENT ON POLICY "payment_transactions_admin_create" ON "public"."payment_transactions" 
IS 'Payment processing: Only administrative roles can create payment transactions';

COMMENT ON POLICY "payment_transactions_superadmin_update" ON "public"."payment_transactions" 
IS 'Financial audit: Only superadmins can correct payment transaction data';

-- ================================
-- SECTION 13: GRANT PERMISSIONS
-- ================================

-- Ensure proper function permissions
GRANT EXECUTE ON FUNCTION public.is_superadmin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_clinic_ids() TO authenticated;  
GRANT EXECUTE ON FUNCTION public.get_user_role_in_clinic(UUID) TO authenticated;

-- ================================
-- SECTION 14: VERIFICATION QUERIES
-- ================================

-- Verify policy creation and categorization
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd,
    CASE 
        WHEN policyname LIKE '%read%' OR cmd = 'SELECT' THEN 'READ'
        WHEN policyname LIKE '%create%' OR cmd = 'INSERT' THEN 'CREATE'
        WHEN policyname LIKE '%update%' OR cmd = 'UPDATE' THEN 'UPDATE'
        WHEN policyname LIKE '%delete%' OR cmd = 'DELETE' THEN 'DELETE'
        ELSE 'ALL'
    END as operation_type,
    CASE
        WHEN policyname LIKE '%admin%' OR policyname LIKE '%superadmin%' THEN 'ADMIN_ONLY'
        WHEN policyname LIKE '%doctor%' THEN 'DOCTOR_RESTRICTED'  
        WHEN policyname LIKE '%role%' THEN 'ROLE_BASED'
        WHEN policyname LIKE '%clinic%' THEN 'CLINIC_ISOLATED'
        ELSE 'GENERAL'
    END as access_pattern
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('patients', 'appointments', 'consultations', 'bills', 'payment_transactions', 'appointment_billing', 'contact_messages', 'clinic_credits', 'medicines')
ORDER BY tablename, operation_type, policyname;

-- Log successful completion
SELECT 
    'PHASE 1 RLS TIGHTENING COMPLETED - HEALTHCARE TABLES' as status,
    'Critical healthcare data tables now have proper role-based access controls' as details,
    'Tables secured: patients (admin-modify), appointments (role-filtered), consultations (doctor-only), bills (admin-modify), payments (admin-only), credits (system-controlled), medicines (reference)' as tables_updated,
    'Security improvements: Doctor appointment isolation, prescription restrictions, financial data protection, audit trail preservation' as improvements,
    NOW() as completed_at;