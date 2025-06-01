-- Drop existing RLS policies on profiles
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow clinic members to view profiles in their clinic" ON public.profiles;

-- Create a new RLS policy for SELECT operations allowing clinic members to view profiles associated with their clinics
CREATE POLICY "Allow clinic members to view profiles in their clinic" ON public.profiles
FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.clinic_members cm WHERE cm.user_id = public.profiles.id AND cm.clinic_id IN (SELECT clinic_id FROM public.clinic_members WHERE user_id = auth.uid()))
); 