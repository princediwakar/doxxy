-- Migration: Backfill submit_contact_form RPC
-- Auto-generated from live database

CREATE OR REPLACE FUNCTION public.submit_contact_form(name text, email text, message text, phone text DEFAULT NULL::text, company text DEFAULT NULL::text, city text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  message_id uuid;
BEGIN
  INSERT INTO public.contact_messages (name, email, phone, company, city, message)
  VALUES (name, email, phone, company, city, message)
  RETURNING id INTO message_id;
  
  RETURN message_id;
END;
$function$
;
