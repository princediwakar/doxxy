import { createClient } from '@/integrations/supabase/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return new Response(
        JSON.stringify({ 
          error: { message: 'Name, email, and message are required' } 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient();
    
    // Call the RPC function to submit the contact form
    const { data, error } = await supabase.rpc('submit_contact_form', {
      name: body.name,
      email: body.email,
      phone: body.phone,
      company: body.company,
      city: body.city,
      subject: body.subject,
      message: body.message,
      meeting_type: body.meeting_type
    });
    
    if (error) {
      console.error('Error submitting contact form:', error);
      return new Response(
        JSON.stringify({ error: { message: 'Failed to submit form' } }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ data: { id: data } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error processing contact form submission:', error);
    return new Response(
      JSON.stringify({ error: { message: 'Internal server error' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 