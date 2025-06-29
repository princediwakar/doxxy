-- Create a new table for storing contact form messages
CREATE TABLE IF NOT EXISTS "public"."contact_messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "company" "text",
    "city" "text",
    "message" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "public"."contact_messages" OWNER TO "postgres";

-- Create an index on the email field for faster lookups
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON public.contact_messages USING btree (email);

-- Create a function to handle contact form submissions
CREATE OR REPLACE FUNCTION public.submit_contact_form(
  name text,
  email text,
  message text,
  phone text DEFAULT NULL,
  company text DEFAULT NULL,
  city text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  message_id uuid;
BEGIN
  INSERT INTO public.contact_messages (name, email, phone, company, city, message)
  VALUES (name, email, phone, company, city, message)
  RETURNING id INTO message_id;
  
  RETURN message_id;
END;
$$; 