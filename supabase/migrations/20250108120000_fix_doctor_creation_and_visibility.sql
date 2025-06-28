-- Fix doctor creation and visibility issues
-- Migration: 20250108120000_fix_doctor_creation_and_visibility.sql

-- =========================================================================
-- 1. Fix the ensure_doctor_has_clinic_member trigger that causes ambiguous clinic_id error
-- =========================================================================

DROP TRIGGER IF EXISTS trigger_ensure_doctor_clinic_member ON doctors;

CREATE OR REPLACE FUNCTION ensure_doctor_has_clinic_member() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Ensure that when a doctor is created, there's a corresponding clinic_member record
    IF TG_OP = 'INSERT' THEN
        -- Check if clinic member already exists
        IF NOT EXISTS (
            SELECT 1 FROM clinic_members cm
            WHERE cm.user_id = NEW.user_id AND cm.clinic_id = NEW.clinic_id
        ) THEN
            -- Create clinic member record with doctor role
            INSERT INTO clinic_members (user_id, clinic_id, role)
            VALUES (NEW.user_id, NEW.clinic_id, 'doctor')
            ON CONFLICT (user_id, clinic_id) DO NOTHING;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Recreate the trigger with the fixed function
CREATE TRIGGER trigger_ensure_doctor_clinic_member 
    AFTER INSERT OR UPDATE ON doctors 
    FOR EACH ROW 
    WHEN (NEW.user_id IS NOT NULL) 
    EXECUTE FUNCTION ensure_doctor_has_clinic_member();

-- =========================================================================
-- 2. Improve RLS policies for better doctor visibility
-- =========================================================================

-- Drop existing doctor policies
DROP POLICY IF EXISTS "doctors_create_own" ON doctors;
DROP POLICY IF EXISTS "doctors_read_own_or_clinic_member" ON doctors;
DROP POLICY IF EXISTS "doctors_update_own_or_superadmin" ON doctors;

-- Create improved policies with better visibility
CREATE POLICY "doctors_create_policy" ON doctors
    FOR INSERT TO authenticated
    WITH CHECK (
        user_id = auth.uid() AND 
        clinic_id IN (
            SELECT c.id FROM clinics c
            JOIN clinic_members cm ON c.id = cm.clinic_id
            WHERE cm.user_id = auth.uid() AND cm.role IN ('superadmin', 'doctor')
        )
    );

CREATE POLICY "doctors_read_policy" ON doctors
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid() OR
        clinic_id IN (
            SELECT cm.clinic_id FROM clinic_members cm
            WHERE cm.user_id = auth.uid()
        )
    );

CREATE POLICY "doctors_update_policy" ON doctors
    FOR UPDATE TO authenticated
    USING (
        user_id = auth.uid() OR
        clinic_id IN (
            SELECT cm.clinic_id FROM clinic_members cm
            WHERE cm.user_id = auth.uid() AND cm.role = 'superadmin'
        )
    );

CREATE POLICY "doctors_delete_policy" ON doctors
    FOR DELETE TO authenticated
    USING (
        clinic_id IN (
            SELECT cm.clinic_id FROM clinic_members cm
            WHERE cm.user_id = auth.uid() AND cm.role = 'superadmin'
        )
    );

-- =========================================================================
-- 3. Improve the get_doctors_by_clinic function for better performance
-- =========================================================================

-- Drop and recreate to avoid return type conflicts
DROP FUNCTION IF EXISTS get_doctors_by_clinic(uuid);

