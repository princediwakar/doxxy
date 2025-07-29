-- PRODUCTION RLS EMERGENCY FIX
-- This migration fixes disabled RLS and removes duplicate policies in production
-- Critical: clinic_members, doctors, profiles have RLS DISABLED with multiple broken policies
-- Date: 2025-07-29

-- ================================
-- SECTION 1: EMERGENCY RLS ENABLEMENT
-- ================================

-- CRITICAL: Enable RLS on tables that are currently DISABLED in production
ALTER TABLE "public"."clinic_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."contact_messages" ENABLE ROW LEVEL SECURITY;  
ALTER TABLE "public"."doctors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."pending_invitations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

-- ================================
-- SECTION 2: REMOVE ALL DUPLICATE POLICIES
-- ================================

-- Drop ALL existing policies to eliminate duplicates and conflicts
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    -- Get all policies in public schema and drop them
    FOR policy_record IN 
        SELECT tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_record.policyname, policy_record.tablename);
    END LOOP;
END $$;

-- ================================
-- SECTION 3: RECREATE HELPER FUNCTIONS
-- ================================

-- Ensure helper functions exist with correct permissions
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
-- SECTION 4: CRITICAL TABLE POLICIES (PRODUCTION READY)
-- ================================

-- CLINIC_MEMBERS: Most critical table for tenant isolation
CREATE POLICY "clinic_members_secure_access" ON "public"."clinic_members"
FOR ALL USING (
  -- Users can see their own memberships
  user_id = auth.uid()
  OR
  -- Users can see other members in their clinics (for collaboration)
  clinic_id IN (SELECT public.user_clinic_ids())
  OR
  -- Superadmins can manage all memberships
  public.is_superadmin()
);

-- PROFILES: User profile access
CREATE POLICY "profiles_secure_access" ON "public"."profiles"
FOR ALL USING (
  -- Users can access their own profile
  id = auth.uid()
  OR
  -- Clinic members can see other member profiles (for doctor listings, etc.)
  id IN (
    SELECT DISTINCT cm.user_id 
    FROM clinic_members cm
    WHERE cm.clinic_id IN (SELECT public.user_clinic_ids())
  )
  OR
  -- Superadmins can see all profiles
  public.is_superadmin()
);

-- DOCTORS: Critical for appointments and medical data
CREATE POLICY "doctors_secure_access" ON "public"."doctors"
FOR ALL USING (
  -- Doctors can access their own profile
  user_id = auth.uid()
  OR
  -- Clinic members can see doctors in their clinics
  clinic_id IN (SELECT public.user_clinic_ids())
  OR
  -- Superadmins can see all doctors
  public.is_superadmin()
);

-- CLINICS: Organization access
CREATE POLICY "clinics_secure_access" ON "public"."clinics"
FOR ALL USING (
  -- Users can see clinics they're members of
  id IN (SELECT public.user_clinic_ids())
  OR
  -- Superadmins can see all clinics
  public.is_superadmin()
);

-- PENDING_INVITATIONS: Invitation system
CREATE POLICY "pending_invitations_secure_access" ON "public"."pending_invitations"
FOR ALL USING (
  -- Clinic members can manage invitations for their clinics
  clinic_id IN (SELECT public.user_clinic_ids())
  OR
  -- Invited users can see their own invitations by email
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR
  -- Superadmins can see all invitations
  public.is_superadmin()
);

-- ================================
-- SECTION 5: HEALTHCARE DATA POLICIES
-- ================================

-- PATIENTS: Strict clinic isolation for HIPAA compliance
CREATE POLICY "patients_clinic_isolation" ON "public"."patients"
FOR ALL USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  OR
  public.is_superadmin()
);

-- APPOINTMENTS: Clinic isolation
CREATE POLICY "appointments_clinic_isolation" ON "public"."appointments"
FOR ALL USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  OR
  public.is_superadmin()
);

-- CONSULTATIONS: Clinic isolation
CREATE POLICY "consultations_clinic_isolation" ON "public"."consultations"
FOR ALL USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  OR
  public.is_superadmin()
);

