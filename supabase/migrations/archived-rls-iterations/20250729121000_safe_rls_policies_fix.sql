-- Safe RLS Policies Fix - Only operates on existing tables
-- This migration corrects role checking to use actual clinic_members.role instead of non-existent user_metadata
-- Date: 2025-07-29

-- Helper function to check if user is superadmin in any clinic
-- This uses the actual clinic_members table structure
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

-- Helper function to get user's clinic memberships
CREATE OR REPLACE FUNCTION public.user_clinic_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT clinic_id FROM clinic_members WHERE user_id = auth.uid();
$$;

-- Only apply RLS policies to tables that exist
-- Check each table and apply appropriate policies

-- 1. CLINIC_MEMBERS TABLE (most important)
-- Drop existing policy if it exists, then create corrected one
DO $$
BEGIN
  -- Drop existing problematic policy
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clinic_members' AND policyname = 'clinic_members_access') THEN
    EXECUTE 'DROP POLICY clinic_members_access ON clinic_members';
  END IF;
  
  -- Create corrected policy using actual role column
  EXECUTE 'CREATE POLICY clinic_members_corrected_access ON clinic_members
  FOR ALL USING (
    user_id = auth.uid()
    OR
    clinic_id IN (SELECT public.user_clinic_ids())
    OR
    public.is_superadmin()
  )';
END $$;

-- 2. PROFILES TABLE
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_access') THEN
    EXECUTE 'DROP POLICY profiles_access ON profiles';
  END IF;
  
  EXECUTE 'CREATE POLICY profiles_corrected_access ON profiles
  FOR ALL USING (
    id = auth.uid()
    OR
    id IN (
      SELECT DISTINCT cm.user_id 
      FROM clinic_members cm
      WHERE cm.clinic_id IN (SELECT public.user_clinic_ids())
    )
    OR
    public.is_superadmin()
  )';
END $$;

-- 3. DOCTORS TABLE (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'doctors') THEN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'doctors' AND policyname = 'doctors_clinic_access') THEN
      EXECUTE 'DROP POLICY doctors_clinic_access ON doctors';
    END IF;
    
    EXECUTE 'CREATE POLICY doctors_corrected_access ON doctors
    FOR ALL USING (
      user_id = auth.uid()
      OR
      clinic_id IN (SELECT public.user_clinic_ids())
      OR
      public.is_superadmin()
    )';
  END IF;
END $$;

-- 4. CLINICS TABLE
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clinics' AND policyname = 'clinics_member_access') THEN
    EXECUTE 'DROP POLICY clinics_member_access ON clinics';
  END IF;
  
  EXECUTE 'CREATE POLICY clinics_corrected_access ON clinics
  FOR ALL USING (
    id IN (SELECT public.user_clinic_ids())
    OR
    public.is_superadmin()
  )';
END $$;

-- 5. PENDING_INVITATIONS TABLE (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pending_invitations') THEN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pending_invitations' AND policyname = 'pending_invitations_access') THEN
      EXECUTE 'DROP POLICY pending_invitations_access ON pending_invitations';
    END IF;
    
    EXECUTE 'CREATE POLICY pending_invitations_corrected_access ON pending_invitations
    FOR ALL USING (
      clinic_id IN (SELECT public.user_clinic_ids())
      OR
      email = (SELECT email FROM auth.users WHERE id = auth.uid())
      OR
      public.is_superadmin()
    )';
  END IF;
END $$;

-- Grant necessary permissions for helper functions
GRANT EXECUTE ON FUNCTION public.is_superadmin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_clinic_ids() TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION public.is_superadmin() IS 'Helper function to check if current user is superadmin using actual clinic_members.role';
COMMENT ON FUNCTION public.user_clinic_ids() IS 'Helper function to get clinic IDs for current user';

SELECT 'Safe RLS policies fix applied - now using actual clinic_members.role instead of non-existent user_metadata' as status;