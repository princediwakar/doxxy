import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    console.log('Edge Function called with method:', req.method)
    
    const body = await req.json()
    console.log('Request body received:', JSON.stringify(body, null, 2))
    
    const { amount, currency, receipt, notes } = body
    console.log('Extracted values:', { 
      amount: amount, 
      amountType: typeof amount, 
      currency: currency, 
      currencyType: typeof currency,
      receipt: receipt, 
      receiptType: typeof receipt,
      notes: notes 
    })

    // Validate required fields with detailed logging
    console.log('Starting validation...')
    
    if (amount === undefined || amount === null) {
      console.error('Amount is undefined or null:', amount)
      throw new Error('Amount is required')
    }
    
    if (typeof amount !== 'number') {
      console.error('Amount is not a number:', { amount, type: typeof amount })
      throw new Error(`Amount must be a number, got ${typeof amount}`)
    }
    
    if (amount <= 0) {
      console.error('Amount is not positive:', amount)
      throw new Error(`Amount must be positive, got ${amount}`)
    }

    if (!currency) {
      console.error('Currency is missing:', currency)
      throw new Error('Currency is required')
    }
    
    if (typeof currency !== 'string') {
      console.error('Currency is not a string:', { currency, type: typeof currency })
      throw new Error(`Currency must be a string, got ${typeof currency}`)
    }

    if (!receipt) {
      console.error('Receipt is missing:', receipt)
      throw new Error('Receipt is required')
    }
    
    if (typeof receipt !== 'string') {
      console.error('Receipt is not a string:', { receipt, type: typeof receipt })
      throw new Error(`Receipt must be a string, got ${typeof receipt}`)
    }

    console.log('All validations passed successfully')

    // Get Razorpay credentials from environment
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    console.log('Razorpay credentials check:', { 
      hasKeyId: !!razorpayKeyId, 
      hasKeySecret: !!razorpayKeySecret,
      keyIdPrefix: razorpayKeyId?.substring(0, 8) + '...'
    })

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay credentials not found in environment')
      return new Response(
        JSON.stringify({ 
          error: 'Razorpay credentials not configured',
          details: 'Please set up Razorpay test credentials in Supabase Dashboard:\n1. Go to Supabase Dashboard → Project Settings → Edge Functions\n2. Add environment variables:\n   - RAZORPAY_KEY_ID (your test key ID starting with rzp_test_)\n   - RAZORPAY_KEY_SECRET (your test key secret)\n3. Get test credentials from https://dashboard.razorpay.com/app/keys',
          setup_required: true
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // For development, use test credentials if environment variables are not set
    const isTestMode = razorpayKeyId.startsWith('rzp_test_')
    
    if (isTestMode) {
      console.log('Using Razorpay test mode')
    }

    console.log('Using Razorpay Key ID:', razorpayKeyId)

    // Create Razorpay order
    const razorpayOrder = {
      amount: amount * 100, // Convert to paise
      currency: currency,
      receipt: receipt,
      notes: notes || {}
    }

    console.log('Creating Razorpay order:', JSON.stringify(razorpayOrder, null, 2))

    // Make API call to Razorpay
    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`)
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(razorpayOrder),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Razorpay API error:', response.status, errorText)
      throw new Error(`Razorpay API error: ${response.status} - ${errorText}`)
    }

    const order = await response.json()
    console.log('Razorpay order created successfully:', JSON.stringify(order, null, 2))

    return new Response(JSON.stringify({ order }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in create-razorpay-order:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to create Razorpay order'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}) 