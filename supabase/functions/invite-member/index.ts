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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(memberData.email)) {
      throw new Error(`Invalid email format: ${memberData.email}`)
    }

    // Verify Authentication (User or Service Role)
    let user: { id: string; email?: string } | null = null;
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader) {
      try {
        const { data: { user: authUser }, error } = await supabaseClient.auth.getUser()
        if (!error && authUser) user = authUser;
      } catch (e) {
        console.log('JWT verification failed, checking permissions...');
      }
    }

    if (!user && !authHeader) {
      throw new Error('Not authenticated')
    }

    // Generate token
    const invitationToken = crypto.randomUUID()

    // 1. Create Pending Invitation Record
    let invitation: InvitationRecord
    const { data: inviteData, error: inviteError } = await supabaseClient
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
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (inviteError) throw new Error(`Failed to create invitation record: ${inviteError.message}`)
    invitation = inviteData as InvitationRecord

    // Get clinic info
    const { data: clinic, error: clinicError } = await supabaseClient
      .from('clinics')
      .select('name')
      .eq('id', memberData.clinic_id)
      .single()

    if (clinicError) throw new Error('Failed to get clinic information')

    // Check if user exists (Admin level check)
    let existingUser = null
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers()
    if (userList?.users) {
      existingUser = userList.users.find(u => u.email?.toLowerCase() === memberData.email.toLowerCase())
    }

    // --- FIX 1: Robust Site URL ---
    // Make sure you set 'FRONTEND_URL' in your Supabase Edge Function secrets
    // e.g. supabase secrets set FRONTEND_URL="http://localhost:3000" (or your production URL)
    const siteUrl = Deno.env.get('FRONTEND_URL') || Deno.env.get('SITE_URL') || 'http://localhost:3000';
    
    // We add the token to the URL so the frontend can capture it in localStorage
    const redirectUrl = `${siteUrl}/auth?token=${invitation.invitation_token}&type=invite`

    // --- SCENARIO A: Existing User ---
    if (existingUser) {
      console.log('Processing existing user...')
      
      // Check if already member
      const { data: existingMembership } = await supabaseClient
        .from('clinic_members')
        .select('id')
        .eq('user_id', existingUser.id)
        .eq('clinic_id', memberData.clinic_id)
        .single()

      if (existingMembership) {
        return new Response(
          JSON.stringify({ success: false, error: 'User is already a member of this clinic' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Add to clinic directly
      const { error: membershipError } = await supabaseClient
        .from('clinic_members')
        .insert({
          user_id: existingUser.id,
          clinic_id: memberData.clinic_id,
          role: memberData.role,
          department_id: memberData.department_id || null
        })

      if (membershipError) throw new Error('Failed to create clinic membership')

      // --- FIX 2: Mark invitation as accepted immediately ---
      // Since we auto-added them, we close the invitation loop so it doesn't stay "pending"
      await supabaseClient
        .from('pending_invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Existing user added to clinic. No email sent (not implemented).',
          existingUser: true
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // --- SCENARIO B: New User ---
    // --- FIX 3: Pass Phone and Token in Metadata ---
    const { data: inviteAuthData, error: authInviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      memberData.email,
      {
        redirectTo: redirectUrl,
        data: {
          name: memberData.name,
          phone: memberData.phone, // Pass phone so it prefills in profile
          clinic_id: memberData.clinic_id,
          clinic_name: clinic.name,
          role: memberData.role,
          invitation_token: invitation.invitation_token // Redundancy
        }
      }
    )

    if (authInviteError) throw new Error(`Supabase invitation failed: ${authInviteError.message}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invitation sent successfully via Supabase',
        existingUser: false
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})