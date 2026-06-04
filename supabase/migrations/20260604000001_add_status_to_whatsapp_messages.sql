-- Add delivery status tracking to whatsapp_messages

ALTER TABLE public.whatsapp_messages ADD COLUMN IF NOT EXISTS status text;
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON public.whatsapp_messages(status);
