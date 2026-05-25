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
        from: 'Doxxy Team <team@doxxy.in>',
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
          is_active: false,
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
        html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;background:#f8fafc">
          <div style="background:#fff;border-radius:8px;overflow:hidden;margin:20px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1)">
            <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px;text-align:center">
              <h1 style="margin:0;font-size:26px;font-weight:700;color:#fff">You've Been Added!</h1>
              <p style="margin:8px 0 0;font-size:15px;color:#e0e7ff">Welcome to ${clinic.name} on Doxxy</p>
            </div>
            <div style="padding:32px">
              <p style="font-size:15px;color:#374151;margin:0 0 16px"><strong>Hello ${memberData.name},</strong></p>
              <p style="font-size:15px;color:#374151;margin:0 0 16px">You've been added as <strong>${memberData.role}</strong> to <strong>${clinic.name}</strong> on Doxxy — the modern clinic management platform for healthcare professionals.</p>
              ${memberData.role === 'doctor'
                ? '<div style="background:#f0fdf4;border-left:3px solid #16a34a;padding:14px 18px;border-radius:0 6px 6px 0;margin:20px 0"><p style="font-size:14px;color:#166534;margin:0"><strong>Doctor setup:</strong> After logging in, complete your medical profile — specialization, consultation fee, and department — from the Profile page to start seeing patients.</p></div>'
                : ''}
              <div style="text-align:center;margin:28px 0">
                <a href="${loginUrl}" style="background:#2563eb;color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;box-shadow:0 4px 6px -1px rgba(37,99,235,0.3)">Log in to Doxxy</a>
              </div>
              <p style="font-size:13px;color:#6b7280;text-align:center;margin:0">Use your existing account — no new sign-up needed.</p>
              <div style="border-top:1px solid #e2e8f0;padding-top:20px;margin-top:28px">
                <p style="font-size:12px;color:#9ca3af;margin:0">You're receiving this email because an administrator added you to ${clinic.name} on Doxxy. If this was unexpected, you can safely ignore it.</p>
              </div>
            </div>
            <div style="background:#f1f5f9;padding:16px;text-align:center;border-radius:0 0 8px 8px">
              <p style="font-size:11px;color:#9ca3af;margin:0">Powered by <strong>Doxxy</strong> — Modern Clinic Management</p>
            </div>
          </div>
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
    // SCENARIO B: New user — send invitation email via Resend
    // =================================================================
    console.log(`User ${cleanEmail} does not exist. Sending invitation via Resend...`)

    const inviteEmailSent = await sendResendEmail({
      to: cleanEmail,
      subject: `You're invited to join ${clinic.name} on Doxxy`,
      html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;background:#f8fafc">
        <div style="background:#fff;border-radius:8px;overflow:hidden;margin:20px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1)">
          <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px;text-align:center">
            <h1 style="margin:0;font-size:26px;font-weight:700;color:#fff">You're Invited!</h1>
            <p style="margin:8px 0 0;font-size:15px;color:#e0e7ff">Join ${clinic.name} on Doxxy</p>
          </div>
          <div style="padding:32px">
            <p style="font-size:15px;color:#374151;margin:0 0 16px"><strong>Hello ${memberData.name},</strong></p>
            <p style="font-size:15px;color:#374151;margin:0 0 16px">You've been invited to join <strong>${clinic.name}</strong> as a <strong>${memberData.role}</strong> on Doxxy — the modern clinic management platform for healthcare professionals.</p>
            <div style="background:#f8fafc;border-radius:8px;padding:20px;margin:20px 0">
              <h2 style="color:#1e293b;margin:0 0 12px;font-size:15px;font-weight:600">What's next?</h2>
              <ol style="color:#475569;margin:0;padding-left:20px;font-size:14px;line-height:1.8">
                <li>Click the button below to accept your invitation</li>
                <li>Sign in or create your account</li>
                <li>Complete your profile setup</li>
                <li>Start using Doxxy!</li>
              </ol>
            </div>
            <div style="text-align:center;margin:28px 0">
              <a href="${invitationLink}" style="background:#2563eb;color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;box-shadow:0 4px 6px -1px rgba(37,99,235,0.3)">Accept Invitation</a>
            </div>
            <p style="font-size:13px;color:#6b7280;text-align:center;margin:0">This invitation expires in 7 days.</p>
            <div style="border-top:1px solid #e2e8f0;padding-top:20px;margin-top:28px">
              <p style="font-size:12px;color:#9ca3af;margin:0 0 6px"><strong>Button not working?</strong> Copy and paste this link:</p>
              <p style="font-size:12px;color:#2563eb;word-break:break-all;margin:0">${invitationLink}</p>
            </div>
            <div style="border-top:1px solid #e2e8f0;padding-top:16px;margin-top:20px">
              <p style="font-size:11px;color:#9ca3af;margin:0">If you didn't expect this invitation, you can safely ignore this email.</p>
            </div>
          </div>
          <div style="background:#f1f5f9;padding:16px;text-align:center;border-radius:0 0 8px 8px">
            <p style="font-size:11px;color:#9ca3af;margin:0">Powered by <strong>Doxxy</strong> — Modern Clinic Management</p>
          </div>
        </div>
      </div>`,
    })

    return new Response(JSON.stringify({
      success: true,
      message: inviteEmailSent
        ? 'Invitation email sent.'
        : 'Invitation created. Email could not be sent — share the link below.',
      invitationLink: inviteEmailSent ? null : invitationLink,
      emailSent: inviteEmailSent,
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('Invitation error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