-- BILLS: Clinic isolation
CREATE POLICY "bills_clinic_isolation" ON "public"."bills"
FOR ALL USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  OR
  public.is_superadmin()
);

-- PRESCRIPTIONS: Clinic isolation
CREATE POLICY "prescriptions_clinic_isolation" ON "public"."prescriptions"
FOR ALL USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  OR
  public.is_superadmin()
);

-- PAYMENT_TRANSACTIONS: Clinic isolation
CREATE POLICY "payment_transactions_clinic_isolation" ON "public"."payment_transactions"
FOR ALL USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  OR
  public.is_superadmin()
);

-- APPOINTMENT_BILLING: Clinic isolation
CREATE POLICY "appointment_billing_clinic_isolation" ON "public"."appointment_billing"
FOR ALL USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  OR
  public.is_superadmin()
);

-- MONTHLY_BILLING_CYCLES: Clinic isolation
CREATE POLICY "monthly_billing_cycles_clinic_isolation" ON "public"."monthly_billing_cycles"
FOR ALL USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  OR
  public.is_superadmin()
);

-- CLINIC_CREDITS: Clinic isolation
CREATE POLICY "clinic_credits_clinic_isolation" ON "public"."clinic_credits"
FOR ALL USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  OR
  public.is_superadmin()
);

-- ================================
-- SECTION 6: ORGANIZATIONAL DATA
-- ================================

-- CLINIC_DEPARTMENTS: Clinic isolation
CREATE POLICY "clinic_departments_clinic_access" ON "public"."clinic_departments"
FOR ALL USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  OR
  public.is_superadmin()
);

-- DEPARTMENT_TYPES: Reference data
CREATE POLICY "department_types_read_all" ON "public"."department_types"
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "department_types_superadmin_manage" ON "public"."department_types"
FOR INSERT WITH CHECK (public.is_superadmin());

CREATE POLICY "department_types_superadmin_update" ON "public"."department_types"
FOR UPDATE USING (public.is_superadmin());

CREATE POLICY "department_types_superadmin_delete" ON "public"."department_types"
FOR DELETE USING (public.is_superadmin());

-- ================================
-- SECTION 7: SPECIAL ACCESS TABLES
-- ================================

-- MEDICINES: Read access for authenticated users (medicine database)
CREATE POLICY "medicines_read_authenticated" ON "public"."medicines"
FOR SELECT USING (auth.role() = 'authenticated');

-- CONTACT_MESSAGES: Public insert, superadmin read
CREATE POLICY "contact_messages_public_insert" ON "public"."contact_messages"
FOR INSERT WITH CHECK (true);

CREATE POLICY "contact_messages_superadmin_read" ON "public"."contact_messages"
FOR SELECT USING (public.is_superadmin());

-- ================================
-- SECTION 8: GRANTS AND PERMISSIONS
-- ================================

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION public.is_superadmin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_clinic_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role_in_clinic(UUID) TO authenticated;

-- Grant necessary auth schema access (if not already granted)
DO $$
BEGIN
    -- Grant usage on auth schema
    GRANT USAGE ON SCHEMA auth TO authenticated;
    GRANT SELECT ON auth.users TO authenticated;
EXCEPTION
    WHEN insufficient_privilege THEN
        -- Ignore if already granted or permission denied
        NULL;
    WHEN duplicate_object THEN
        -- Ignore if already granted
        NULL;
END $$;

-- ================================
-- SECTION 9: VERIFICATION AND LOGGING
-- ================================

-- Add helpful comments for production debugging
COMMENT ON FUNCTION public.is_superadmin() IS 'Production: Checks if current user has superadmin role using clinic_members.role';
COMMENT ON FUNCTION public.user_clinic_ids() IS 'Production: Returns all clinic IDs the current user is a member of';

-- Log successful completion
SELECT 
    'PRODUCTION RLS EMERGENCY FIX COMPLETED' as status,
    'RLS enabled on all critical tables, all duplicate policies removed, single clean policies applied' as details,
    NOW() as completed_at;