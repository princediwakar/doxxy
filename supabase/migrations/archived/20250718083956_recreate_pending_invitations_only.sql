-- Drop existing pending_invitations table and recreate with proper structure
DROP TABLE IF EXISTS public.pending_invitations CASCADE;

-- Create a cleaner pending_invitations table
CREATE TABLE public.pending_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    role public.user_role NOT NULL,
    department_id UUID REFERENCES public.clinic_departments(id) ON DELETE SET NULL,
    name TEXT,
    phone TEXT,
    invitation_token TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint to prevent duplicate invitations
ALTER TABLE public.pending_invitations 
ADD CONSTRAINT unique_email_clinic_pending UNIQUE (email, clinic_id);

-- Add index for faster lookups
CREATE INDEX idx_pending_invitations_email ON public.pending_invitations(email);
CREATE INDEX idx_pending_invitations_token ON public.pending_invitations(invitation_token);
CREATE INDEX idx_pending_invitations_clinic_id ON public.pending_invitations(clinic_id);
CREATE INDEX idx_pending_invitations_expires_at ON public.pending_invitations(expires_at);

-- Enable RLS
ALTER TABLE public.pending_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view invitations for their clinics" ON public.pending_invitations
    FOR SELECT TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id FROM public.clinic_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Superadmins can insert invitations" ON public.pending_invitations
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.clinic_members 
            WHERE user_id = auth.uid() 
            AND clinic_id = pending_invitations.clinic_id 
            AND role = 'superadmin'
        )
    );

CREATE POLICY "Superadmins can update invitations" ON public.pending_invitations
    FOR UPDATE TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id FROM public.clinic_members 
            WHERE user_id = auth.uid() 
            AND role = 'superadmin'
        )
    );

CREATE POLICY "Superadmins can delete invitations" ON public.pending_invitations
    FOR DELETE TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id FROM public.clinic_members 
            WHERE user_id = auth.uid() 
            AND role = 'superadmin'
        )
    );

-- Service role can access all
CREATE POLICY "Service role full access to pending_invitations" ON public.pending_invitations
    TO service_role USING (true) WITH CHECK (true);

-- Grant permissions
GRANT ALL ON TABLE public.pending_invitations TO authenticated;
GRANT ALL ON TABLE public.pending_invitations TO service_role;