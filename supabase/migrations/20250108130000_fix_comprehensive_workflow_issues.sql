-- Comprehensive fix for remaining workflow issues
-- Fix appointment visibility and consultation workflow
-- Created: 2025-01-08 13:00:00

-- Ensure the get_appointments_with_details_by_clinic function is working correctly
DROP FUNCTION IF EXISTS get_appointments_with_details_by_clinic(text);

CREATE OR REPLACE FUNCTION get_appointments_with_details_by_clinic(clinic_id text)
RETURNS TABLE (
  id text,
  date text,
  "time" text,
  status text,
  type text,
  notes text,
  patient_id text,
  patient_name text,
  doctor_id text,
  doctor_name text,
  billing_status text,
  created_at text,
  updated_at text
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id::text,
    a.date::text,
    a."time",
    a.status,
    a.type,
    a.notes,
    a.patient_id::text,
    COALESCE(p.name, 'Unknown Patient') as patient_name,
    a.doctor_id::text,
    COALESCE(d.name, 'Unknown Doctor') as doctor_name,
    COALESCE(a.billing_status, 'Pending') as billing_status,
    a.created_at::text,
    a.updated_at::text
  FROM appointments a
  LEFT JOIN patients p ON a.patient_id = p.id
  LEFT JOIN doctors d ON a.doctor_id = d.id
  WHERE a.clinic_id::text = clinic_id
  ORDER BY a.date DESC, a."time" DESC;
END;
$$;

-- Grant execute permissions on the function
GRANT EXECUTE ON FUNCTION get_appointments_with_details_by_clinic(text) TO authenticated;

-- Fix RLS policies for appointments to ensure proper visibility
DROP POLICY IF EXISTS "Users can view appointments for their clinic" ON appointments;
CREATE POLICY "Users can view appointments for their clinic" ON appointments
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id 
      FROM clinic_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert appointments for their clinic" ON appointments;
CREATE POLICY "Users can insert appointments for their clinic" ON appointments
  FOR INSERT WITH CHECK (
    clinic_id IN (
      SELECT clinic_id 
      FROM clinic_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update appointments for their clinic" ON appointments;
CREATE POLICY "Users can update appointments for their clinic" ON appointments
  FOR UPDATE USING (
    clinic_id IN (
      SELECT clinic_id 
      FROM clinic_members 
      WHERE user_id = auth.uid()
    )
  );

-- Fix RLS policies for patients to ensure visibility in billing
DROP POLICY IF EXISTS "Users can view patients in their clinic" ON patients;
CREATE POLICY "Users can view patients in their clinic" ON patients
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id 
      FROM clinic_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert patients in their clinic" ON patients;
CREATE POLICY "Users can insert patients in their clinic" ON patients
  FOR INSERT WITH CHECK (
    clinic_id IN (
      SELECT clinic_id 
      FROM clinic_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update patients in their clinic" ON patients;
CREATE POLICY "Users can update patients in their clinic" ON patients
  FOR UPDATE USING (
    clinic_id IN (
      SELECT clinic_id 
      FROM clinic_members 
      WHERE user_id = auth.uid()
    )
  );

-- Create or fix get_patients_by_clinic function
DROP FUNCTION IF EXISTS get_patients_by_clinic(text);

CREATE OR REPLACE FUNCTION get_patients_by_clinic(clinic_id text)
RETURNS TABLE (
  id text,
  name text,
  phone text,
  email text,
  medical_id text,
  gender text,
  address text,
  date_of_birth text,
  created_at text,
  updated_at text
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id::text,
    p.name,
    p.phone,
    p.email,
    p.medical_id,
    p.gender,
    p.address,
    p.date_of_birth::text,
    p.created_at::text,
    p.updated_at::text
  FROM patients p
  WHERE p.clinic_id::text = clinic_id
  ORDER BY p.name ASC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_patients_by_clinic(text) TO authenticated;

-- Fix RLS policies for bills to ensure proper visibility
DROP POLICY IF EXISTS "Users can view bills for their clinic" ON bills;
CREATE POLICY "Users can view bills for their clinic" ON bills
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id 
      FROM clinic_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert bills for their clinic" ON bills;
CREATE POLICY "Users can insert bills for their clinic" ON bills
  FOR INSERT WITH CHECK (
    clinic_id IN (
      SELECT clinic_id 
      FROM clinic_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update bills for their clinic" ON bills;
CREATE POLICY "Users can update bills for their clinic" ON bills
  FOR UPDATE USING (
    clinic_id IN (
      SELECT clinic_id 
      FROM clinic_members 
      WHERE user_id = auth.uid()
    )
  );

-- Create or update get_bills_by_clinic function
DROP FUNCTION IF EXISTS get_bills_by_clinic(text);

CREATE OR REPLACE FUNCTION get_bills_by_clinic(clinic_id text)
RETURNS TABLE (
  id text,
  patient_id text,
  patient_name text,
  appointment_id text,
  amount numeric,
  status text,
  invoice_number text,
  due_date text,
  created_at text,
  updated_at text
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id::text,
    b.patient_id::text,
    COALESCE(p.name, 'Unknown Patient') as patient_name,
    b.appointment_id::text,
    b.amount,
    b.status,
    b.invoice_number,
    b.due_date::text,
    b.created_at::text,
    b.updated_at::text
  FROM bills b
  LEFT JOIN patients p ON b.patient_id = p.id
  WHERE b.clinic_id::text = clinic_id
  ORDER BY b.created_at DESC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_bills_by_clinic(text) TO authenticated;

-- Ensure consultations table has proper RLS policies
DROP POLICY IF EXISTS "Users can view consultations for their clinic" ON consultations;
CREATE POLICY "Users can view consultations for their clinic" ON consultations
  FOR SELECT USING (
    appointment_id IN (
      SELECT id FROM appointments 
      WHERE clinic_id IN (
        SELECT clinic_id 
        FROM clinic_members 
        WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert consultations for their clinic" ON consultations;
CREATE POLICY "Users can insert consultations for their clinic" ON consultations
  FOR INSERT WITH CHECK (
    appointment_id IN (
      SELECT id FROM appointments 
      WHERE clinic_id IN (
        SELECT clinic_id 
        FROM clinic_members 
        WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can update consultations for their clinic" ON consultations;
CREATE POLICY "Users can update consultations for their clinic" ON consultations
  FOR UPDATE USING (
    appointment_id IN (
      SELECT id FROM appointments 
      WHERE clinic_id IN (
        SELECT clinic_id 
        FROM clinic_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Create a function to get consultation details for an appointment
DROP FUNCTION IF EXISTS get_consultation_by_appointment(text);

CREATE OR REPLACE FUNCTION get_consultation_by_appointment(p_appointment_id text)
RETURNS TABLE (
  id text,
  appointment_id text,
  chief_complaint text,
  history_present_illness text,
  physical_examination text,
  assessment_diagnosis text,
  plan_treatment text,
  prescriptions jsonb,
  notes text,
  created_at text,
  updated_at text
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id::text,
    c.appointment_id::text,
    c.chief_complaint,
    c.history_present_illness,
    c.physical_examination,
    c.assessment_diagnosis,
    c.plan_treatment,
    c.prescriptions,
    c.notes,
    c.created_at::text,
    c.updated_at::text
  FROM consultations c
  WHERE c.appointment_id::text = p_appointment_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_consultation_by_appointment(text) TO authenticated;

-- Fix the get_doctors_by_clinic function to ensure it works properly
DROP FUNCTION IF EXISTS get_doctors_by_clinic(text);

CREATE OR REPLACE FUNCTION get_doctors_by_clinic(clinic_id text)
RETURNS TABLE (
  id text,
  name text,
  email text,
  primary_specialization text,
  consultation_fee numeric,
  availability text,
  bio text,
  is_active boolean
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id::text,
    d.name,
    d.email,
    d.primary_specialization,
    d.consultation_fee,
    d.availability,
    d.bio,
    d.is_active
  FROM doctors d
  WHERE d.clinic_id::text = get_doctors_by_clinic.clinic_id
    AND d.is_active = true
  ORDER BY d.name ASC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_doctors_by_clinic(text) TO authenticated;

-- Ensure all RLS policies are enabled
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

-- Debug: Add some indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_doctors_clinic_id ON doctors(clinic_id);
CREATE INDEX IF NOT EXISTS idx_bills_clinic_id ON bills(clinic_id);
CREATE INDEX IF NOT EXISTS idx_consultations_appointment_id ON consultations(appointment_id);
CREATE INDEX IF NOT EXISTS idx_clinic_members_user_id ON clinic_members(user_id);
CREATE INDEX IF NOT EXISTS idx_clinic_members_clinic_id ON clinic_members(clinic_id); 