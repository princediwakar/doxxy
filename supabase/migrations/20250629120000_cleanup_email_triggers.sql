-- Clean up any existing email notification triggers and functions
-- This fixes the "schema net does not exist" error

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS trigger_notify_new_contact_message ON public.contact_messages;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.notify_new_contact_message();

-- Ensure our contact form submission function works without email triggers
-- The submit_contact_form function should continue to work normally 