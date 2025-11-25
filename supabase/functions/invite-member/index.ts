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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create admin client for user invitations
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

    // Regular client for other operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { memberData }: { memberData: InviteMemberData } = await req.json()

    console.log('Received invitation request:', memberData)

    // Validate email format before proceeding
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(memberData.email)) {
      throw new Error(`Invalid email format: ${memberData.email}`)
    }

    // Get current user - handle both JWT and service role authentication
    let user: { id: string; email?: string } | null = null;
    try {
      const { data: { user: authUser }, error: userError } = await supabaseClient.auth.getUser()
      if (authUser && !userError) {
        user = authUser;
      }
    } catch (err) {
      console.log('JWT auth failed, checking if service role:', err instanceof Error ? err.message : String(err));
    }

    // If no user from JWT, check if this is a service role request
    if (!user) {
      const authHeader = req.headers.get('Authorization');
      console.log('Auth header:', authHeader ? 'Present' : 'Missing');

      // For service role, we'll just proceed - the admin client will handle auth
      if (!authHeader) {
        throw new Error('Not authenticated - requires user authentication or service role')
      }
      console.log('Using service role authentication for admin invite')
    } else {
      console.log('Using user authentication:', user.id)
    }

    // Generate invitation token
    const invitationToken = crypto.randomUUID()

    // Try to create pending invitation record (fallback if table doesn't exist)
    let invitation: InvitationRecord
    try {
      const { data, error: inviteError } = await supabaseClient
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
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        })
        .select()
        .single()

      if (inviteError) {
        console.error('Database insert failed:', inviteError)
        throw new Error(`Failed to create invitation record: ${inviteError.message}`)
      } else {
        invitation = data as InvitationRecord
        console.log('Invitation created in database:', invitation)
      }
    } catch (error) {
      console.error('Database operation failed:', error)
      throw new Error(`Database operation failed: ${error instanceof Error ? error.message : String(error)}`)
    }

    // Get clinic information for the email
    const { data: clinic, error: clinicError } = await supabaseClient
      .from('clinics')
      .select('name')
      .eq('id', memberData.clinic_id)
      .single()

    if (clinicError) {
      console.error('Failed to get clinic info:', clinicError)
      throw new Error('Failed to get clinic information')
    }

    // Check if user already exists in Supabase Auth - MULTI-TENANT FIX
    console.log('Checking if user already exists in auth system...')
    let existingUser: { id: string; email?: string } | null | undefined = null

    try {
      const { data: existingUsers, error: userLookupError } = await supabaseAdmin.auth.admin.listUsers()

      if (userLookupError) {
        console.error('Failed to lookup existing users, proceeding as new user:', userLookupError)
        existingUser = null
      } else {
        existingUser = existingUsers.users.find((u: { id: string; email?: string }) => u.email?.toLowerCase() === memberData.email.toLowerCase())
        console.log('Existing user found via listUsers:', existingUser ? `Yes (${existingUser.id})` : 'No')
      }
    } catch (lookupError) {
      console.error('Error during user lookup, proceeding as new user:', lookupError)
      existingUser = null
    }

    // Get site URL for redirect
    const siteUrl = Deno.env.get('SITE_URL') ||
                    Deno.env.get('SUPABASE_URL')?.replace('/v1', '')
    const redirectUrl = `${siteUrl}/auth?token=${invitation.invitation_token}&email=${encodeURIComponent(memberData.email)}&action=invite`

    console.log('Using site URL:', siteUrl)
    console.log('Generated redirect URL:', redirectUrl)

    try {
      if (existingUser) {
        // User exists - handle multi-tenant invitation for existing user
        console.log('Handling invitation for EXISTING user...')

        // Check if user is already a member of this clinic
        const { data: existingMembership, error: membershipError } = await supabaseClient
          .from('clinic_members')
          .select('*')
          .eq('user_id', existingUser.id)
          .eq('clinic_id', memberData.clinic_id)
          .single()

        if (membershipError && membershipError.code !== 'PGRST116') { // PGRST116 = not found
          console.error('Error checking existing membership:', membershipError)
          throw new Error('Failed to check existing clinic membership')
        }

        if (existingMembership) {
          console.log('User is already a member of this clinic')
          return new Response(
            JSON.stringify({
              success: false,
              error: 'User is already a member of this clinic',
              existingMembership: existingMembership
            }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        // Create clinic membership for existing user
        console.log('Creating clinic membership for existing user...')
        const { data: newMembership, error: membershipCreateError } = await supabaseClient
          .from('clinic_members')
          .insert({
            user_id: existingUser.id,
            clinic_id: memberData.clinic_id,
            role: memberData.role,
            department_id: memberData.department_id || null
          })
          .select()
          .single()

        if (membershipCreateError) {
          console.error('Failed to create clinic membership:', membershipCreateError)
          throw new Error('Failed to create clinic membership')
        }

        console.log('Clinic membership created successfully:', newMembership)

        return new Response(
          JSON.stringify({
            success: true,
            invitation: invitation,
            emailSent: false, // Custom email sending would go here
            existingUser: true,
            supabaseUserId: existingUser.id,
            membershipCreated: true,
            databaseSaved: invitation.id !== invitationToken,
            message: 'Existing user added to clinic successfully! 🎉'
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )

      } else {
        // User doesn't exist - use standard Supabase invitation flow
        console.log('Sending invitation to NEW user via Supabase admin...')
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
          memberData.email,
          {
            redirectTo: redirectUrl,
            data: {
              name: memberData.name,
              clinic_id: memberData.clinic_id,
              clinic_name: clinic.name,
              role: memberData.role,
              invitation_token: invitation.invitation_token
            }
          }
        )

        if (inviteError) {
          console.error('Failed to send Supabase invitation:', inviteError)
          console.error('Full error object:', JSON.stringify(inviteError, null, 2))
          throw new Error(`Supabase invitation failed: ${inviteError.message}`)
        }

        console.log('Supabase invitation sent successfully:', inviteData)

        return new Response(
          JSON.stringify({
            success: true,
            invitation: invitation,
            emailSent: true,
            existingUser: false,
            supabaseUserId: inviteData.user?.id,
            databaseSaved: invitation.id !== invitationToken,
            message: 'Invitation sent successfully via Supabase'
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    } catch (emailError) {
      console.error('Failed to send invitation:', emailError)

      return new Response(
        JSON.stringify({
          success: true,
          invitation: invitation,
          emailSent: false,
          message: `Invitation record created but email failed: ${emailError instanceof Error ? emailError.message : String(emailError)}`
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (error) {
    console.error('Error in invite-member function:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to send invitation',
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})