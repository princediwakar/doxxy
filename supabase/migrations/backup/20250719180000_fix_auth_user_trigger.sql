-- Fix auth trigger for user creation
-- This ensures the trigger exists on auth.users table

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also fix the user_role enum casting issue
-- First, check if we need to update the default value
ALTER TABLE public.clinic_members 
    ALTER COLUMN role SET DEFAULT 'staff'::user_role;

-- Ensure the handle_new_user function has proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_name TEXT;
    user_phone TEXT;
    clinic_id_from_metadata UUID;
    role_from_metadata TEXT;
    invitation_token_from_metadata TEXT;
    existing_invitation RECORD;
BEGIN
    -- Start with basic error handling
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
        
        -- Extract metadata (with error handling)
        BEGIN
            clinic_id_from_metadata := (NEW.raw_user_meta_data->>'clinic_id')::UUID;
        EXCEPTION WHEN OTHERS THEN
            clinic_id_from_metadata := NULL;
        END;
        
        role_from_metadata := NEW.raw_user_meta_data->>'role';
        invitation_token_from_metadata := NEW.raw_user_meta_data->>'invitation_token';
        
        -- Create or update profile (this should always work)
        INSERT INTO public.profiles (id, name, email, phone, created_at, updated_at)
        VALUES (NEW.id, user_name, NEW.email, user_phone, NEW.created_at, NEW.updated_at)
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            phone = EXCLUDED.phone,
            updated_at = NOW();
        
        -- Handle invitation if metadata exists or if there's a pending invitation for this email
        IF invitation_token_from_metadata IS NOT NULL THEN
            -- Find the invitation by token
            SELECT * INTO existing_invitation
            FROM public.pending_invitations
            WHERE invitation_token = invitation_token_from_metadata;
            
            IF existing_invitation IS NOT NULL THEN
                -- Use invitation data
                clinic_id_from_metadata := existing_invitation.clinic_id;
                role_from_metadata := existing_invitation.role::TEXT;
                
                -- Update user name and phone if they were provided in invitation
                IF existing_invitation.name IS NOT NULL AND (user_name IS NULL OR user_name = split_part(NEW.email, '@', 1)) THEN
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
        ELSE
            -- If no token in metadata, check if there's a pending invitation for this email
            SELECT * INTO existing_invitation
            FROM public.pending_invitations
            WHERE email = NEW.email AND accepted_at IS NULL
            ORDER BY created_at DESC
            LIMIT 1;
            
            IF existing_invitation IS NOT NULL THEN
                -- Use invitation data
                clinic_id_from_metadata := existing_invitation.clinic_id;
                role_from_metadata := existing_invitation.role::TEXT;
                
                -- Update user name and phone if they were provided in invitation
                IF existing_invitation.name IS NOT NULL AND (user_name IS NULL OR user_name = split_part(NEW.email, '@', 1)) THEN
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
                WHERE id = existing_invitation.id;
            END IF;
        END IF;
        
        -- Create clinic membership if data exists (with proper error handling)
        IF clinic_id_from_metadata IS NOT NULL AND role_from_metadata IS NOT NULL THEN
            BEGIN
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
            EXCEPTION WHEN OTHERS THEN
                -- Log the error but don't fail the user creation
                RAISE NOTICE 'Error creating clinic membership: %', SQLERRM;
            END;
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        -- Log any unexpected errors but don't fail the user creation
        RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
        
        -- At minimum, try to create a profile
        BEGIN
            INSERT INTO public.profiles (id, name, email, created_at, updated_at)
            VALUES (NEW.id, split_part(NEW.email, '@', 1), NEW.email, NEW.created_at, NEW.updated_at)
            ON CONFLICT (id) DO NOTHING;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to create profile: %', SQLERRM;
        END;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;