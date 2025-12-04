import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Define interfaces for type safety
interface OrderRequest {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Validate Environment Variables
    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error('Missing Razorpay credentials')
      throw new Error('Server misconfiguration: Credentials missing')
    }

    // 2. Parse and Validate Request Body
    let body: OrderRequest;
    try {
      body = await req.json()
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { amount, currency, receipt, notes } = body

    // Strict input validation
    if (typeof amount !== 'number' || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Amount must be a positive number' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!currency || typeof currency !== 'string') {
      return new Response(JSON.stringify({ error: 'Currency is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!receipt || typeof receipt !== 'string') {
      return new Response(JSON.stringify({ error: 'Receipt ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Prepare Razorpay Payload
    // CRITICAL: Math.round prevents floating point errors (e.g. 19.99 * 100 = 1998.99999)
    const amountInPaise = Math.round(amount * 100)
    
    const razorpayOrderPayload = {
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      receipt,
      notes: notes || {}
    }

    console.log(`Creating order for ${amount} ${currency} (Receipt: ${receipt})`)

    // 4. Call Razorpay API
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)
    
    const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(razorpayOrderPayload),
    })

    if (!razorpayRes.ok) {
      const errorData = await razorpayRes.text()
      console.error('Razorpay API Error:', errorData)
      return new Response(JSON.stringify({ 
        error: 'Failed to create order with payment provider',
        details: errorData 
      }), {
        status: 502, // Bad Gateway (upstream error)
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const orderData: RazorpayOrderResponse = await razorpayRes.json()

    // 5. Success Response
    return new Response(JSON.stringify({ order: orderData }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Unexpected error in create-razorpay-order:', error)
    
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})