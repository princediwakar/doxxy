import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface ContactFormData {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  city?: string
  message: string
  created_at: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { record } = await req.json() as { record: ContactFormData }

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const emailSubject = `New Contact Form Submission - ${record.name}`
    
    const emailHtml = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;background:#f8fafc">
        <div style="background:#fff;border-radius:8px;overflow:hidden;margin:20px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1)">
          <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px;text-align:center">
            <h1 style="margin:0;font-size:24px;font-weight:700;color:#fff">New Contact Form Submission</h1>
            <p style="margin:8px 0 0;font-size:14px;color:#e0e7ff">${record.name} — ${new Date(record.created_at).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
          </div>
          <div style="padding:32px">
            <div style="background:#f8fafc;border-radius:8px;padding:20px;margin:0 0 20px">
              <table style="width:100%;border-collapse:collapse;font-size:14px">
                <tr><td style="padding:6px 12px 6px 0;color:#6b7280;white-space:nowrap;vertical-align:top"><strong>Name</strong></td><td style="padding:6px 0;color:#1e293b">${record.name}</td></tr>
                <tr><td style="padding:6px 12px 6px 0;color:#6b7280;white-space:nowrap;vertical-align:top"><strong>Email</strong></td><td style="padding:6px 0;color:#1e293b"><a href="mailto:${record.email}" style="color:#2563eb">${record.email}</a></td></tr>
                <tr><td style="padding:6px 12px 6px 0;color:#6b7280;white-space:nowrap;vertical-align:top"><strong>Phone</strong></td><td style="padding:6px 0;color:#1e293b">${record.phone || '—'}</td></tr>
                <tr><td style="padding:6px 12px 6px 0;color:#6b7280;white-space:nowrap;vertical-align:top"><strong>Company</strong></td><td style="padding:6px 0;color:#1e293b">${record.company || '—'}</td></tr>
                <tr><td style="padding:6px 12px 6px 0;color:#6b7280;white-space:nowrap;vertical-align:top"><strong>City</strong></td><td style="padding:6px 0;color:#1e293b">${record.city || '—'}</td></tr>
              </table>
            </div>
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:20px">
              <h3 style="color:#1e293b;margin:0 0 12px;font-size:15px;font-weight:600">Message</h3>
              <p style="white-space:pre-wrap;line-height:1.6;font-size:14px;color:#374151;margin:0">${record.message}</p>
            </div>
          </div>
          <div style="background:#f1f5f9;padding:16px;text-align:center;border-radius:0 0 8px 8px">
            <p style="font-size:11px;color:#9ca3af;margin:0">Auto-generated from the <strong>Doxxy</strong> contact form</p>
          </div>
        </div>
      </div>
    `

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Doxxy Team <team@doxxy.in>',
        to: ['doxxyapp@gmail.com', 'princediwakar25@gmail.com'],
        subject: emailSubject,
        html: emailHtml,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Failed to send email:', result)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: result }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Email sent successfully:', result)

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in send-contact-email function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 