-- Fix doctor visibility for non-doctor superadmins
-- Migration: 20250627120200_fix_doctor_visibility.sql

-- Drop and recreate the doctors_read_policy to focus on clinic membership
DROP POLICY IF EXISTS "doctors_read_policy" ON doctors;

CREATE POLICY "doctors_read_policy" ON doctors
    FOR SELECT TO authenticated
    USING (
        clinic_id IN (
            SELECT cm.clinic_id FROM clinic_members cm
            WHERE cm.user_id = auth.uid()
        )
    ); 