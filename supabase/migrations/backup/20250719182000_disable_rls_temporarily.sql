-- Temporarily disable RLS to fix recursion issues

-- Disable RLS on problematic tables
ALTER TABLE public.clinic_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own clinic memberships" ON public.clinic_members;
DROP POLICY IF EXISTS "Superadmins can manage all clinic members" ON public.clinic_members;
DROP POLICY IF EXISTS "Service role full access" ON public.clinic_members;

-- Create simple, non-recursive policies
CREATE POLICY "Enable read access for authenticated users" 
ON public.clinic_members FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Enable insert for authenticated users" 
ON public.clinic_members FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" 
ON public.clinic_members FOR UPDATE 
TO authenticated 
USING (true);

-- Re-enable RLS for clinic_members
ALTER TABLE public.clinic_members ENABLE ROW LEVEL SECURITY;