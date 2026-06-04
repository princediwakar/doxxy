-- WhatsApp messages table: inbound patient replies and outbound automated messages
-- Enables the clinic inbox / patient communication history

BEGIN;

CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
  phone_number_id text NOT NULL,
  from_phone text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  text text NOT NULL,
  whatsapp_message_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_clinic ON public.whatsapp_messages(clinic_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_patient ON public.whatsapp_messages(patient_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone_number ON public.whatsapp_messages(phone_number_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_wamid ON public.whatsapp_messages(whatsapp_message_id);

ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Clinic members can read their clinic's messages
DO $$ BEGIN
  CREATE POLICY "whatsapp_messages_read_clinic" ON public.whatsapp_messages
    FOR SELECT USING (
      clinic_id IN (SELECT public.user_clinic_ids())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Insert: clinic members + service_role (webhook uses service_role key)
DO $$ BEGIN
  CREATE POLICY "whatsapp_messages_insert" ON public.whatsapp_messages
    FOR INSERT WITH CHECK (
      clinic_id IN (SELECT public.user_clinic_ids())
      OR (SELECT public.is_superadmin())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Only superadmins can delete messages in their clinic
DO $$ BEGIN
  CREATE POLICY "whatsapp_messages_delete" ON public.whatsapp_messages
    FOR DELETE USING (
      clinic_id IN (SELECT public.user_clinic_ids())
      AND (
        public.get_user_role_in_clinic(clinic_id) = 'superadmin'
        OR public.is_superadmin()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMIT;
