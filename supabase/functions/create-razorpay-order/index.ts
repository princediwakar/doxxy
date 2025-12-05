import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Define types for strict type checking
interface CreateOrderRequest {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
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
    // 1. Environment Validation
    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error('Missing Razorpay credentials')
      throw new Error('Server misconfiguration: Credentials missing')
    }

    // 2. Request Validation
    let body: CreateOrderRequest;
    try {
      body = await req.json()
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body', details: e instanceof Error ? e.message : 'Unknown' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { amount, currency, receipt, notes } = body

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      throw new Error('Invalid amount: must be a positive number')
    }
    if (!currency || typeof currency !== 'string') {
      throw new Error('Invalid currency')
    }
    if (!receipt || typeof receipt !== 'string') {
      throw new Error('Invalid receipt ID')
    }

    // 3. Razorpay API Logic
    // Convert to minor units (paise) safely to avoid floating point errors
    const amountInPaise = Math.round(amount * 100)

    const payload = {
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      receipt,
      notes: notes || {},
      payment_capture: 1 // Auto-capture payments
    }

    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.text()
      console.error('Razorpay API Error:', errorData)
      throw new Error(`Razorpay API Error: ${razorpayResponse.statusText}`)
    }

    const orderData = await razorpayResponse.json()

    return new Response(JSON.stringify({ order: orderData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error in create-razorpay-order:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal Server Error' 
      }),
      {
        status: 400, // Returning 400 so client knows it's a logic/config error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})