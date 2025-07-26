-- Fix foreign key constraint for pending_invitations.department_id
-- It should reference clinic_departments.id, not departments.id

-- Drop the existing constraint
ALTER TABLE public.pending_invitations 
DROP CONSTRAINT IF EXISTS pending_invitations_department_id_fkey;

-- Add the correct constraint only if clinic_departments table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clinic_departments' AND table_schema = 'public') THEN
        ALTER TABLE public.pending_invitations 
        ADD CONSTRAINT pending_invitations_department_id_fkey 
        FOREIGN KEY (department_id) REFERENCES public.clinic_departments(id) ON DELETE SET NULL;
    ELSE
        -- If clinic_departments doesn't exist, just allow NULL values
        RAISE NOTICE 'clinic_departments table does not exist, skipping foreign key constraint';
    END IF;
END $$;