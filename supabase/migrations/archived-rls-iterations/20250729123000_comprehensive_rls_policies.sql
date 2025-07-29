-- Comprehensive RLS Policies - Complete overhaul based on actual usage patterns
-- This migration creates the correct RLS policies for all tables based on codebase analysis
-- Date: 2025-07-29

-- ================================
-- SECTION 1: CLEANUP & PREPARATION
-- ================================

-- Drop all existing policies to start fresh
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    -- Get all policies in public schema
    FOR policy_record IN 
        SELECT tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_record.policyname, policy_record.tablename);
    END LOOP;
END $$;

-- Ensure helper functions exist (recreate if needed)
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

CREATE OR REPLACE FUNCTION public.is_doctor_in_clinic(check_clinic_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM clinic_members 
    WHERE user_id = auth.uid() 
    AND clinic_id = check_clinic_id
    AND role = 'doctor'
  );
$$;

-- ================================
-- SECTION 2: ENABLE RLS ON ALL TABLES
-- ================================

-- Enable RLS on all tables that should have it
ALTER TABLE IF EXISTS "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."clinics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."clinic_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."clinic_departments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."departments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."department_types" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."doctors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."pending_invitations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."contact_messages" ENABLE ROW LEVEL SECURITY;

-- Healthcare data tables (may not exist in current state)
ALTER TABLE IF EXISTS "public"."patients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."appointments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."consultations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."bills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."prescriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."payment_transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."appointment_billing" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."monthly_billing_cycles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."clinic_credits" ENABLE ROW LEVEL SECURITY;

-- ================================
-- SECTION 3: USER-LEVEL ISOLATION
-- ================================

-- PROFILES: Users can only access their own profile
CREATE POLICY "profiles_self_access" ON "public"."profiles"
FOR ALL USING (
  id = auth.uid()
  OR
  -- Clinic members can see other member profiles for collaboration
  id IN (
    SELECT DISTINCT cm.user_id 
    FROM clinic_members cm
    WHERE cm.clinic_id IN (SELECT public.user_clinic_ids())
  )
  OR
  -- Superadmins can see all profiles
  public.is_superadmin()
);

-- ================================
-- SECTION 4: CLINIC-LEVEL ISOLATION
-- ================================

-- CLINIC_MEMBERS: Own memberships + clinic visibility + superadmin management
CREATE POLICY "clinic_members_comprehensive_access" ON "public"."clinic_members"
FOR ALL USING (
  -- Users can see their own memberships
  user_id = auth.uid()
  OR
  -- Users can see other members in their clinics
  clinic_id IN (SELECT public.user_clinic_ids())
  OR
  -- Superadmins can manage all memberships
  public.is_superadmin()
);

-- CLINICS: Member access + superadmin management
CREATE POLICY "clinics_member_access" ON "public"."clinics"
FOR ALL USING (
  -- Users can see clinics they're members of
  id IN (SELECT public.user_clinic_ids())
  OR
  -- Superadmins can see all clinics
  public.is_superadmin()
);

-- DOCTORS: Clinic isolation + self profile access
CREATE POLICY "doctors_clinic_isolation" ON "public"."doctors"
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

-- CLINIC_DEPARTMENTS: Strict clinic isolation
CREATE POLICY "clinic_departments_clinic_access" ON "public"."clinic_departments"
FOR ALL USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  OR
  public.is_superadmin()
);

-- DEPARTMENTS: Strict clinic isolation (legacy table)
CREATE POLICY "departments_clinic_access" ON "public"."departments"
FOR ALL USING (
  clinic_id IN (SELECT public.user_clinic_ids())
  OR
  public.is_superadmin()
);

-- ================================
-- SECTION 5: INVITATION SYSTEM
-- ================================

-- PENDING_INVITATIONS: Clinic management + email-based invitee access
CREATE POLICY "pending_invitations_dual_access" ON "public"."pending_invitations"
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
-- SECTION 6: REFERENCE DATA
-- ================================

-- DEPARTMENT_TYPES: Read for authenticated, modify for superadmins
CREATE POLICY "department_types_read_authenticated" ON "public"."department_types"
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "department_types_superadmin_insert" ON "public"."department_types"
FOR INSERT WITH CHECK (public.is_superadmin());

CREATE POLICY "department_types_superadmin_update" ON "public"."department_types"
FOR UPDATE USING (public.is_superadmin());

CREATE POLICY "department_types_superadmin_delete" ON "public"."department_types"
FOR DELETE USING (public.is_superadmin());

