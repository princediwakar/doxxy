import { cache } from 'react';
import { createServerSupabase } from '@/integrations/supabase/server';

export const getBillingSummary = cache(async (clinicId: string) => {
  const supabase = await createServerSupabase();

  const { data: clinicCredits, error: clinicError } = await supabase
    .from('clinic_credits')
    .select('*')
    .eq('clinic_id', clinicId)
    .maybeSingle();

  if (clinicError) throw new Error(clinicError.message);

  const { count: pendingCount, error: countError } = await supabase
    .from('payment_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .eq('payment_status', 'pending');

  if (countError) throw new Error(countError.message);

  return {
    credit_balance: clinicCredits?.credit_balance || 0,
    total_credits_purchased: clinicCredits?.total_credits_purchased || 0,
    total_credits_used: clinicCredits?.total_credits_used || 0,
    pending_payments_count: pendingCount || 0,
  };
});

export const getPaymentTransactions = cache(async (clinicId: string) => {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return data || [];
});