CREATE OR REPLACE FUNCTION get_doctors_by_clinic(clinic_id uuid)
RETURNS TABLE(
    id uuid,
    user_id uuid,
    name text,
    email text,
    phone text,
    bio text,
    created_at timestamp with time zone,
    role text,
    department_name text,
    department_id uuid,
    is_active boolean,
    primary_specialization text,
    medical_specializations text[],
    years_of_experience integer,
    consultation_fee numeric,
    languages_spoken text[],
    practice_timings jsonb,
    professional_summary text,
    medical_registration_number text,
    medical_qualifications text[],
    medical_council text,
    medical_license_state text,
    medical_license_expiry date,
    subspecialty text[],
    board_certifications text[],
    fellowship_details text,
    medical_college text,
    graduation_year integer,
    clinic_timings jsonb
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.user_id,
    COALESCE(d.name, p.name) as name,
    COALESCE(d.email, p.email) as email,
    COALESCE(d.phone, p.phone) as phone,
    d.bio,
    d.created_at,
    cm.role::text,
    COALESCE(dt.name, 'General Medicine') as department_name,
    cd.id as department_id,
    d.is_active,
    d.primary_specialization,
    d.medical_specializations,
    d.years_of_experience,
    d.consultation_fee,
    d.languages_spoken,
    d.practice_timings,
    d.professional_summary,
    d.medical_registration_number,
    d.medical_qualifications,
    d.medical_council,
    d.medical_license_state,
    d.medical_license_expiry,
    d.subspecialty,
    d.board_certifications,
    d.fellowship_details,
    d.medical_college,
    d.graduation_year,
    d.clinic_timings
  FROM doctors d
  JOIN profiles p ON d.user_id = p.id
  JOIN clinic_members cm ON d.user_id = cm.user_id AND d.clinic_id = cm.clinic_id
  LEFT JOIN clinic_departments cd ON cm.department_id = cd.id
  LEFT JOIN department_types dt ON cd.department_type_id = dt.id
  WHERE d.clinic_id = get_doctors_by_clinic.clinic_id
    AND d.is_active = true
    AND cm.role IN ('doctor', 'superadmin')
  ORDER BY d.name;
END;
$$;

-- =========================================================================
-- 4. Create a helper function for safe doctor creation
-- =========================================================================

CREATE OR REPLACE FUNCTION create_doctor_profile(
    p_user_id uuid,
    p_clinic_id uuid,
    p_name text,
    p_email text DEFAULT NULL,
    p_primary_specialization text DEFAULT 'General Medicine',
    p_consultation_fee numeric DEFAULT 500,
    p_availability text DEFAULT 'Mon-Fri 9:00 AM - 5:00 PM',
    p_bio text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    new_doctor_id uuid;
    user_profile profiles%ROWTYPE;
BEGIN
    -- Get user profile information
    SELECT * INTO user_profile FROM profiles WHERE id = p_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found for user_id: %', p_user_id;
    END IF;
    
    -- Ensure user is a member of the clinic first
    INSERT INTO clinic_members (user_id, clinic_id, role)
    VALUES (p_user_id, p_clinic_id, 'doctor')
    ON CONFLICT (user_id, clinic_id) 
    DO UPDATE SET role = EXCLUDED.role;
    
    -- Create doctor profile
    INSERT INTO doctors (
        user_id,
        clinic_id,
        name,
        email,
        primary_specialization,
        consultation_fee,
        availability,
        bio,
        is_active
    ) VALUES (
        p_user_id,
        p_clinic_id,
        COALESCE(p_name, user_profile.name),
        COALESCE(p_email, user_profile.email),
        p_primary_specialization,
        p_consultation_fee,
        p_availability,
        p_bio,
        true
    ) RETURNING id INTO new_doctor_id;
    
    RETURN new_doctor_id;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_doctor_profile(uuid, uuid, text, text, text, numeric, text, text) TO authenticated;

-- =========================================================================
-- 5. Update get_appointments_with_details_by_clinic to handle clinic_id ambiguity
-- =========================================================================

CREATE OR REPLACE FUNCTION get_appointments_with_details_by_clinic(clinic_id uuid)
RETURNS TABLE(
    id uuid,
    patient_id uuid,
    doctor_id uuid,
    date text,
    "time" text,
    type appointment_type,
    status appointment_status,
    notes text,
    created_at timestamp with time zone,
    patient_name text,
    doctor_name text,
    department_name text,
    billing_status text
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.patient_id,
    a.doctor_id,
    a.date,
    a."time",
    a.type,
    a.status,
    a.notes,
    a.created_at,
    p.name as patient_name,
    COALESCE(d.name, prof.name) as doctor_name,
    COALESCE(dt.name, 'General') as department_name,
    COALESCE(
      CASE 
        WHEN b.status = 'Paid'::bill_status THEN 'Paid'
        WHEN b.status = 'Overdue'::bill_status THEN 'Overdue'
        WHEN b.status = 'Pending'::bill_status THEN 'Pending'
        ELSE 'Pending'
      END,
      'Pending'
    ) as billing_status
  FROM appointments a
  LEFT JOIN patients p ON a.patient_id = p.id
  LEFT JOIN doctors d ON a.doctor_id = d.id
  LEFT JOIN profiles prof ON d.user_id = prof.id
  LEFT JOIN clinic_members cm ON d.user_id = cm.user_id AND d.clinic_id = cm.clinic_id
  LEFT JOIN clinic_departments cd ON cm.department_id = cd.id
  LEFT JOIN department_types dt ON cd.department_type_id = dt.id
  LEFT JOIN bills b ON a.id = b.appointment_id
  WHERE a.clinic_id = get_appointments_with_details_by_clinic.clinic_id
  ORDER BY a.date DESC, a."time" DESC;
END;
$$; 