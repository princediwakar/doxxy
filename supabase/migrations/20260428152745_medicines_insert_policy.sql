-- Medicines INSERT policy
-- Applied via SQL Editor on 2026-04-28

ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "medicines_insert_authenticated" ON "public"."medicines"
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "medicines_update_authenticated" ON "public"."medicines"
  FOR UPDATE USING (auth.role() = 'authenticated');

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT INSERT, SELECT ON public.medicines TO authenticated;
GRANT INSERT, SELECT ON public.medicines TO anon;