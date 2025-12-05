import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

interface VerifyRequest {
  razorpay_payment_id: string;
  razorpay_signature: string;
  transaction_id: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Setup & Env Check
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!RAZORPAY_KEY_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Server misconfiguration: Missing keys')
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 2. Parse Input
    const { razorpay_payment_id, razorpay_signature, transaction_id } = await req.json() as VerifyRequest

    if (!razorpay_payment_id || !razorpay_signature || !transaction_id) {
      throw new Error('Missing required payment parameters')
    }

    // 3. Fetch Transaction Details
    const { data: transaction, error: fetchError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('id', transaction_id)
      .single()

    if (fetchError || !transaction) {
      throw new Error('Transaction record not found')
    }

    // 4. Verify Signature (HMAC SHA256)
    const generatedSignature = createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${transaction.razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      console.error('Signature Mismatch', { expected: generatedSignature, received: razorpay_signature })
      throw new Error('Invalid payment signature')
    }

    // 5. Atomic Processing (Database RPC)
    const { data: rpcResult, error: rpcError } = await supabase
      .rpc('verify_and_process_payment', {
        p_transaction_id: transaction_id,
        p_razorpay_payment_id: razorpay_payment_id,
        p_razorpay_signature: razorpay_signature,
        p_clinic_id: transaction.clinic_id,
        p_credits_purchased: transaction.credits_purchased
      })

    if (rpcError) {
      console.error('RPC Error:', rpcError)
      throw new Error(`Database processing failed: ${rpcError.message}`)
    }

    if (!rpcResult.success) {
      throw new Error(rpcResult.error || 'Payment processing failed in database')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment verified and credits added'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in verify-razorpay-payment:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown Error' 
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})