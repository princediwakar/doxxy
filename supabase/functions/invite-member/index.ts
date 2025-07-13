import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("invite-member function invoked");

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method Not Allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log('Request body:', JSON.stringify(body, null, 2));
    } catch (error) {
      console.error('Invalid JSON in request body:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const { email, name, clinic_id, role, department_id, phone, availability, bio } = body;

    // Basic validation
    if (!email || !clinic_id || !role) {
      console.error('Missing required fields: email, clinic_id, role');
      return new Response(
        JSON.stringify({ error: 'Email, clinic_id, and role are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error(`Invalid email format: ${email}`);
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Validate role
    const validRoles = ['doctor', 'staff', 'superadmin'];
    if (!validRoles.includes(role)) {
      console.error(`Invalid role: ${role}`);
      return new Response(
        JSON.stringify({ error: `Invalid role: ${role}` }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Create Supabase client with admin privileges
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    console.log(`Processing invitation for ${email} as ${role} in clinic ${clinic_id}`);

    // Step 1: Invite the user by email, which creates an auth.users entry but doesn't send an email if the user already exists.
    console.log(`Attempting to invite user: ${email}`);
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      email.toLowerCase(),
      {
        data: {
          name: name || email.split('@')[0],
          full_name: name || email.split('@')[0],
          email: email.toLowerCase(),
          invited_at: new Date().toISOString(),
          clinic_id: clinic_id,
          role: role
        }
      }
    );

    if (inviteError) {
      // If the error is that the user is already registered, it's not a fatal error.
      // We can proceed to add them to the clinic.
      if (inviteError.message.includes('User is already registered')) {
        console.log(`User ${email} is already registered. Proceeding to add to clinic.`);
      } else {
        console.error('Error inviting user:', inviteError);
        return new Response(
          JSON.stringify({ error: `Failed to invite user: ${inviteError.message}` }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
    } else {
      console.log('User invited successfully (or was already invited).');
    }

    // Step 2: Use RPC to handle all database operations
    // This function will create the profile, clinic_member, and doctor records.
    const { data: rpcResult, error: rpcError } = await supabase.rpc('invite_and_add_member', {
      p_email: email.toLowerCase(),
      p_name: name || email.split('@')[0],
      p_phone: phone || null,
      p_clinic_id: clinic_id,
      p_role: role,
      p_department_id: department_id === 'no-department' ? null : department_id,
      p_availability: availability || null,
      p_bio: bio || null,
    });

    if (rpcError) {
      console.error('RPC invite_and_add_member failed:', rpcError);
      return new Response(
        JSON.stringify({ 
          error: `Database operation failed: ${rpcError.message}`,
          code: rpcError.code 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('RPC Result:', JSON.stringify(rpcResult, null, 2));

    // Step 3: Return comprehensive result
    const response = {
      success: true,
      user_id: rpcResult.user_id,
      profile: rpcResult.profile,
      clinic_member: rpcResult.clinic_member,
      doctor: rpcResult.doctor,
      message: rpcResult.message,
    };

    console.log('Final response:', JSON.stringify(response, null, 2));

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: `Internal server error: ${error.message}` 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
