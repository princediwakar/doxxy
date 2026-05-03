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

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function sendResendEmail(args: {
  to: string
  subject: string
  html: string
}) {
  if (!RESEND_API_KEY) {
    console.log('RESEND_API_KEY not configured — skipping email')
    return false
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Doxxy Team <doxxy@neurovisionhospital.com>',
        to: [args.to],
        subject: args.subject,
        html: args.html,
      }),
    })
    if (!res.ok) {
      console.error('Resend failed:', await res.text())
      return false
    }
    console.log('Resend email sent to:', args.to)
    return true
  } catch (err) {
    console.error('Resend exception:', err)
    return false
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // --- Init clients ---
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // --- Parse input ---
    const { memberData }: { memberData: InviteMemberData } = await req.json()
    const cleanEmail = memberData.email.trim().toLowerCase()
    console.log('Invitation request for:', cleanEmail)

    if (!EMAIL_REGEX.test(cleanEmail)) {
      throw new Error(`Invalid email format: ${cleanEmail}`)
    }

    // --- Authenticate ---
    let inviter: { id: string } | null = null
    const authHeader = req.headers.get('Authorization')
    if (authHeader) {
      const { data: { user: authUser } } = await supabaseClient.auth.getUser()
      if (authUser) inviter = authUser
    }

    // --- Build URLs ---
    const siteUrl = Deno.env.get('FRONTEND_URL') ||
      Deno.env.get('SUPABASE_URL')?.replace('/v1', '') ||
      'http://localhost:3000'
    const loginUrl = `${siteUrl}/auth`

    // --- Get clinic name ---
    const { data: clinic, error: clinicError } = await supabaseClient
      .from('clinics')
      .select('name')
      .eq('id', memberData.clinic_id)
      .single()
    if (clinicError) throw new Error('Failed to fetch clinic information')

    // --- Check if user exists in auth (via profiles as proxy) ---
    let existingUserId: string | null = null
    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle()
      if (profile) existingUserId = profile.id
    } catch (err) {
      console.error('Error checking profiles:', err)
    }

    // If not found via profiles, try auth admin API
    if (!existingUserId) {
      try {
        const { data: userList } = await supabaseAdmin.auth.admin.listUsers()
        const found = userList?.users?.find(u => u.email?.toLowerCase() === cleanEmail)
        if (found) existingUserId = found.id
      } catch (err) {
        console.error('Error listing users:', err)
      }
    }

    // --- If user already exists, check if already a member ---
    if (existingUserId) {
      const { data: existingMembership } = await supabaseClient
        .from('clinic_members')
        .select('id')
        .eq('user_id', existingUserId)
        .eq('clinic_id', memberData.clinic_id)
        .maybeSingle()

      if (existingMembership) {
        return new Response(JSON.stringify({
          success: true,
          message: 'User is already a member of this clinic.',
        }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
    }

    // --- Clean up any stale invitation for this email+clinic ---
    // Must use service_role: RLS only allows service_role DELETE on pending_invitations
    await supabaseAdmin
      .from('pending_invitations')
      .delete()
      .eq('email', cleanEmail)
      .eq('clinic_id', memberData.clinic_id)

    // --- Create fresh invitation record ---
    const invitationToken = crypto.randomUUID()
    const { data: inviteData, error: dbError } = await supabaseClient
      .from('pending_invitations')
      .insert({
        email: cleanEmail,
        name: memberData.name,
        phone: memberData.phone || null,
        clinic_id: memberData.clinic_id,
        role: memberData.role,
        department_id: memberData.department_id || null,
        invited_by: inviter?.id || null,
        invitation_token: invitationToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (dbError) throw new Error(`Failed to create invitation: ${dbError.message}`)
    const invitation = inviteData as InvitationRecord
    console.log('Invitation record created:', invitation.id)

    const invitationLink = `${siteUrl}/auth?token=${invitation.invitation_token}&type=invite&email=${encodeURIComponent(cleanEmail)}`

    // =================================================================
    // SCENARIO A: User already exists — add directly, notify via Resend
    // =================================================================
    if (existingUserId) {
      console.log(`User ${cleanEmail} exists (id: ${existingUserId}). Adding to clinic...`)

      await supabaseClient.from('clinic_members').insert({
        user_id: existingUserId,
        clinic_id: memberData.clinic_id,
        role: memberData.role,
        department_id: memberData.department_id || null,
      })

      if (memberData.role === 'doctor') {
        const { error: doctorError } = await supabaseClient.from('doctors').insert({
          user_id: existingUserId,
          clinic_id: memberData.clinic_id,
          name: memberData.name,
          email: cleanEmail,
          phone: memberData.phone || null,
          is_active: true,
        })
        if (doctorError) {
          console.error('Doctor profile creation failed:', doctorError.message)
        }
      }

      await supabaseClient
        .from('pending_invitations')
        .update({ accepted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', invitation.id)

      const emailSent = await sendResendEmail({
        to: cleanEmail,
        subject: `You've been added to ${clinic.name} on Doxxy`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#2563eb">You've been added to ${clinic.name}</h2>
          <p>Hello ${memberData.name},</p>
          <p>You've been added as <strong>${memberData.role}</strong> to <strong>${clinic.name}</strong> on Doxxy.</p>
          <p>Log in with your existing account to get started:</p>
          <div style="text-align:center;margin:30px 0">
            <a href="${loginUrl}" style="background:#2563eb;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">Log in to Doxxy</a>
          </div>
          ${memberData.role === 'doctor' ? '<p style="color:#64748b;font-size:14px">After logging in, complete your medical profile (department, consultation fee) from the Profile page.</p>' : ''}
        </div>`,
      })

      return new Response(JSON.stringify({
        success: true,
        message: emailSent
          ? 'User added and notified via email.'
          : 'User added. Email notification unavailable — share the link manually if needed.',
        invitationLink: emailSent ? null : invitationLink,
        emailSent,
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // =================================================================
    // SCENARIO B: New user — Supabase inviteUserByEmail handles email delivery
    // =================================================================
    console.log(`User ${cleanEmail} does not exist. Sending invitation via Supabase...`)

    const { error: inviteAuthError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      cleanEmail,
      {
        redirectTo: invitationLink,
        data: {
          name: memberData.name,
          phone: memberData.phone,
          clinic_id: memberData.clinic_id,
          clinic_name: clinic.name,
          role: memberData.role,
          invitation_token: invitation.invitation_token,
        },
      }
    )
    if (inviteAuthError) {
      console.error('Supabase inviteUserByEmail failed:', inviteAuthError.message)
    }

    return new Response(JSON.stringify({
      success: true,
      message: inviteAuthError
        ? 'Invitation created. Email could not be sent — share the link below.'
        : 'Invitation email sent.',
      invitationLink: inviteAuthError ? invitationLink : null,
      emailSent: !inviteAuthError,
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('Invitation error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
