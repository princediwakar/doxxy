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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${record.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${record.email}">${record.email}</a></p>
          <p><strong>Phone:</strong> ${record.phone || 'Not provided'}</p>
          <p><strong>Company:</strong> ${record.company || 'Not provided'}</p>
          <p><strong>City:</strong> ${record.city || 'Not provided'}</p>
          <p><strong>Submitted:</strong> ${new Date(record.created_at).toLocaleString()}</p>
        </div>
        <div style="background: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h3 style="color: #1e293b; margin-top: 0;">Message:</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${record.message}</p>
        </div>
        <div style="margin-top: 20px; padding: 10px; background: #f1f5f9; border-radius: 4px; font-size: 12px; color: #64748b;">
          This email was automatically generated from the Doxxy contact form.
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