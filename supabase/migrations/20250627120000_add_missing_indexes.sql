-- Add missing indexes for better performance
-- Migration: 20250627120000_add_missing_indexes.sql

-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_medical_id ON patients(medical_id);

CREATE INDEX IF NOT EXISTS idx_doctors_clinic_id ON doctors(clinic_id);
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);

CREATE INDEX IF NOT EXISTS idx_clinic_members_user_id ON clinic_members(user_id);
CREATE INDEX IF NOT EXISTS idx_clinic_members_clinic_id ON clinic_members(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_members_role ON clinic_members(role);

CREATE INDEX IF NOT EXISTS idx_consultations_clinic_id ON consultations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_appointment_id ON consultations(appointment_id);

CREATE INDEX IF NOT EXISTS idx_bills_clinic_id ON bills(clinic_id);
CREATE INDEX IF NOT EXISTS idx_bills_patient_id ON bills(patient_id);
CREATE INDEX IF NOT EXISTS idx_bills_appointment_id ON bills(appointment_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);

-- Optimize RLS policies to use subqueries for better performance
CREATE OR REPLACE FUNCTION get_user_clinics()
RETURNS TABLE (clinic_id uuid) 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = public
AS $$
  SELECT clinic_id FROM clinic_members WHERE user_id = auth.uid();
$$;

-- Update RLS policies to use the optimized function
DROP POLICY IF EXISTS "Users can view appointments for their clinic" ON appointments;
CREATE POLICY "Users can view appointments for their clinic" ON appointments
  FOR SELECT USING (
    clinic_id IN (SELECT clinic_id FROM get_user_clinics())
  );

DROP POLICY IF EXISTS "Users can insert appointments for their clinic" ON appointments;
CREATE POLICY "Users can insert appointments for their clinic" ON appointments
  FOR INSERT WITH CHECK (
    clinic_id IN (SELECT clinic_id FROM get_user_clinics())
  );

DROP POLICY IF EXISTS "Users can update appointments for their clinic" ON appointments;
CREATE POLICY "Users can update appointments for their clinic" ON appointments
  FOR UPDATE USING (
    clinic_id IN (SELECT clinic_id FROM get_user_clinics())
  );

-- Fix duplicate permissive policies
DROP POLICY IF EXISTS "allow_create_clinic_departments" ON clinic_departments;
DROP POLICY IF EXISTS "allow_insert_clinic_departments" ON clinic_departments;
CREATE POLICY "allow_insert_clinic_departments" ON clinic_departments
  FOR INSERT WITH CHECK (
    clinic_id IN (SELECT clinic_id FROM get_user_clinics())
  );

-- Fix consultation policies
DROP POLICY IF EXISTS "Users can view consultations for their clinic" ON consultations;
DROP POLICY IF EXISTS "consultations_select_clinic_members" ON consultations;
CREATE POLICY "consultations_select_policy" ON consultations
  FOR SELECT USING (
    clinic_id IN (SELECT clinic_id FROM get_user_clinics())
  );

DROP POLICY IF EXISTS "Users can insert consultations for their clinic" ON consultations;
DROP POLICY IF EXISTS "consultations_insert_clinic_members" ON consultations;
CREATE POLICY "consultations_insert_policy" ON consultations
  FOR INSERT WITH CHECK (
    clinic_id IN (SELECT clinic_id FROM get_user_clinics())
  );

DROP POLICY IF EXISTS "Users can update consultations for their clinic" ON consultations;
DROP POLICY IF EXISTS "consultations_update_clinic_members" ON consultations;
CREATE POLICY "consultations_update_policy" ON consultations
  FOR UPDATE USING (
    clinic_id IN (SELECT clinic_id FROM get_user_clinics())
  );

-- Fix medicine policies
DROP POLICY IF EXISTS "medicines_select_policy" ON medicines;
DROP POLICY IF EXISTS "medicines_insert_policy" ON medicines;
DROP POLICY IF EXISTS "medicines_update_policy" ON medicines;
DROP POLICY IF EXISTS "medicines_delete_policy" ON medicines;

CREATE POLICY "medicines_select_policy" ON medicines
  FOR SELECT USING (true);

CREATE POLICY "medicines_insert_policy" ON medicines
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinic_members 
      WHERE user_id = auth.uid() 
      AND role IN ('doctor', 'superadmin')
    )
  );

CREATE POLICY "medicines_update_policy" ON medicines
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM clinic_members 
      WHERE user_id = auth.uid() 
      AND role IN ('doctor', 'superadmin')
    )
  );

CREATE POLICY "medicines_delete_policy" ON medicines
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM clinic_members 
      WHERE user_id = auth.uid() 
      AND role = 'superadmin'
    )
  ); 