-- Enable RLS on contact_messages table
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows inserting contact messages (for contact form submissions)
-- This allows anonymous users to submit contact forms
CREATE POLICY "Allow public insert on contact_messages" ON public.contact_messages
    FOR INSERT 
    WITH CHECK (true);

-- Create a policy that allows reading contact messages only for authenticated users
-- This ensures only authenticated users (like admins) can view contact messages
CREATE POLICY "Allow authenticated read on contact_messages" ON public.contact_messages
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Create a policy that allows authenticated users to update contact messages
-- (in case admins need to mark messages as read/processed)
CREATE POLICY "Allow authenticated update on contact_messages" ON public.contact_messages
    FOR UPDATE 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Create a policy that allows authenticated users to delete contact messages
-- (in case admins need to clean up spam or processed messages)
CREATE POLICY "Allow authenticated delete on contact_messages" ON public.contact_messages
    FOR DELETE 
    USING (auth.role() = 'authenticated'); 