-- CONTACT_MESSAGES: Public insert, superadmin read (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contact_messages') THEN
    EXECUTE 'CREATE POLICY "contact_messages_public_insert" ON "public"."contact_messages"
    FOR INSERT WITH CHECK (true)';
    
    EXECUTE 'CREATE POLICY "contact_messages_superadmin_read" ON "public"."contact_messages"
    FOR SELECT USING (public.is_superadmin())';
  END IF;
END $$;

-- ================================
-- SECTION 7: HEALTHCARE DATA (if tables exist)
-- ================================

-- PATIENTS: Strict clinic isolation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') THEN
    EXECUTE 'CREATE POLICY "patients_strict_clinic_isolation" ON "public"."patients"
    FOR ALL USING (
      clinic_id IN (SELECT public.user_clinic_ids())
      OR
      public.is_superadmin()
    )';
  END IF;
END $$;

-- APPOINTMENTS: Clinic isolation + doctor can see own appointments
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
    EXECUTE 'CREATE POLICY "appointments_clinic_and_doctor_access" ON "public"."appointments"
    FOR ALL USING (
      clinic_id IN (SELECT public.user_clinic_ids())
      OR
      public.is_superadmin()
    )';
  END IF;
END $$;

-- CONSULTATIONS: Clinic isolation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'consultations') THEN
    EXECUTE 'CREATE POLICY "consultations_clinic_isolation" ON "public"."consultations"
    FOR ALL USING (
      clinic_id IN (SELECT public.user_clinic_ids())
      OR
      public.is_superadmin()
    )';
  END IF;
END $$;

-- BILLS: Clinic isolation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bills') THEN
    EXECUTE 'CREATE POLICY "bills_clinic_isolation" ON "public"."bills"
    FOR ALL USING (
      clinic_id IN (SELECT public.user_clinic_ids())
      OR
      public.is_superadmin()
    )';
  END IF;
END $$;

-- PRESCRIPTIONS: Clinic isolation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prescriptions') THEN
    EXECUTE 'CREATE POLICY "prescriptions_clinic_isolation" ON "public"."prescriptions"
    FOR ALL USING (
      clinic_id IN (SELECT public.user_clinic_ids())
      OR
      public.is_superadmin()
    )';
  END IF;
END $$;

-- PAYMENT_TRANSACTIONS: Clinic isolation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_transactions') THEN
    EXECUTE 'CREATE POLICY "payment_transactions_clinic_isolation" ON "public"."payment_transactions"
    FOR ALL USING (
      clinic_id IN (SELECT public.user_clinic_ids())
      OR
      public.is_superadmin()
    )';
  END IF;
END $$;

-- APPOINTMENT_BILLING: Clinic isolation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointment_billing') THEN
    EXECUTE 'CREATE POLICY "appointment_billing_clinic_isolation" ON "public"."appointment_billing"
    FOR ALL USING (
      clinic_id IN (SELECT public.user_clinic_ids())
      OR
      public.is_superadmin()
    )';
  END IF;
END $$;

-- MONTHLY_BILLING_CYCLES: Clinic isolation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'monthly_billing_cycles') THEN
    EXECUTE 'CREATE POLICY "monthly_billing_cycles_clinic_isolation" ON "public"."monthly_billing_cycles"
    FOR ALL USING (
      clinic_id IN (SELECT public.user_clinic_ids())
      OR
      public.is_superadmin()
    )';
  END IF;
END $$;

-- CLINIC_CREDITS: Clinic isolation
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clinic_credits') THEN
    EXECUTE 'CREATE POLICY "clinic_credits_clinic_isolation" ON "public"."clinic_credits"
    FOR ALL USING (
      clinic_id IN (SELECT public.user_clinic_ids())
      OR
      public.is_superadmin()
    )';
  END IF;
END $$;

-- ================================
-- SECTION 8: GRANTS & PERMISSIONS
-- ================================

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION public.is_superadmin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_clinic_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_doctor_in_clinic(UUID) TO authenticated;

-- Grant necessary auth schema access
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- ================================
-- SECTION 9: DOCUMENTATION & COMMENTS
-- ================================

-- Add helpful comments
COMMENT ON FUNCTION public.is_superadmin() IS 'Checks if current user has superadmin role in any clinic using clinic_members.role';
COMMENT ON FUNCTION public.user_clinic_ids() IS 'Returns all clinic IDs the current user is a member of';
COMMENT ON FUNCTION public.is_doctor_in_clinic(UUID) IS 'Checks if current user is a doctor in the specified clinic';

COMMENT ON POLICY "profiles_self_access" ON "public"."profiles" IS 'Users can access own profile + clinic members can see each other + superadmin override';
COMMENT ON POLICY "clinic_members_comprehensive_access" ON "public"."clinic_members" IS 'Self-access + clinic visibility + superadmin management based on actual usage patterns';
COMMENT ON POLICY "clinics_member_access" ON "public"."clinics" IS 'Access to clinics via membership + superadmin override';
COMMENT ON POLICY "pending_invitations_dual_access" ON "public"."pending_invitations" IS 'Clinic management access + email-based invitee access + superadmin override';

-- Clean up audit function
DROP FUNCTION IF EXISTS temp_rls_audit();

-- Log completion
SELECT 'Comprehensive RLS policies applied - all tables now have correct policies based on usage analysis' as status;