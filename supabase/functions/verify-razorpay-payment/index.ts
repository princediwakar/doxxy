import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

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
    const { razorpay_payment_id, razorpay_signature, transaction_id } = await req.json()

    // Validate required environment variables
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')

    if (!razorpayKeySecret || !razorpayKeyId) {
      console.error('Razorpay credentials not found in environment')
      throw new Error('Razorpay credentials not configured')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get transaction details
    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('id', transaction_id)
      .single()

    if (transactionError || !transaction) {
      throw new Error('Transaction not found')
    }

    // Verify Razorpay signature
    const expectedSignature = createHmac('sha256', razorpayKeySecret)
      .update(`${transaction.razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      throw new Error('Invalid payment signature')
    }

    // Update transaction status
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
      throw new Error('Failed to update transaction status')
    }

    // Add credits to clinic
    const { error: creditError } = await supabase
      .rpc('add_clinic_credits', {
        clinic_id_param: transaction.clinic_id,
        credits_to_add: transaction.credits_purchased
      })

    if (creditError) {
      throw new Error('Failed to add credits to clinic')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment verified successfully',
        transaction_id: transaction_id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in verify-razorpay-payment:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to verify payment'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}) 