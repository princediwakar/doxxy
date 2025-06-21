// supabase/functions/invite-member/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

console.log("invite-member function invoked");

serve(async (req) => {
  // Define CORS headers - IMPORTANT: In production, restrict origin to your actual frontend domain
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Allow any origin for development. Change this in production!
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS', // Add methods you allow
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204, // No content, successful OPTIONS request
      headers: corsHeaders,
    });
  }

  // Get the Supabase URL and Service Role Key from environment variables/secrets
  const supabaseUrl = Deno.env.get('PROJECT_URL');
  const supabaseServiceRoleKey = Deno.env.get('SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Required environment variables (PROJECT_URL or SERVICE_ROLE_KEY) not set.');
    return new Response(JSON.stringify({ error: 'Missing environment variables.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  // Create a Supabase client with the service role key
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }, // Include CORS headers
    });
  }

  try {
    // Expect email, name, clinic_id, role, and department_id in the request body
    let body;
    try {
      body = await req.json();
      console.log('Parsed request body:', body);
    } catch (jsonError) {
      console.error('Error parsing request body as JSON:', jsonError);
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const { email, name, clinic_id, role, department_id } = body;

    // Only require email, clinic_id, and role (name is optional)
    if (!email || !clinic_id || !role) {
      return new Response(JSON.stringify({ error: 'Email, clinic_id, and role are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // 0. Check if user already exists in auth.users using Admin API
    let invitedUserId;
    let userJustInvited = false;

    // Attempt to invite the user first. If they already exist, inviteUserByEmail will return an error.
    console.log(`Attempting to invite user with email: ${email}`);
    // Set user_metadata.name for new users
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, { data: { name } });

    if (inviteError) {
      // Check if the error is because the user already exists
      if (inviteError.message.includes('User already exists') || inviteError.status === 400) { // Supabase sometimes returns 400 for this
        console.log('Invite failed because user already exists.');

        // User already exists, find their ID by email using listUsers (without email filter in params)
        console.log(`User already exists. Searching auth.users for ID for email: ${email}`);
        const { data: userList, error: listUsersError } = await supabaseAdmin.auth.admin.listUsers(); // No email filter in params

    if (listUsersError) {
          console.error('Error listing users after invite error:', listUsersError.message);
          return new Response(JSON.stringify({ error: `Failed to find existing user ID: ${listUsersError.message}` }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        // Manually find the user by email in the returned list
        const existingUser = userList?.users?.find(user => user.email === email);

        if (existingUser) {
          invitedUserId = existingUser.id;
          console.log('Found existing user ID from listUsers:', invitedUserId);
          userJustInvited = false; // User was not just invited
        } else {
          // This case is unexpected: inviteUserByEmail said user exists, but couldn't find in listUsers
          console.error('User exists according to invite, but not found in listUsers result.');
          return new Response(JSON.stringify({ error: 'Failed to find existing user ID after invite error.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    } else {
        // Handle other invitation errors
        console.error('Error inviting new user:', inviteError.message);
        return new Response(JSON.stringify({ error: `Failed to invite user: ${inviteError.message}` }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    } else if (inviteData?.user?.id) {
      // User invited successfully (this path is for truly new users)
      invitedUserId = inviteData.user.id;
      console.log('New user invited successfully. Assigned user ID:', invitedUserId);
      userJustInvited = true; // User was just invited
    } else {
       // Should not happen if no inviteError, but as a safeguard
       console.error('Invite operation succeeded but no user ID returned.', inviteData);
       return new Response(JSON.stringify({ error: 'Invitation failed: Could not get user ID.' }), {
         status: 500,
         headers: { 'Content-Type': 'application/json', ...corsHeaders },
       });
    }

    // At this point, invitedUserId should be reliably set for both new and existing users
    console.log('Final invitedUserId before database operations:', invitedUserId);
    if (!invitedUserId) {
      // This check is a safeguard, should be caught earlier
      console.error('invitedUserId is null or undefined after lookup/invite process.');
      return new Response(JSON.stringify({ error: 'Internal error: Could not determine user ID.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Now, with a reliable invitedUserId, proceed with database operations:

    // 2. Check if this user is already a member of the target clinic
    // This check is needed *after* getting the user ID, for both new and existing users.
    console.log(`Checking if user ID ${invitedUserId} is already a member of clinic ${clinic_id}.`);
     const { data: memberData, error: memberCheckError } = await supabaseAdmin
       .from('clinic_members')
       .select('id')
       .eq('clinic_id', clinic_id) // Use clinic_id from the request body
       .eq('user_id', invitedUserId)
       .maybeSingle(); // Use maybeSingle() to avoid error if no row found

     if (memberCheckError) {
        console.error('Error checking for existing clinic member (after getting user ID):', memberCheckError.message);
        return new Response(JSON.stringify({ error: `Failed to check clinic membership: ${memberCheckError.message}` }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
     }

     if (memberData) {
         // User is already a member of this clinic. Return success with warning.
         console.log(`User ID ${invitedUserId} is already a member of clinic ${clinic_id}. Returning success with warning.`);
          return new Response(JSON.stringify({
              success: true, // Indicate success as no action needed (already member)
              userId: invitedUserId,
              warning: `User with email ${email} is already a member of this clinic.`, // Keep the warning
          }), {
              status: 200,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
     }

    // If we reach here, the user exists in auth.users (or was just invited) and is NOT a member of the target clinic.
    console.log(`User ID ${invitedUserId} is not a member of clinic ${clinic_id}. Proceeding to add entries and clinic member.`);

    // 3. Create or update doctor entry ONLY if the role is 'doctor'
    let doctorDataResponse = null;
    if (role === 'doctor') {
    // Only set name if provided; otherwise, let it be null (users will complete profile later)
    const doctorData = {
      id: invitedUserId,
      user_id: invitedUserId,
      clinic_id: clinic_id,
      name: name || null, // Only set if provided
      email: body.email || null,
      phone: body.phone || null,
      availability: body.availability || null,
      bio: body.bio || null,
    };

    console.log("InviteDoctor: Preparing to insert into doctors:", doctorData);
      const { data: doctorResponse, error: doctorError } = await supabaseAdmin
      .from('doctors')
      .insert([doctorData])
      .select()
      .single();

      console.log("InviteDoctor: Result of doctors insert - data:", doctorResponse, "error:", doctorError);

    if (doctorError) {
      console.error("InviteDoctor: Error inserting into doctors table:", doctorError);
        return new Response(JSON.stringify({
          success: false,
          userId: invitedUserId,
          error: `Failed to create doctor entry: ${doctorError.message}`
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      } else if (!doctorResponse) {
        console.warn("InviteDoctor: Doctors insert succeeded but no data returned.");
      } else {
          console.log("InviteDoctor: Successfully inserted doctor with ID:", doctorResponse.id);
          doctorDataResponse = doctorResponse;
      }
    } else {
      console.log(`Role is '${role}', skipping doctor table entry creation.`);
    }

    // 4. Create or update profile entry using the user ID
    // Only set name if provided; otherwise, let it be null (users will complete profile later)
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert([{ 
        id: invitedUserId, 
        name: name || null, 
        email, 
        phone: body.phone || null 
      }], { onConflict: 'id' })
      .select()
      .single();

    console.log('invite-member: Profile entry upsert result:', profileData, 'Error:', profileError);
    if (profileError) {
      console.error('invite-member: Error upserting profile entry:', profileError);
      console.error('Error creating or updating profile entry:', profileError.message);
      return new Response(JSON.stringify({
        success: false,
        userId: invitedUserId,
        doctor: doctorDataResponse, // Include doctor data even if profile fails, for debugging
        error: `Failed to create or update profile entry: ${profileError.message}`
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // 5. Add user to clinic_members using RPC
    console.log('Calling add_clinic_member RPC with:');
    console.log('  new_user_id:', invitedUserId);
    console.log('  target_clinic_id:', clinic_id);
    console.log('  new_role', role);
    console.log('  new_department_id:', department_id);

    console.log('invite-member: Executing add_clinic_member RPC.');
    try {
        const { error: addMemberError } = await supabaseAdmin.rpc('add_clinic_member', {
            new_user_id: invitedUserId,
            target_clinic_id: clinic_id,
            new_role: role,
            new_department_id: department_id,
        });

        if (addMemberError) {
            console.error('invite-member: Error adding clinic member via RPC:', addMemberError);
            console.error('invite-member: add_clinic_member RPC failed.', addMemberError);
            // Check for "duplicate key" error (23505) explicitly, though the earlier check should prevent this path
            if (addMemberError.code === '23505') {
                 console.warn(`RPC add_clinic_member hit duplicate key for user ${email} (ID: ${invitedUserId}) in clinic ${clinic_id}. This should have been caught by the earlier check.`);
                 // Even if RPC hits duplicate, we can still return success if upserts worked
                  return new Response(JSON.stringify({
                     success: true, // Indicate success as upserts likely worked and user was already member
                     userId: invitedUserId,
                     doctor: doctorDataResponse,
                     profile: profileData,
                     userJustInvited: userJustInvited,
                     warning: `User with email ${email} is already a member of this clinic.`, // Keep the warning
                 }), {
                     status: 200,
                     headers: { 'Content-Type': 'application/json', ...corsHeaders },
                 });
            }
            // For any other RPC error, return 500
            return new Response(JSON.stringify({ error: `Failed to add clinic member: ${addMemberError.message}` }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        }

        console.log('Clinic member added successfully.');
        console.log('invite-member: add_clinic_member RPC successful.');

        // 6. Return final success response (doctor will be null for non-doctor roles)
        const responseData: any = { 
          success: true, 
          userId: invitedUserId, 
          profile: profileData, 
          userJustInvited 
        };
        
        // Only include doctor data if the user was assigned the doctor role
        if (role === 'doctor' && doctorDataResponse) {
          responseData.doctor = doctorDataResponse;
        }
        
        return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
        console.error('invite-member: Uncaught error during add_clinic_member RPC call:', error);
        return new Response(JSON.stringify({ error: 'Internal server error during clinic member add' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

  } catch (error) {
    console.error('invite-member: Internal server error in invite-member function (main catch):', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});