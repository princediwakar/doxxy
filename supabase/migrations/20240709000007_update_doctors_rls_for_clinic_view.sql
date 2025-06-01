-- Drop any existing RLS policies on doctors
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.doctors;
DROP POLICY IF EXISTS "Allow clinic members to view doctors in their clinic" ON public.doctors;

-- Create a new RLS policy for SELECT operations allowing clinic members to view doctors in their clinic
CREATE POLICY "Allow clinic members to view doctors in their clinic" ON public.doctors
FOR SELECT TO authenticated
USING (
  clinic_id IN (SELECT clinic_id FROM public.clinic_members WHERE user_id = auth.uid())
); 