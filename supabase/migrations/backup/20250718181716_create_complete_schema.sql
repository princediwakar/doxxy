-- Complete schema creation for clinic members management system

-- Create user_role enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('doctor', 'staff', 'superadmin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create clinics table
CREATE TABLE IF NOT EXISTS public.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clinic_members table
CREATE TABLE IF NOT EXISTS public.clinic_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'staff',
    department_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(clinic_id, user_id)
);

-- Create department_types table
CREATE TABLE IF NOT EXISTS public.department_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    department_type_id UUID NOT NULL REFERENCES public.department_types(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(clinic_id, department_type_id)
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    specialization TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, clinic_id)
);

-- Create pending_invitations table
CREATE TABLE IF NOT EXISTS public.pending_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    name TEXT,
    phone TEXT,
    invitation_token UUID DEFAULT gen_random_uuid(),
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(email, clinic_id)
);

-- Add department_id foreign key to clinic_members
DO $$ BEGIN
    ALTER TABLE public.clinic_members 
    ADD CONSTRAINT clinic_members_department_id_fkey 
    FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clinic_members_clinic_id ON public.clinic_members(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_members_user_id ON public.clinic_members(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_clinic_id ON public.doctors(clinic_id);
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON public.doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_email ON public.pending_invitations(email);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_clinic_id ON public.pending_invitations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_pending_invitations_token ON public.pending_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_departments_clinic_id ON public.departments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Enable RLS on all tables
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Clinic members can view their clinic" ON public.clinics
    FOR SELECT USING (
        id IN (SELECT clinic_id FROM public.clinic_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Clinic members can view clinic members" ON public.clinic_members
    FOR SELECT USING (
        clinic_id IN (SELECT clinic_id FROM public.clinic_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Superadmins can manage clinic members" ON public.clinic_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.clinic_members 
            WHERE user_id = auth.uid() 
            AND clinic_id = public.clinic_members.clinic_id 
            AND role = 'superadmin'
        )
    );

CREATE POLICY "Clinic members can view departments" ON public.departments
    FOR SELECT USING (
        clinic_id IN (SELECT clinic_id FROM public.clinic_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Superadmins can manage departments" ON public.departments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.clinic_members 
            WHERE user_id = auth.uid() 
            AND clinic_id = public.departments.clinic_id 
            AND role = 'superadmin'
        )
    );

CREATE POLICY "Anyone can view department types" ON public.department_types
    FOR SELECT USING (true);

CREATE POLICY "Clinic members can view doctors" ON public.doctors
    FOR SELECT USING (
        clinic_id IN (SELECT clinic_id FROM public.clinic_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Doctors can update their own profile" ON public.doctors
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Superadmins can manage doctors" ON public.doctors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.clinic_members 
            WHERE user_id = auth.uid() 
            AND clinic_id = public.doctors.clinic_id 
            AND role = 'superadmin'
        )
    );

CREATE POLICY "Superadmins can manage invitations" ON public.pending_invitations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.clinic_members 
            WHERE user_id = auth.uid() 
            AND clinic_id = public.pending_invitations.clinic_id 
            AND role = 'superadmin'
        )
    );

-- Create handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_name TEXT;
    user_phone TEXT;
    clinic_id_from_metadata UUID;
    role_from_metadata TEXT;
    invitation_token_from_metadata UUID;
    existing_invitation RECORD;
BEGIN
    -- Extract user name from various sources
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'display_name',
        NEW.raw_user_meta_data->>'given_name' || ' ' || NEW.raw_user_meta_data->>'family_name',
        split_part(NEW.email, '@', 1)
    );
    
    -- Extract phone number
    user_phone := COALESCE(
        NEW.phone,
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'phone_number'
    );
    
    -- Extract metadata
    clinic_id_from_metadata := (NEW.raw_user_meta_data->>'clinic_id')::UUID;
    role_from_metadata := NEW.raw_user_meta_data->>'role';
    invitation_token_from_metadata := (NEW.raw_user_meta_data->>'invitation_token')::UUID;
    
    -- Create or update profile
    INSERT INTO public.profiles (id, name, email, phone, created_at, updated_at)
    VALUES (NEW.id, user_name, NEW.email, user_phone, NEW.created_at, NEW.updated_at)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        updated_at = NOW();
    
    -- Handle invitation if metadata exists
    IF invitation_token_from_metadata IS NOT NULL THEN
        -- Find the invitation
        SELECT * INTO existing_invitation
        FROM public.pending_invitations
        WHERE invitation_token = invitation_token_from_metadata;
        
        IF existing_invitation IS NOT NULL THEN
            -- Use invitation data
            clinic_id_from_metadata := existing_invitation.clinic_id;
            role_from_metadata := existing_invitation.role::TEXT;
            
            -- Update user name and phone if they were provided in invitation
            IF existing_invitation.name IS NOT NULL AND user_name IS NULL THEN
                user_name := existing_invitation.name;
                UPDATE public.profiles SET name = user_name WHERE id = NEW.id;
            END IF;
            
            IF existing_invitation.phone IS NOT NULL AND user_phone IS NULL THEN
                user_phone := existing_invitation.phone;
                UPDATE public.profiles SET phone = user_phone WHERE id = NEW.id;
            END IF;
            
            -- Mark invitation as accepted
            UPDATE public.pending_invitations
            SET accepted_at = NOW(), updated_at = NOW()
            WHERE invitation_token = invitation_token_from_metadata;
        END IF;
    END IF;
    
    -- Create clinic membership if data exists
    IF clinic_id_from_metadata IS NOT NULL AND role_from_metadata IS NOT NULL THEN
        INSERT INTO public.clinic_members (clinic_id, user_id, role, created_at, updated_at)
        VALUES (clinic_id_from_metadata, NEW.id, role_from_metadata::user_role, NOW(), NOW())
        ON CONFLICT (clinic_id, user_id) DO UPDATE SET
            role = EXCLUDED.role,
            updated_at = NOW();
        
        -- Create doctor profile if role is doctor
        IF role_from_metadata = 'doctor' THEN
            INSERT INTO public.doctors (user_id, clinic_id, name, email, phone, is_active, created_at, updated_at)
            VALUES (NEW.id, clinic_id_from_metadata, user_name, NEW.email, user_phone, true, NOW(), NOW())
            ON CONFLICT (user_id, clinic_id) DO UPDATE SET
                name = EXCLUDED.name,
                email = EXCLUDED.email,
                phone = EXCLUDED.phone,
                updated_at = NOW();
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some default data (handle missing description column gracefully)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'department_types' AND column_name = 'description') THEN
        INSERT INTO public.department_types (name, description) VALUES
            ('General Medicine', 'General medical services'),
            ('Pediatrics', 'Child healthcare services'),
            ('Cardiology', 'Heart and cardiovascular care'),
            ('Orthopedics', 'Bone and joint care'),
            ('Dermatology', 'Skin and dermatological care'),
            ('Neurology', 'Brain and nervous system care'),
            ('Psychiatry', 'Mental health services'),
            ('Radiology', 'Medical imaging services'),
            ('Laboratory', 'Medical testing and analysis'),
            ('Pharmacy', 'Medication management'),
            ('Administration', 'Administrative services'),
            ('Nursing', 'Nursing care services')
        ON CONFLICT (name) DO NOTHING;
    ELSE
        INSERT INTO public.department_types (name) VALUES
            ('General Medicine'),
            ('Pediatrics'),
            ('Cardiology'),
            ('Orthopedics'),
            ('Dermatology'),
            ('Neurology'),
            ('Psychiatry'),
            ('Radiology'),
            ('Laboratory'),
            ('Pharmacy'),
            ('Administration'),
            ('Nursing')
        ON CONFLICT (name) DO NOTHING;
    END IF;
END $$;

-- Insert a default clinic (Neurovision) for testing  
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clinics' AND column_name = 'updated_at') THEN
        INSERT INTO public.clinics (id, name, address, phone, email, created_at, updated_at) VALUES
            ('1a615db8-277e-45e0-b204-62b6b8c681fc', 'Neurovision Clinic', '123 Healthcare Ave', '+1-555-0123', 'info@neurovision.com', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
    ELSE
        INSERT INTO public.clinics (id, name, address, phone, email) VALUES
            ('1a615db8-277e-45e0-b204-62b6b8c681fc', 'Neurovision Clinic', '123 Healthcare Ave', '+1-555-0123', 'info@neurovision.com')
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;