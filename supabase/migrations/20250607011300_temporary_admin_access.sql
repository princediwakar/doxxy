-- TEMPORARY: Add broader access policies for diagnosis and fixing
-- These will help us identify and fix the underlying data issues

-- Add temporary read-all policies for authenticated users (can be narrowed later)
CREATE POLICY "temp_read_all_clinic_members" ON clinic_members
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "temp_read_all_doctors" ON doctors  
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "temp_read_all_clinic_departments" ON clinic_departments
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Also allow authenticated users to see profiles (needed for member management)
CREATE POLICY "allow_read_profiles" ON profiles
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Note: These are temporary policies for debugging. 
-- In production, these should be more restrictive based on clinic membership. 