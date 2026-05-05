'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/integrations/supabase/server';

export async function createRazorpayOrder(params: {
  clinicId: string;
  packageId: string;
  amount: number;
  credits: number;
}) {
  const supabase = await createServerSupabase();
  const { clinicId, packageId, amount, credits } = params;

  const { data: transaction, error: txError } = await supabase
    .from('payment_transactions')
    .insert({
      clinic_id: clinicId,
      transaction_type: 'credit_purchase',
      amount,
      currency: 'INR',
      credits_purchased: credits,
      payment_status: 'pending',
      metadata: { package_id: packageId },
    })
    .select()
    .single();

  if (txError) return { error: txError.message };

  const { data: orderResponse, error: fnError } = await supabase.functions.invoke(
    'create-razorpay-order',
    {
      body: {
        amount,
        currency: 'INR',
        receipt: `rcpt_${transaction.id.slice(0, 8)}`,
        notes: {
          clinic_id: clinicId,
          transaction_id: transaction.id,
          credits: credits.toString(),
        },
      },
    },
  );

  if (fnError || !orderResponse?.order) {
    return { error: fnError?.message || 'Failed to init payment gateway' };
  }

  await supabase
    .from('payment_transactions')
    .update({ razorpay_order_id: orderResponse.order.id })
    .eq('id', transaction.id);

  return { success: true, transaction, order: orderResponse.order };
}

export async function processPaymentSuccess(params: {
  transactionId: string;
  paymentId: string;
  signature: string;
}) {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
    body: {
      transaction_id: params.transactionId,
      razorpay_payment_id: params.paymentId,
      razorpay_signature: params.signature,
    },
  });

  if (error) return { error: error.message };
  if (data?.error) return { error: data.error as string };

  revalidatePath('/clinic/payments');
  return { success: true, data };
}
