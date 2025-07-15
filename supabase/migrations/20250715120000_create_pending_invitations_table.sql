-- Create pending_invitations table
CREATE TABLE pending_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  role TEXT NOT NULL CHECK (role IN ('doctor', 'staff', 'superadmin')),
  department_id UUID REFERENCES clinic_departments(id),
  name TEXT,
  phone TEXT,
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL,
  inviter_id UUID REFERENCES auth.users(id),
  CONSTRAINT unique_email_clinic UNIQUE (email, clinic_id)
);

-- Create function to handle new user sign-ups
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  invitation RECORD;
BEGIN
  -- Check for pending invitations
  FOR invitation IN
    SELECT * FROM pending_invitations
    WHERE email = NEW.email
  LOOP
    -- Create profile
    INSERT INTO profiles (id, email, name, phone, created_at, updated_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(invitation.name, NEW.raw_user_meta_data->>'name', NEW.email),
      invitation.phone,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET
      name = COALESCE(EXCLUDED.name, profiles.name),
      phone = COALESCE(EXCLUDED.phone, profiles.phone),
      email = NEW.email,
      updated_at = NOW();

    -- Add to clinic_members
    INSERT INTO clinic_members (id, user_id, clinic_id, role, department_id, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      NEW.id,
      invitation.clinic_id,
      invitation.role,
      invitation.department_id,
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id, clinic_id) DO UPDATE
    SET
      role = EXCLUDED.role,
      department_id = EXCLUDED.department_id,
      updated_at = NOW();

    -- If role is doctor, create doctor profile
    IF invitation.role = 'doctor' THEN
      INSERT INTO doctors (id, user_id, clinic_id, name, email, phone, is_active, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        NEW.id,
        invitation.clinic_id,
        COALESCE(invitation.name, NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email,
        invitation.phone,
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (user_id, clinic_id) DO UPDATE
      SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        updated_at = NOW();
    END IF;

    -- Delete the processed invitation
    DELETE FROM pending_invitations
    WHERE email = NEW.email AND clinic_id = invitation.clinic_id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();