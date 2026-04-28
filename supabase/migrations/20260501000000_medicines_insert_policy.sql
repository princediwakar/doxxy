-- Add INSERT policy for medicines table so authenticated users can quick-add
-- new medicines from the procurement workflow.
--
-- The table already has: SELECT policy (auth.role() = 'authenticated')
-- Missing: INSERT policy -> blocks all writes even with valid auth

ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "medicines_insert_authenticated" ON "public"."medicines"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "medicines_update_authenticated" ON "public"."medicines"
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Ensure grants are in place for authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT INSERT, SELECT ON public.medicines TO authenticated;
GRANT INSERT, SELECT ON public.medicines TO anon;