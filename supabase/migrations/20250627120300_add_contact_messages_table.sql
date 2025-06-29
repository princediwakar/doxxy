-- Create a new table for storing contact form messages
CREATE TABLE IF NOT EXISTS "public"."contact_messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "company" "text",
    "city" "text",
    "subject" "text",
    "message" "text" NOT NULL,
    "meeting_type" "text",
    "is_processed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "public"."contact_messages" OWNER TO "postgres";

-- Create an index on the email field for faster lookups
CREATE INDEX idx_contact_messages_email ON public.contact_messages USING btree (email);

-- Create a function to send an email notification when a new message is created
CREATE OR REPLACE FUNCTION public.notify_new_contact_message()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    'https://api.sendgrid.com/v3/mail/send',
    '{"personalizations":[{"to":[{"email":"doxxyapp@gmail.com"}]}],"from":{"email":"noreply@doxxy.com"},"subject":"New Contact Form Submission","content":[{"type":"text/plain","value":"New contact form submission from ' || NEW.name || ' (' || NEW.email || '). Message: ' || NEW.message || '"}]}',
    'application/json',
    ARRAY[net.http_header('Authorization', 'Bearer ' || current_setting('app.sendgrid_api_key', true))]
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the notification function when a new message is inserted
CREATE TRIGGER trigger_notify_new_contact_message
AFTER INSERT ON public.contact_messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_contact_message();

-- Create a function to handle contact form submissions
CREATE OR REPLACE FUNCTION public.submit_contact_form(
  name text,
  email text,
  phone text DEFAULT NULL,
  company text DEFAULT NULL,
  city text DEFAULT NULL,
  subject text DEFAULT NULL,
  message text,
  meeting_type text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  message_id uuid;
BEGIN
  INSERT INTO public.contact_messages (name, email, phone, company, city, subject, message, meeting_type)
  VALUES (name, email, phone, company, city, subject, message, meeting_type)
  RETURNING id INTO message_id;
  
  RETURN message_id;
END;
$$; 