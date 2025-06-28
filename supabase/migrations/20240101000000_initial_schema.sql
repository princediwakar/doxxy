-- Initial schema setup
-- Migration: 20240101000000_initial_schema.sql

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create all necessary types
DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM (
        'Scheduled',
        'In Progress',
        'Completed',
        'Cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE appointment_type AS ENUM (
        'Walk-in',
        'Digital'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE bill_status AS ENUM (
        'Paid',
        'Pending',
        'Overdue'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'staff',
        'doctor',
        'superadmin'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create base tables
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY,
    name text,
    email text,
    phone text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clinics (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    address text,
    phone text,
    email text,
    website text,
    created_by uuid REFERENCES profiles(id),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS department_types (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clinic_departments (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
    department_type_id uuid REFERENCES department_types(id),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clinic_members (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    department_id uuid REFERENCES clinic_departments(id),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, clinic_id)
);

CREATE TABLE IF NOT EXISTS doctors (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    email text,
    phone text,
    bio text,
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    consultation_fee numeric,
    primary_specialization text DEFAULT 'General Medicine',
    years_of_experience integer,
    languages_spoken text[],
    practice_timings jsonb,
    professional_summary text,
    medical_registration_number text,
    medical_qualifications text[],
    medical_specializations text[],
    medical_council text,
    medical_license_state text,
    medical_license_expiry date,
    subspecialty text[],
    board_certifications text[],
    fellowship_details text,
    medical_college text,
    graduation_year integer,
    clinic_timings jsonb,
    profile_completion_percentage numeric DEFAULT 0,
    availability text DEFAULT 'Mon-Fri 9:00 AM - 5:00 PM',
    medical_degree text,
    medical_university text,
    postgraduate_degree text,
    pg_specialization text,
    pg_institution text,
    pg_completion_year integer,
    additional_qualifications text,
    research_experience text
);

CREATE TABLE IF NOT EXISTS patients (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    gender text,
    date_of_birth date,
    medical_id text,
    address text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(medical_id, clinic_id)
);

CREATE TABLE IF NOT EXISTS appointments (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
    patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id uuid REFERENCES doctors(id) NOT NULL,
    date text NOT NULL,
    time text NOT NULL,
    type appointment_type DEFAULT 'Walk-in',
    status appointment_status DEFAULT 'Scheduled',
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS consultations (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
    patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    specialty_data jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bills (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
    patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    appointment_id uuid REFERENCES appointments(id),
    amount numeric NOT NULL,
    items jsonb,
    status bill_status DEFAULT 'Pending',
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prescriptions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
    patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id uuid REFERENCES doctors(id) NOT NULL,
    appointment_id uuid REFERENCES appointments(id),
    medications jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Insert default department types
INSERT INTO department_types (name) VALUES 
    ('General Medicine'),
    ('Cardiology'),
    ('Neurology'),
    ('Pediatrics'),
    ('Orthopedics'),
    ('Dermatology'),
    ('Psychiatry'),
    ('Emergency Medicine')
ON CONFLICT (name) DO NOTHING;

-- Basic helper functions
CREATE OR REPLACE FUNCTION create_profile_for_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    new.id, 
    new.email,
    COALESCE(
      (new.raw_user_meta_data->>'name')::text,
      (new.raw_user_meta_data->>'full_name')::text,
      new.email
    )
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    email = EXCLUDED.email,
    name = EXCLUDED.name
  WHERE profiles.name IS NULL;
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Basic triggers
CREATE OR REPLACE TRIGGER create_profile_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_profile_for_new_user();

CREATE OR REPLACE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "profiles_own_profile" ON profiles
    FOR ALL TO authenticated
    USING (id = auth.uid()); 