-- Per-clinic WhatsApp Business connections via Embedded Signup
-- Each clinic connects their own WABA so messages are sent from the clinic's number

BEGIN;

-- ============================================================================
-- 1. clinic_whatsapp_connections — one row per clinic
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.clinic_whatsapp_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL UNIQUE REFERENCES public.clinics(id) ON DELETE CASCADE,
  waba_id text NOT NULL,
  phone_number_id text NOT NULL,
  display_phone_number text,
  access_token text NOT NULL,
  token_expires_at timestamptz,
  business_id text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'disconnected')),
  quality_rating text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_clinic_whatsapp_phone ON public.clinic_whatsapp_connections(phone_number_id);

ALTER TABLE public.clinic_whatsapp_connections ENABLE ROW LEVEL SECURITY;

-- Superadmins can read their clinic's connection; service_role bypasses RLS
CREATE POLICY "whatsapp_connections_read_own_clinic" ON public.clinic_whatsapp_connections
  FOR SELECT USING (
    clinic_id IN (SELECT public.user_clinic_ids())
  );

CREATE POLICY "whatsapp_connections_manage_superadmin" ON public.clinic_whatsapp_connections
  FOR ALL USING (
    clinic_id IN (SELECT public.user_clinic_ids())
    AND (
      public.get_user_role_in_clinic(clinic_id) = 'superadmin'
      OR public.is_superadmin()
    )
  )
  WITH CHECK (
    clinic_id IN (SELECT public.user_clinic_ids())
    AND (
      public.get_user_role_in_clinic(clinic_id) = 'superadmin'
      OR public.is_superadmin()
    )
  );

-- ============================================================================
-- 2. updated_at trigger
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_clinic_whatsapp_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_clinic_whatsapp_connections_updated_at ON public.clinic_whatsapp_connections;
CREATE TRIGGER set_clinic_whatsapp_connections_updated_at
  BEFORE UPDATE ON public.clinic_whatsapp_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_clinic_whatsapp_connections_updated_at();

-- ============================================================================
-- 3. Patient WhatsApp consent and opt-out columns
-- ============================================================================
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS whatsapp_consent boolean NOT NULL DEFAULT false;

ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS whatsapp_opt_out boolean NOT NULL DEFAULT false;

-- ============================================================================
-- 4. Index for opt-out lookups during send
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_patients_whatsapp_opt_out ON public.patients(whatsapp_opt_out)
  WHERE whatsapp_opt_out = true;

COMMIT;
