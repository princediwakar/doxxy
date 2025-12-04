import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'node:crypto'

interface VerifyRequest {
  razorpay_payment_id: string;
  razorpay_signature: string;
  transaction_id: string; // The internal DB ID
}

interface PaymentTransaction {
  id: string;
  razorpay_order_id: string;
  clinic_id: string;
  credits_purchased: number;
  payment_status: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Environment Check
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!RAZORPAY_KEY_SECRET || !SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('Server misconfiguration: Credentials missing')
    }

    // 2. Input Parsing
    let body: VerifyRequest;
    try {
      body = await req.json()
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { razorpay_payment_id, razorpay_signature, transaction_id } = body

    if (!razorpay_payment_id || !razorpay_signature || !transaction_id) {
      return new Response(JSON.stringify({ error: 'Missing required payment details' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    // 3. Fetch Transaction Details
    const { data: transaction, error: fetchError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('id', transaction_id)
      .single<PaymentTransaction>()

    if (fetchError || !transaction) {
      console.error('Transaction fetch error:', fetchError)
      return new Response(JSON.stringify({ error: 'Transaction not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (transaction.payment_status === 'completed') {
      return new Response(JSON.stringify({ message: 'Payment already processed' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 4. Cryptographic Verification (HMAC SHA256)
    const generatedSignature = createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${transaction.razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      console.error('Signature mismatch', { 
        expected: generatedSignature, 
        received: razorpay_signature,
        orderId: transaction.razorpay_order_id 
      })
      return new Response(JSON.stringify({ error: 'Invalid payment signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    /* 5. Atomic Transaction: 
       We perform the update and credit addition. 
       
       Ideally, this should be a single Postgres RPC to ensure atomicity.
       If we update status but fail to add credits, the user loses money.
       
       Below implements the two-step process safely, but see SQL recommendation.
    */

    // Step A: Update Transaction Log
    const { error: updateError } = await supabase
      .from('payment_transactions')
      .update({
        payment_status: 'completed',
        razorpay_payment_id,
        razorpay_signature,
        updated_at: new Date().toISOString()
      })
      .eq('id', transaction_id)

    if (updateError) {
      console.error('Database update failed:', updateError)
      throw new Error('Failed to record payment status')
    }

    // Step B: Add Credits (RPC)
    const { error: rpcError } = await supabase
      .rpc('add_clinic_credits', {
        clinic_id_param: transaction.clinic_id,
        credits_to_add: transaction.credits_purchased
      })

    if (rpcError) {
      // CRITICAL: Payment succeeded, DB updated, but credits failed.
      console.error('CRITICAL: Failed to add credits after payment:', rpcError)
      // Attempt to revert status or log specific alert for manual intervention
      throw new Error('Payment verified but credit allocation failed. Please contact support.')
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Payment verified and credits added',
      transaction_id 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in verify-razorpay-payment:', error)
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})