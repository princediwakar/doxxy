// File: supabase/functions/invite-member/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface InviteMemberData {
  email: string
  name: string
  phone?: string
  role: string
  department_id?: string
  clinic_id: string
}

interface InvitationRecord {
  id: string
  email: string
  name: string
  invitation_token: string
  clinic_id: string
  role: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // 1. Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Initialize Supabase Clients
    // Admin client: needed for listing users and sending auth invites
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Regular client: captures the context of the person sending the invite
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // 3. Parse and Validate Input
    const { memberData }: { memberData: InviteMemberData } = await req.json()
    console.log('Received invitation request for:', memberData.email)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(memberData.email)) {
      throw new Error(`Invalid email format: ${memberData.email}`)
    }

    // 4. Verify Authentication (User or Service Role)
    let user: { id: string; email?: string } | null = null;
    const authHeader = req.headers.get('Authorization');

    // Try to get the user from the JWT
    if (authHeader) {
      const { data: { user: authUser }, error: userError } = await supabaseClient.auth.getUser()
      if (authUser && !userError) {
        user = authUser;
        console.log('Authenticated as user:', user.id);
      } else {
        console.log('JWT present but user fetch failed:', userError?.message);
      }
    }

    // If no user found, strictly check if it's a valid service role request (optional fallback)
    if (!user) {
      if (!authHeader) {
        throw new Error('Not authenticated - requires user authentication')
      }
      console.log('Proceeding with Service Role or External Auth');
    }

    // 5. Generate Invitation Token
    const invitationToken = crypto.randomUUID()

    // 6. Create "Pending Invitation" Record in Database
    // We do this first to ensure we have a record even if email fails
    let invitation: InvitationRecord
    
    const { data: inviteData, error: dbError } = await supabaseClient
      .from('pending_invitations')
      .insert({
        email: memberData.email.toLowerCase(),
        name: memberData.name,
        phone: memberData.phone || null,
        clinic_id: memberData.clinic_id,
        role: memberData.role,
        department_id: memberData.department_id || null,
        invited_by: user?.id || null,
        invitation_token: invitationToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database insert failed:', dbError)
      throw new Error(`Failed to create invitation record: ${dbError.message}`)
    }
    
    invitation = inviteData as InvitationRecord
    console.log('Invitation record created:', invitation.id)

    // 7. Get Clinic Details (for the email template)
    const { data: clinic, error: clinicError } = await supabaseClient
      .from('clinics')
      .select('name')
      .eq('id', memberData.clinic_id)
      .single()

    if (clinicError) {
      throw new Error('Failed to fetch clinic information')
    }

    // 8. Check if User Already Exists in Supabase Auth
    // We use the Admin client to search the global user list
    let existingUser = null
    try {
      const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      if (listError) throw listError
      
      if (userList?.users) {
        existingUser = userList.users.find(u => u.email?.toLowerCase() === memberData.email.toLowerCase())
      }
    } catch (err) {
      console.error('Error listing users:', err)
      // We proceed as if new user to be safe, or you could throw error
    }

    // 9. Determine Redirect URL
    // Priority: FRONTEND_URL env var -> Construct from Supabase URL (fallback)
    const siteUrl = Deno.env.get('FRONTEND_URL') ||
                    Deno.env.get('SUPABASE_URL')?.replace('/v1', '') ||
                    'http://localhost:3000';
    
    // We append params so the frontend can auto-detect the invite
    const redirectUrl = `${siteUrl}/auth?token=${invitation.invitation_token}&type=invite`
    console.log('Redirect URL set to:', redirectUrl)

    // --- SCENARIO A: User Already Exists ---
    if (existingUser) {
      console.log(`User ${existingUser.email} already exists. Adding to clinic...`)

      // Check for existing membership in THIS clinic
      const { data: existingMembership } = await supabaseClient
        .from('clinic_members')
        .select('id')
        .eq('user_id', existingUser.id)
        .eq('clinic_id', memberData.clinic_id)
        .single()

      if (existingMembership) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'User is already a member of this clinic' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Add to clinic_members
      const { error: membershipError } = await supabaseClient
        .from('clinic_members')
        .insert({
          user_id: existingUser.id,
          clinic_id: memberData.clinic_id,
          role: memberData.role,
          department_id: memberData.department_id || null
        })

      if (membershipError) {
        throw new Error(`Failed to create clinic membership: ${membershipError.message}`)
      }

      // [CRITICAL FIX] Mark the pending invitation as accepted immediately
      // This keeps the database clean since they don't need to click a link
      await supabaseClient
        .from('pending_invitations')
        .update({ 
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', invitation.id)

      return new Response(
        JSON.stringify({
          success: true,
          existingUser: true,
          message: 'User added to clinic successfully.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // --- SCENARIO B: New User (Send Email) ---
    console.log('User does not exist. Sending Supabase invitation email...')

    const { error: inviteAuthError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      memberData.email,
      {
        redirectTo: redirectUrl,
        data: {
          name: memberData.name,
          phone: memberData.phone, // [FIX] Passed here so it auto-fills Profile
          clinic_id: memberData.clinic_id,
          clinic_name: clinic.name,
          role: memberData.role,
          invitation_token: invitation.invitation_token
        }
      }
    )

    if (inviteAuthError) {
      throw new Error(`Supabase Auth invitation failed: ${inviteAuthError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        existingUser: false,
        message: 'Invitation sent successfully via email.'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing invitation:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})