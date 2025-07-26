-- Fix invitation processing in handle_new_user trigger
-- The issue is that invitations are marked as accepted when email is sent,
-- but the trigger only processes invitations with accepted_at IS NULL

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_name TEXT;
    user_phone TEXT;
    user_avatar_url TEXT;
    clinic_id_from_metadata UUID;
    role_from_metadata TEXT;
    invitation_token_from_metadata TEXT;
    existing_invitation RECORD;
    profile_created BOOLEAN := false;
    membership_created BOOLEAN := false;
BEGIN
    -- Log the start of user processing
    RAISE NOTICE 'Processing new user: % (ID: %)', COALESCE(NEW.email, 'no-email'), NEW.id;
    
    -- Step 1: Extract and clean user data
    BEGIN
        -- Extract user name with comprehensive fallbacks
        user_name := COALESCE(
            NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'name', '')), ''),
            NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'full_name', '')), ''),
            NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'display_name', '')), ''),
            CASE 
                WHEN COALESCE(NEW.raw_user_meta_data->>'given_name', '') != '' 
                    AND COALESCE(NEW.raw_user_meta_data->>'family_name', '') != ''
                THEN trim(COALESCE(NEW.raw_user_meta_data->>'given_name', '')) || ' ' || 
                     trim(COALESCE(NEW.raw_user_meta_data->>'family_name', ''))
                ELSE NULL
            END,
            CASE 
                WHEN NEW.email IS NOT NULL AND NEW.email != ''
                THEN split_part(NEW.email, '@', 1)
                ELSE 'User'
            END
        );
        
        -- Extract phone number
        user_phone := COALESCE(
            NULLIF(trim(COALESCE(NEW.phone, '')), ''),
            NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'phone', '')), ''),
            NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'phone_number', '')), '')
        );
        
        -- Extract avatar URL
        user_avatar_url := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')), '');
        
        -- Extract invitation token
        invitation_token_from_metadata := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'invitation_token', '')), '');
        
        -- Extract role
        role_from_metadata := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'role', '')), '');
        
        -- Extract clinic ID with safe UUID conversion
        BEGIN
            IF COALESCE(NEW.raw_user_meta_data->>'clinic_id', '') != '' THEN
                clinic_id_from_metadata := (NEW.raw_user_meta_data->>'clinic_id')::UUID;
            ELSE
                clinic_id_from_metadata := NULL;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Invalid clinic_id in metadata: %', NEW.raw_user_meta_data->>'clinic_id';
            clinic_id_from_metadata := NULL;
        END;
        
    EXCEPTION WHEN OTHERS THEN
        -- If data extraction fails, use basic defaults
        RAISE NOTICE 'Error extracting user data: %, using defaults', SQLERRM;
        user_name := COALESCE(split_part(NEW.email, '@', 1), 'User');
        user_phone := NULL;
        user_avatar_url := NULL;
        clinic_id_from_metadata := NULL;
        role_from_metadata := NULL;
        invitation_token_from_metadata := NULL;
    END;
    
    -- Step 2: Create/Update Profile (this should never fail)
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
            user_avatar_url,
            COALESCE(NEW.created_at, NOW()), 
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            name = COALESCE(EXCLUDED.name, profiles.name, 'User'),
            email = COALESCE(EXCLUDED.email, profiles.email),
            phone = COALESCE(EXCLUDED.phone, profiles.phone),
            avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
            updated_at = NOW();
            
        profile_created := true;
        RAISE NOTICE 'Profile created/updated successfully for user: %', NEW.email;
        
    EXCEPTION WHEN OTHERS THEN
        -- Profile creation failed - this is critical but shouldn't stop the process
        RAISE WARNING 'CRITICAL: Failed to create profile for user %: %', NEW.email, SQLERRM;
        profile_created := false;
        
        -- Try a minimal profile insert as last resort
        BEGIN
            INSERT INTO public.profiles (id, name, email, created_at, updated_at)
            VALUES (NEW.id, 'User', COALESCE(NEW.email, ''), NOW(), NOW())
            ON CONFLICT (id) DO NOTHING;
            profile_created := true;
            RAISE NOTICE 'Created minimal profile as fallback';
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Even minimal profile creation failed: %', SQLERRM;
        END;
    END;
    
    -- Step 3: Process invitation if token exists
    IF invitation_token_from_metadata IS NOT NULL THEN
        BEGIN
            -- FIXED: Don't check for accepted_at IS NULL for token-based invitations
            -- The invitation might have been marked as accepted when the email was sent
            SELECT * INTO existing_invitation
            FROM public.pending_invitations
            WHERE invitation_token = invitation_token_from_metadata
            LIMIT 1;
            
            IF FOUND THEN
                -- Use invitation data
                clinic_id_from_metadata := existing_invitation.clinic_id;
                role_from_metadata := existing_invitation.role::TEXT;
                
                -- Update profile with invitation data if we have a profile
                IF profile_created THEN
                    UPDATE public.profiles SET
                        name = CASE 
                            WHEN existing_invitation.name IS NOT NULL 
                                AND existing_invitation.name != ''
                                AND (name IS NULL OR name IN ('User', split_part(NEW.email, '@', 1)))
                            THEN existing_invitation.name
                            ELSE name
                        END,
                        phone = CASE 
                            WHEN existing_invitation.phone IS NOT NULL 
                                AND existing_invitation.phone != ''
                                AND phone IS NULL
                            THEN existing_invitation.phone
                            ELSE phone
                        END,
                        updated_at = NOW()
                    WHERE id = NEW.id;
                END IF;
                
                -- Ensure the invitation is marked as accepted with current timestamp
                UPDATE public.pending_invitations
                SET accepted_at = NOW(), updated_at = NOW()
                WHERE invitation_token = invitation_token_from_metadata;
                
                RAISE NOTICE 'Processed invitation token: % for user: %', invitation_token_from_metadata, NEW.email;
            ELSE
                RAISE NOTICE 'No pending invitation found for token: %', invitation_token_from_metadata;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error processing invitation token: %', SQLERRM;
        END;
    END IF;
    
    -- Step 4: Check for email-based invitations if no token processed
    IF clinic_id_from_metadata IS NULL AND NEW.email IS NOT NULL THEN
        BEGIN
            SELECT * INTO existing_invitation
            FROM public.pending_invitations
            WHERE email = NEW.email 
            AND accepted_at IS NULL
            ORDER BY created_at DESC
            LIMIT 1;
            
            IF FOUND THEN
                clinic_id_from_metadata := existing_invitation.clinic_id;
                role_from_metadata := existing_invitation.role::TEXT;
                
                -- Mark invitation as accepted
                UPDATE public.pending_invitations
                SET accepted_at = NOW(), updated_at = NOW()
                WHERE id = existing_invitation.id;
                
                RAISE NOTICE 'Found and processed email-based invitation for: %', NEW.email;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error checking email-based invitations: %', SQLERRM;
        END;
    END IF;
    
    -- Step 5: Create clinic membership if we have the required data
    IF clinic_id_from_metadata IS NOT NULL AND role_from_metadata IS NOT NULL THEN
        BEGIN
            -- Validate role
            IF role_from_metadata NOT IN ('superadmin', 'admin', 'doctor', 'staff') THEN
                RAISE NOTICE 'Invalid role: %, defaulting to staff', role_from_metadata;
                role_from_metadata := 'staff';
            END IF;
            
            -- Create clinic membership
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
                role_from_metadata::public.user_role, 
                NOW(), 
                NOW()
            )
            ON CONFLICT (clinic_id, user_id) DO UPDATE SET
                role = EXCLUDED.role,
                updated_at = NOW();
            
            membership_created := true;
            RAISE NOTICE 'Created clinic membership: % as % in clinic %', NEW.email, role_from_metadata, clinic_id_from_metadata;
            
            -- Create doctor profile if role is doctor
            IF role_from_metadata = 'doctor' THEN
                BEGIN
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
                        is_active = EXCLUDED.is_active,
                        updated_at = NOW();
                    
                    RAISE NOTICE 'Created doctor profile for: %', NEW.email;
                    
                EXCEPTION WHEN OTHERS THEN
                    RAISE WARNING 'Failed to create doctor profile for %: %', NEW.email, SQLERRM;
                END;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed to create clinic membership for %: %', NEW.email, SQLERRM;
            membership_created := false;
        END;
    ELSE
        RAISE NOTICE 'No clinic membership created - missing data: clinic_id=%, role=%', clinic_id_from_metadata, role_from_metadata;
    END IF;
    
    -- Final logging
    RAISE NOTICE 'User processing complete for %: profile_created=%, membership_created=%', NEW.email, profile_created, membership_created;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Critical error in handle_new_user for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;