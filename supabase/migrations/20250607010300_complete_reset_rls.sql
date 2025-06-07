-- COMPLETE RESET: Remove ALL existing policies and rebuild from scratch
-- This ensures no lingering recursive policies exist

-- Step 1: Disable RLS temporarily to clear everything
ALTER TABLE clinic_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE clinics DISABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE department_types DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies (comprehensive cleanup)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Drop all policies on clinic_members
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'clinic_members') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON clinic_members';
    END LOOP;
    
    -- Drop all policies on clinics
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'clinics') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON clinics';
    END LOOP;
    
    -- Drop all policies on clinic_departments
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'clinic_departments') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON clinic_departments';
    END LOOP;
    
    -- Drop all policies on doctors
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'doctors') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON doctors';
    END LOOP;
    
    -- Drop all policies on department_types
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'department_types') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON department_types';
    END LOOP;
END $$;

-- Step 3: Re-enable RLS
ALTER TABLE clinic_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_types ENABLE ROW LEVEL SECURITY;

-- Step 4: Create MINIMAL, SAFE policies with NO recursion

-- Department Types: Allow all reads (needed for forms)
CREATE POLICY "allow_read_department_types" ON department_types
FOR SELECT USING (true);

-- Clinics: Simple policies
CREATE POLICY "allow_create_clinics" ON clinics 
FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND created_by = auth.uid()
);

CREATE POLICY "allow_read_own_clinics" ON clinics 
FOR SELECT USING (created_by = auth.uid());

-- Clinic Members: ZERO self-referencing
CREATE POLICY "allow_create_own_membership" ON clinic_members
FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
    AND role = 'superadmin'
);

CREATE POLICY "allow_read_own_membership" ON clinic_members
FOR SELECT USING (user_id = auth.uid());

-- Clinic Departments: Reference clinics only
CREATE POLICY "allow_create_clinic_departments" ON clinic_departments
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM clinics 
        WHERE clinics.id = clinic_id 
        AND clinics.created_by = auth.uid()
    )
);

CREATE POLICY "allow_read_clinic_departments" ON clinic_departments
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM clinics 
        WHERE clinics.id = clinic_id 
        AND clinics.created_by = auth.uid()
    )
);

-- Doctors: Reference clinics only
CREATE POLICY "allow_create_doctors" ON doctors
FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM clinics 
        WHERE clinics.id = clinic_id 
        AND clinics.created_by = auth.uid()
    )
);

CREATE POLICY "allow_read_doctors" ON doctors
FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM clinics 
        WHERE clinics.id = clinic_id 
        AND clinics.created_by = auth.uid()
    )
); 