-- policies for authenticated users on appointments
-- Allow authenticated users to SELECT appointments within their clinic
CREATE POLICY authenticated_appointments_select ON appointments FOR SELECT TO authenticated
USING (
  clinic_id IN (SELECT clinic_id FROM clinic_members WHERE user_id = auth.uid())
);

-- Allow authenticated users to INSERT appointments within their clinic
CREATE POLICY authenticated_appointments_insert ON appointments FOR INSERT TO authenticated
WITH CHECK (
  clinic_id IN (SELECT clinic_id FROM clinic_members WHERE user_id = auth.uid())
);

-- Allow authenticated users to UPDATE appointments within their clinic
CREATE POLICY authenticated_appointments_update ON appointments FOR UPDATE TO authenticated
USING (
  clinic_id IN (SELECT clinic_id FROM clinic_members WHERE user_id = auth.uid())
) WITH CHECK (
  clinic_id IN (SELECT clinic_id FROM clinic_members WHERE user_id = auth.uid())
);

-- Allow authenticated users to DELETE appointments within their clinic
CREATE POLICY authenticated_appointments_delete ON appointments FOR DELETE TO authenticated
USING (
  clinic_id IN (SELECT clinic_id FROM clinic_members WHERE user_id = auth.uid())
);
