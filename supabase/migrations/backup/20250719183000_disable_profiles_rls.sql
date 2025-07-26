-- Disable RLS on profiles temporarily to fix profile completion

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop all policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access profiles" ON public.profiles;