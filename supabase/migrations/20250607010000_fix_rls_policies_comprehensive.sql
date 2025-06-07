-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Enable read access for all users" ON clinics;
DROP POLICY IF EXISTS "User can insert clinics" ON clinics;
DROP POLICY IF EXISTS "User can access clinics they are a member of" ON clinics;
DROP POLICY IF EXISTS "Clinic members or creators can insert clinic_departments" ON clinic_departments;
DROP POLICY IF EXISTS "Clinic members or creators can insert doctors" ON doctors;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON department_types;

-- Enable RLS on all tables
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_types ENABLE ROW LEVEL SECURITY;

-- Department Types Policies (needed for clinic creation form)
CREATE POLICY "Anyone can read department types" ON department_types
FOR SELECT USING (true);

-- Clinics Policies
CREATE POLICY "Users can create clinics" ON clinics 
FOR INSERT 
WITH CHECK (
    auth.uid() IS NOT NULL 
    AND created_by = auth.uid()
);

CREATE POLICY "Users can view their clinics" ON clinics 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM clinic_members 
        WHERE clinic_members.clinic_id = clinics.id 
        AND clinic_members.user_id = auth.uid()
    )
    OR created_by = auth.uid()
);

CREATE POLICY "Superadmins can update their clinics" ON clinics 
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM clinic_members 
        WHERE clinic_members.clinic_id = clinics.id 
        AND clinic_members.user_id = auth.uid()
        AND clinic_members.role = 'superadmin'
    )
);

-- Clinic Members Policies
CREATE POLICY "Users can add themselves as initial superadmin" ON clinic_members
FOR INSERT 
WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
    AND role = 'superadmin'
    AND EXISTS (
        SELECT 1 FROM clinics 
        WHERE clinics.id = clinic_id 
        AND clinics.created_by = auth.uid()
    )
);

CREATE POLICY "Users can view clinic members" ON clinic_members
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM clinic_members AS cm 
        WHERE cm.clinic_id = clinic_members.clinic_id 
        AND cm.user_id = auth.uid()
    )
);

-- Clinic Departments Policies
CREATE POLICY "Users can add departments during clinic creation" ON clinic_departments
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM clinics 
        WHERE clinics.id = clinic_id 
        AND clinics.created_by = auth.uid()
    )
    OR 
    EXISTS (
        SELECT 1 FROM clinic_members 
        WHERE clinic_members.clinic_id = clinic_departments.clinic_id 
        AND clinic_members.user_id = auth.uid()
        AND clinic_members.role = 'superadmin'
    )
);

CREATE POLICY "Users can view clinic departments" ON clinic_departments
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM clinic_members 
        WHERE clinic_members.clinic_id = clinic_departments.clinic_id 
        AND clinic_members.user_id = auth.uid()
    )
);

-- Doctors Policies
CREATE POLICY "Users can create doctor profiles" ON doctors
FOR INSERT 
WITH CHECK (
    -- Allow during initial clinic creation
    (
        EXISTS (
            SELECT 1 FROM clinics 
            WHERE clinics.id = clinic_id 
            AND clinics.created_by = auth.uid()
        )
        AND user_id = auth.uid()
    )
    OR 
    -- Allow superadmins to add doctors
    EXISTS (
        SELECT 1 FROM clinic_members 
        WHERE clinic_members.clinic_id = doctors.clinic_id 
        AND clinic_members.user_id = auth.uid()
        AND clinic_members.role = 'superadmin'
    )
);

CREATE POLICY "Users can view doctors in their clinics" ON doctors
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM clinic_members 
        WHERE clinic_members.clinic_id = doctors.clinic_id 
        AND clinic_members.user_id = auth.uid()
    )
);

-- Update policies for doctors
CREATE POLICY "Doctors can update their own profiles" ON doctors
FOR UPDATE USING (
    user_id = auth.uid()
    OR 
    EXISTS (
        SELECT 1 FROM clinic_members 
        WHERE clinic_members.clinic_id = doctors.clinic_id 
        AND clinic_members.user_id = auth.uid()
        AND clinic_members.role = 'superadmin'
    )
); 