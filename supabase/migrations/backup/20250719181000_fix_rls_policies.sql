-- Fix RLS policies to prevent infinite recursion

-- Drop and recreate clinic_members policies to fix recursion
DROP POLICY IF EXISTS "Users can view their own clinic memberships" ON public.clinic_members;
DROP POLICY IF EXISTS "Users can update their own clinic memberships" ON public.clinic_members;
DROP POLICY IF EXISTS "Superadmins can manage all clinic members" ON public.clinic_members;

-- Create non-recursive policies for clinic_members
CREATE POLICY "Users can view their own clinic memberships" 
ON public.clinic_members FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Superadmins can manage all clinic members" 
ON public.clinic_members FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.clinic_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.clinic_id = clinic_members.clinic_id 
    AND cm.role = 'superadmin'
  )
);

-- Allow service role to do everything (for system operations)
CREATE POLICY "Service role full access" 
ON public.clinic_members FOR ALL 
TO service_role 
USING (true);

-- Fix profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (id = auth.uid());

-- Allow service role to do everything on profiles
CREATE POLICY "Service role full access profiles" 
ON public.profiles FOR ALL 
TO service_role 
USING (true);

-- Fix pending_invitations policies
DROP POLICY IF EXISTS "Users can view invitations for their email" ON public.pending_invitations;
DROP POLICY IF EXISTS "Superadmins can manage invitations" ON public.pending_invitations;

CREATE POLICY "Users can view invitations for their email" 
ON public.pending_invitations FOR SELECT 
USING (
  email = auth.email() OR 
  EXISTS (
    SELECT 1 FROM public.clinic_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.clinic_id = pending_invitations.clinic_id 
    AND cm.role = 'superadmin'
  )
);

CREATE POLICY "Superadmins can manage invitations" 
ON public.pending_invitations FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.clinic_members cm 
    WHERE cm.user_id = auth.uid() 
    AND cm.clinic_id = pending_invitations.clinic_id 
    AND cm.role = 'superadmin'
  )
);

-- Allow service role to do everything on pending_invitations
CREATE POLICY "Service role full access invitations" 
ON public.pending_invitations FOR ALL 
TO service_role 
USING (true);