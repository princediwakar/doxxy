-- Manual processing of invitation for mental.alternate@gmail.com
-- Creating all necessary records for the invitation to work

-- Step 1: Create clinic record (since it doesn't exist)
INSERT INTO clinics (id, name, address, phone, email, website, created_at, updated_at)
VALUES (
    'b6a6e214-8944-4254-bc10-8fa0886b577a',
    'Test Clinic for Mental Alternate',
    '123 Healthcare Street, Medical District',
    '+1-555-0123',
    'clinic@example.com',
    'https://example.com',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Step 2: Check if department_types exist, if not create a basic one
INSERT INTO department_types (id, name, created_at, updated_at) 
SELECT gen_random_uuid(), 'General Medicine', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM department_types LIMIT 1);

-- Step 3: Create department record (referencing an existing department_type)
INSERT INTO departments (id, clinic_id, department_type_id, is_active, created_at, updated_at)
SELECT 
    'f10f1dd8-7333-4293-8ede-07eca2516277',
    'b6a6e214-8944-4254-bc10-8fa0886b577a',
    dt.id,
    true,
    NOW(),
    NOW()
FROM department_types dt
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Step 4: Create auth user record (this should normally be done through Supabase Auth)
INSERT INTO auth.users (
    id, 
    email, 
    created_at, 
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role
) VALUES (
    '5632e897-face-4dae-917b-d578af3cc722',
    'mental.alternate@gmail.com',
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Mental Alternate"}',
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Step 5: Create user profile record
INSERT INTO profiles (id, name, email, phone, created_at, updated_at)
VALUES (
    '5632e897-face-4dae-917b-d578af3cc722',
    'Mental Alternate',
    'mental.alternate@gmail.com',
    '8383838383',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Step 6: Create clinic_departments entry (needed for the department_id foreign key)
INSERT INTO clinic_departments (id, clinic_id, department_type_id, created_at, updated_at)
SELECT 
    'f10f1dd8-7333-4293-8ede-07eca2516277',
    'b6a6e214-8944-4254-bc10-8fa0886b577a',
    dt.id,
    NOW(),
    NOW()
FROM department_types dt
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Step 7: Create clinic_members record
INSERT INTO clinic_members (user_id, clinic_id, role, department_id, created_at, updated_at)
VALUES (
    '5632e897-face-4dae-917b-d578af3cc722',
    'b6a6e214-8944-4254-bc10-8fa0886b577a',
    'doctor',
    'f10f1dd8-7333-4293-8ede-07eca2516277',
    NOW(),
    NOW()
) ON CONFLICT (user_id, clinic_id) DO NOTHING;

-- Step 8: Create doctors record
INSERT INTO doctors (user_id, clinic_id, name, email, phone, is_active, created_at, updated_at)
VALUES (
    '5632e897-face-4dae-917b-d578af3cc722',
    'b6a6e214-8944-4254-bc10-8fa0886b577a',
    'Mental Alternate',
    'mental.alternate@gmail.com',
    '8383838383',
    true,
    NOW(),
    NOW()
) ON CONFLICT (user_id, clinic_id) DO NOTHING;

-- Step 9: Create pending_invitations record and mark as accepted
INSERT INTO pending_invitations (
    id, 
    email, 
    clinic_id, 
    role, 
    name, 
    phone, 
    department_id,
    accepted_at,
    created_at, 
    updated_at
) VALUES (
    'f6131938-8211-4039-ac68-c9e764c1b9f8',
    'mental.alternate@gmail.com',
    'b6a6e214-8944-4254-bc10-8fa0886b577a',
    'doctor',
    'Mental Alternate',
    '8383838383',
    'f10f1dd8-7333-4293-8ede-07eca2516277',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET 
    accepted_at = NOW(),
    updated_at = NOW();

-- Verification queries
DO $$
BEGIN
    RAISE NOTICE 'Verification Results:';
    
    -- Check clinic exists
    IF EXISTS (SELECT 1 FROM clinics WHERE id = 'b6a6e214-8944-4254-bc10-8fa0886b577a') THEN
        RAISE NOTICE ' Clinic record created';
    ELSE
        RAISE NOTICE 'L Clinic record missing';
    END IF;
    
    -- Check department exists
    IF EXISTS (SELECT 1 FROM departments WHERE id = 'f10f1dd8-7333-4293-8ede-07eca2516277') THEN
        RAISE NOTICE ' Department record created';
    ELSE
        RAISE NOTICE 'L Department record missing';
    END IF;
    
    -- Check profile exists
    IF EXISTS (SELECT 1 FROM profiles WHERE id = '5632e897-face-4dae-917b-d578af3cc722') THEN
        RAISE NOTICE ' Profile record created';
    ELSE
        RAISE NOTICE 'L Profile record missing';
    END IF;
    
    -- Check clinic_members exists
    IF EXISTS (SELECT 1 FROM clinic_members WHERE user_id = '5632e897-face-4dae-917b-d578af3cc722' AND clinic_id = 'b6a6e214-8944-4254-bc10-8fa0886b577a') THEN
        RAISE NOTICE ' Clinic member record created';
    ELSE
        RAISE NOTICE 'L Clinic member record missing';
    END IF;
    
    -- Check doctors exists
    IF EXISTS (SELECT 1 FROM doctors WHERE user_id = '5632e897-face-4dae-917b-d578af3cc722' AND clinic_id = 'b6a6e214-8944-4254-bc10-8fa0886b577a') THEN
        RAISE NOTICE ' Doctor record created';
    ELSE
        RAISE NOTICE 'L Doctor record missing';
    END IF;
    
    -- Check invitation is accepted
    IF EXISTS (SELECT 1 FROM pending_invitations WHERE id = 'f6131938-8211-4039-ac68-c9e764c1b9f8' AND accepted_at IS NOT NULL) THEN
        RAISE NOTICE ' Invitation marked as accepted';
    ELSE
        RAISE NOTICE 'L Invitation not properly accepted';
    END IF;
END $$;