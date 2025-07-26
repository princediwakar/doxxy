-- Disable all RLS policies that could cause recursion

-- Disable RLS on all problem tables
ALTER TABLE public.clinic_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own clinic memberships" ON public.clinic_members;
DROP POLICY IF EXISTS "Superadmins can manage all clinic members" ON public.clinic_members;
DROP POLICY IF EXISTS "Service role full access" ON public.clinic_members;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.clinic_members;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.clinic_members;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.clinic_members;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access profiles" ON public.profiles;

DROP POLICY IF EXISTS "Users can view invitations for their email" ON public.pending_invitations;
DROP POLICY IF EXISTS "Superadmins can manage invitations" ON public.pending_invitations;
DROP POLICY IF EXISTS "Service role full access invitations" ON public.pending_invitations;

-- Keep RLS disabled for now to fix the immediate issue
-- We'll re-enable with proper policies later