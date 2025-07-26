-- Fix profile schema mismatch and handle_new_user function
-- This migration fixes the 500 error caused by schema inconsistencies

-- First, ensure the profiles table has the correct schema
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update the handle_new_user function to be more robust
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
    -- Extract user name from various sources with better handling
    user_name := COALESCE(
        NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''),
        NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''),
        NULLIF(trim(NEW.raw_user_meta_data->>'display_name'), ''),
        CASE 
            WHEN NEW.raw_user_meta_data->>'given_name' IS NOT NULL 
                AND NEW.raw_user_meta_data->>'family_name' IS NOT NULL
            THEN trim(NEW.raw_user_meta_data->>'given_name') || ' ' || trim(NEW.raw_user_meta_data->>'family_name')
            ELSE NULL
        END,
        CASE 
            WHEN NEW.email IS NOT NULL AND NEW.email != ''
            THEN split_part(NEW.email, '@', 1)
            ELSE 'Unknown User'
        END
    );
    
    -- Extract phone number
    user_phone := COALESCE(
        NULLIF(trim(NEW.phone), ''),
        NULLIF(trim(NEW.raw_user_meta_data->>'phone'), ''),
        NULLIF(trim(NEW.raw_user_meta_data->>'phone_number'), '')
    );
    
    -- Extract metadata with safe conversion
    BEGIN
        clinic_id_from_metadata := CASE 
            WHEN NEW.raw_user_meta_data->>'clinic_id' IS NOT NULL 
                AND NEW.raw_user_meta_data->>'clinic_id' != ''
            THEN (NEW.raw_user_meta_data->>'clinic_id')::UUID
            ELSE NULL
        END;
    EXCEPTION WHEN OTHERS THEN
        clinic_id_from_metadata := NULL;
    END;
    
    role_from_metadata := NULLIF(trim(NEW.raw_user_meta_data->>'role'), '');
    invitation_token_from_metadata := NULLIF(trim(NEW.raw_user_meta_data->>'invitation_token'), '');
    
    -- Always create/update profile first (this should never fail)
    BEGIN
        INSERT INTO public.profiles (
            id, 
            name, 
            email, 
            phone, 
            avatar_url,
            created_at, 
            updated_at
        )
        VALUES (
            NEW.id, 
            user_name, 
            NEW.email, 
            user_phone, 
            NEW.raw_user_meta_data->>'avatar_url',
            COALESCE(NEW.created_at, NOW()), 
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            name = COALESCE(EXCLUDED.name, profiles.name),
            email = COALESCE(EXCLUDED.email, profiles.email),
            phone = COALESCE(EXCLUDED.phone, profiles.phone),
            avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
            updated_at = NOW();
            
        RAISE NOTICE 'Profile created/updated for user: % (%)', user_name, NEW.email;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Failed to create/update profile for user %: %', NEW.email, SQLERRM;
        -- Don't fail the entire process, but log the error
    END;
    
    -- Handle invitation logic only if we have invitation data
    IF invitation_token_from_metadata IS NOT NULL THEN
        BEGIN
            -- Find the invitation by token
            SELECT * INTO existing_invitation
            FROM public.pending_invitations
            WHERE invitation_token = invitation_token_from_metadata
            AND accepted_at IS NULL;
            
            IF existing_invitation IS NOT NULL THEN
                -- Use invitation data
                clinic_id_from_metadata := existing_invitation.clinic_id;
                role_from_metadata := existing_invitation.role::TEXT;
                
                -- Update user profile with invitation data if better
                UPDATE public.profiles SET
                    name = CASE 
                        WHEN existing_invitation.name IS NOT NULL 
                            AND (name IS NULL OR name = split_part(NEW.email, '@', 1))
                        THEN existing_invitation.name
                        ELSE name
                    END,
                    phone = CASE 
                        WHEN existing_invitation.phone IS NOT NULL AND phone IS NULL
                        THEN existing_invitation.phone
                        ELSE phone
                    END,
                    updated_at = NOW()
                WHERE id = NEW.id;
                
                -- Mark invitation as accepted
                UPDATE public.pending_invitations
                SET accepted_at = NOW(), updated_at = NOW()
                WHERE invitation_token = invitation_token_from_metadata;
                
                RAISE NOTICE 'Processed invitation for user: % with token: %', NEW.email, invitation_token_from_metadata;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error processing invitation for user %: %', NEW.email, SQLERRM;
        END;
    END IF;
    
    -- Also check for pending invitations by email
    IF clinic_id_from_metadata IS NULL THEN
        BEGIN
            SELECT * INTO existing_invitation
            FROM public.pending_invitations
            WHERE email = NEW.email 
            AND accepted_at IS NULL
            ORDER BY created_at DESC
            LIMIT 1;
            
            IF existing_invitation IS NOT NULL THEN
                clinic_id_from_metadata := existing_invitation.clinic_id;
                role_from_metadata := existing_invitation.role::TEXT;
                
                -- Mark invitation as accepted
                UPDATE public.pending_invitations
                SET accepted_at = NOW(), updated_at = NOW()
                WHERE id = existing_invitation.id;
                
                RAISE NOTICE 'Found and processed email-based invitation for user: %', NEW.email;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error checking email-based invitations for user %: %', NEW.email, SQLERRM;
        END;
    END IF;
    
    -- Create clinic membership if we have the required data
    IF clinic_id_from_metadata IS NOT NULL AND role_from_metadata IS NOT NULL THEN
        BEGIN
            -- Validate that the role is a valid enum value
            IF role_from_metadata NOT IN ('superadmin', 'admin', 'doctor', 'staff') THEN
                RAISE NOTICE 'Invalid role: %, defaulting to staff', role_from_metadata;
                role_from_metadata := 'staff';
            END IF;
            
            INSERT INTO public.clinic_members (
                clinic_id, 
                user_id, 
                role, 
                created_at, 
                updated_at
            )
            VALUES (
                clinic_id_from_metadata, 
                NEW.id, 
                role_from_metadata::user_role, 
                NOW(), 
                NOW()
            )
            ON CONFLICT (clinic_id, user_id) DO UPDATE SET
                role = EXCLUDED.role,
                updated_at = NOW();
            
            RAISE NOTICE 'Created clinic membership: user % in clinic % as %', NEW.email, clinic_id_from_metadata, role_from_metadata;
            
            -- Create doctor profile if role is doctor
            IF role_from_metadata = 'doctor' THEN
                INSERT INTO public.doctors (
                    user_id, 
                    clinic_id, 
                    name, 
                    email, 
                    phone, 
                    is_active, 
                    created_at, 
                    updated_at
                )
                VALUES (
                    NEW.id, 
                    clinic_id_from_metadata, 
                    user_name, 
                    NEW.email, 
                    user_phone, 
                    true, 
                    NOW(), 
                    NOW()
                )
                ON CONFLICT (user_id, clinic_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    email = EXCLUDED.email,
                    phone = EXCLUDED.phone,
                    updated_at = NOW();
                    
                RAISE NOTICE 'Created doctor profile for user: %', NEW.email;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error creating clinic membership for user %: %', NEW.email, SQLERRM;
            -- Don't fail user creation, just log the error
        END;
    END IF;
    
    RAISE NOTICE 'Successfully processed new user: % (ID: %)', NEW.email, NEW.id;
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    -- This should never happen, but if it does, log it and don't fail
    RAISE NOTICE 'Unexpected error in handle_new_user for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated, service_role;