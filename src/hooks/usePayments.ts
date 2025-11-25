import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

const supabase = getSupabase();

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  amount: number;
  description: string;
  popular?: boolean;
  savings?: string;
}

// Use the database type directly
export type PaymentTransaction = Database['public']['Tables']['payment_transactions']['Row'];

export interface BillingSummary {
  credit_balance: number;
  total_credits_purchased: number;
  total_credits_used: number;
  current_month_appointments: number;
  current_month_amount: number;
  pending_payments: number;
}

// Predefined credit packages
export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'Junior',
    name: 'Junior Pack',
    credits: 50,
    amount: 499,
    description: '50 appointments',
  },
  {
    id: 'Senior',
    name: 'Senior Pack',
    credits: 200,
    amount: 1999,
    description: '200 appointments',
    popular: true,
  },
  {
    id: 'Professional',
    name: 'Professional Pack',
    credits: 1000,
    amount: 9999,
    description: '1000 appointments',
    // savings: 'Save ₹1000'
  }
];

export const usePayments = () => {
  const { activeClinic } = useAuth();
  const queryClient = useQueryClient();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Fetch clinic billing summary - read from clinic_credits table
  const { data: billingSummary, isLoading: isLoadingSummary } = useQuery<BillingSummary>({
    queryKey: ['clinic-billing-summary', activeClinic?.clinic_id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id) throw new Error('No active clinic');

      // Get clinic credits from clinic_credits table
      const { data: clinicCredits, error: creditsError } = await supabase
        .from('clinic_credits')
        .select('credit_balance, total_credits_purchased, total_credits_used')
        .eq('clinic_id', activeClinic.clinic_id)
        .maybeSingle();

      if (creditsError) {
        // If clinic_credits record doesn't exist, fall back to calculation
        console.warn('Clinic credits record not found, falling back to calculation:', creditsError);

        // Get all completed credit purchases
        const { data: completedTransactions, error: transactionsError } = await supabase
          .from('payment_transactions')
          .select('credits_purchased, amount')
          .eq('clinic_id', activeClinic.clinic_id)
          .eq('transaction_type', 'credit_purchase')
          .eq('payment_status', 'completed');

        if (transactionsError) throw transactionsError;

        // Calculate totals from completed transactions
        const totalCreditsPurchased = completedTransactions?.reduce((sum, t) => sum + (t.credits_purchased || 0), 0) || 0;

        // Count credits used from appointments that have started consultations
        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select('id, status')
          .eq('clinic_id', activeClinic.clinic_id)
          .in('status', ['In Progress', 'Completed']);

        if (appointmentsError) throw appointmentsError;

        const totalCreditsUsed = appointments?.length || 0;
        const creditBalance = totalCreditsPurchased - totalCreditsUsed;

        // Get pending payments count
        const { data: pendingTransactions, error: pendingError } = await supabase
          .from('payment_transactions')
          .select('id')
          .eq('clinic_id', activeClinic.clinic_id)
          .eq('payment_status', 'pending');

        if (pendingError) throw pendingError;

        // Get current month consultations (appointments that have started)
        const currentMonthStart = new Date();
        currentMonthStart.setDate(1);
        currentMonthStart.setHours(0, 0, 0, 0);

        const { data: currentMonthAppointmentsData, error: currentMonthError } = await supabase
          .from('appointments')
          .select('id')
          .eq('clinic_id', activeClinic.clinic_id)
          .in('status', ['In Progress', 'Completed'])
          .gte('created_at', currentMonthStart.toISOString());

        if (currentMonthError) throw currentMonthError;

        const currentMonthAppointments = currentMonthAppointmentsData?.length || 0;
        const currentMonthAmount = currentMonthAppointments; // Each consultation costs 1 credit worth

        return {
          credit_balance: creditBalance,
          total_credits_purchased: totalCreditsPurchased,
          total_credits_used: totalCreditsUsed,
          current_month_appointments: currentMonthAppointments,
          current_month_amount: currentMonthAmount,
          pending_payments: pendingTransactions?.length || 0
        };
      }

      // Use data from clinic_credits table
      const creditBalance = clinicCredits?.credit_balance || 0;
      const totalCreditsPurchased = clinicCredits?.total_credits_purchased || 0;
      const totalCreditsUsed = clinicCredits?.total_credits_used || 0;

      // Get pending payments count
      const { data: pendingTransactions, error: pendingError } = await supabase
        .from('payment_transactions')
        .select('id')
        .eq('clinic_id', activeClinic.clinic_id)
        .eq('payment_status', 'pending');

      if (pendingError) throw pendingError;

      // Get current month consultations (appointments that have started)
      const currentMonthStart = new Date();
      currentMonthStart.setDate(1);
      currentMonthStart.setHours(0, 0, 0, 0);

      const { data: currentMonthAppointmentsData, error: currentMonthError } = await supabase
        .from('appointments')
        .select('id')
        .eq('clinic_id', activeClinic.clinic_id)
        .in('status', ['In Progress', 'Completed'])
        .gte('created_at', currentMonthStart.toISOString());

      if (currentMonthError) throw currentMonthError;

      const currentMonthAppointments = currentMonthAppointmentsData?.length || 0;
      const currentMonthAmount = currentMonthAppointments; // Each consultation costs 1 credit worth

      return {
        credit_balance: creditBalance,
        total_credits_purchased: totalCreditsPurchased,
        total_credits_used: totalCreditsUsed,
        current_month_appointments: currentMonthAppointments,
        current_month_amount: currentMonthAmount,
        pending_payments: pendingTransactions?.length || 0
      };
    },
    enabled: !!activeClinic?.clinic_id,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Fetch payment transactions
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery<PaymentTransaction[]>({
    queryKey: ['payment-transactions', activeClinic?.clinic_id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return [];
      
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('clinic_id', activeClinic.clinic_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!activeClinic?.clinic_id,
  });

  // Create Razorpay order
  const createRazorpayOrder = useMutation({
    mutationFn: async ({ packageId, amount, credits }: { packageId: string; amount: number; credits: number }) => {
      if (!activeClinic?.clinic_id) throw new Error('No active clinic');

      // Create payment transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('payment_transactions')
        .insert({
          clinic_id: activeClinic.clinic_id,
          transaction_type: 'credit_purchase',
          amount,
          currency: 'INR',
          credits_purchased: credits,
          payment_status: 'pending',
          metadata: { package_id: packageId }
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Create Razorpay order via Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-razorpay-order`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          amount: amount, // Send amount in rupees, Edge Function will convert to paise
          currency: 'INR',
          receipt: `cr_${transaction.id.substring(0, 32)}`, // Shorten to fit 40 char limit
          notes: {
            clinic_id: activeClinic.clinic_id,
            transaction_id: transaction.id,
            credits: credits,
            package_id: packageId
          }
        })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create Razorpay order';
        try {
          const errorData = await response.json();
          console.error('Edge Function error response:', errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }
      
      const orderData = await response.json();
      
      // Update transaction with Razorpay order ID
      const { error: updateError } = await supabase
        .from('payment_transactions')
        .update({ razorpay_order_id: orderData.order.id })
        .eq('id', transaction.id);

      if (updateError) throw updateError;

      return { transaction, order: orderData.order };
    },
    onError: (error) => {
      toast.error('Failed to create payment order', {
        description: error.message
      });
    }
  });

  // Process payment success
  const processPaymentSuccess = useMutation({
    mutationFn: async ({ 
      transactionId, 
      paymentId, 
      signature,
      credits 
    }: { 
      transactionId: string; 
      paymentId: string; 
      signature: string;
      credits: number;
    }) => {
      if (!activeClinic?.clinic_id) throw new Error('No active clinic');

      // Verify payment signature via Edge Function
      const verifyResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-razorpay-payment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          transaction_id: transactionId
        })
      });

      if (!verifyResponse.ok) throw new Error('Payment verification failed');

      // Update transaction status
      const { error: updateError } = await supabase
        .from('payment_transactions')
        .update({
          payment_status: 'completed',
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (updateError) throw updateError;

      // Add credits to clinic
      const { error: creditsError } = await supabase
        .rpc('add_clinic_credits', {
          clinic_id_param: activeClinic.clinic_id,
          credits_to_add: credits,
          transaction_id_param: transactionId
        });

      if (creditsError) throw creditsError;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic-billing-summary'] });
      queryClient.invalidateQueries({ queryKey: ['payment-transactions'] });
      toast.success('Payment successful! Credits added to your account.');
    },
    onError: (error) => {
      toast.error('Payment processing failed', {
        description: error.message
      });
    }
  });

  // Process payment failure
  const processPaymentFailure = useMutation({
    mutationFn: async ({ transactionId, error }: { transactionId: string; error: string }) => {
      const { error: updateError } = await supabase
        .from('payment_transactions')
        .update({
          payment_status: 'failed',
          metadata: { error },
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (updateError) throw updateError;
    },
    onError: (error) => {
      toast.error('Failed to update payment status', {
        description: error.message
      });
    }
  });

  // Check if appointment can be booked (sufficient credits)
  const canBookAppointment = async (creditsRequired: number = 1): Promise<boolean> => {
    // Try to get real-time balance from clinic_credits first
    if (activeClinic?.clinic_id) {
      try {
        const { data: clinicCredits, error } = await supabase
          .from('clinic_credits')
          .select('credit_balance')
          .eq('clinic_id', activeClinic.clinic_id)
          .maybeSingle();

        console.log('canBookAppointment - clinic_credits query:', { clinicCredits, error, clinicId: activeClinic.clinic_id });

        if (!error && clinicCredits) {
          const result = (clinicCredits.credit_balance || 0) >= creditsRequired;
          console.log('canBookAppointment - direct query result:', result, 'balance:', clinicCredits.credit_balance);
          return result;
        }
      } catch (error) {
        console.warn('Failed to fetch clinic credits, falling back to billing summary:', error);
      }
    }

    // Fall back to billing summary
    const fallbackResult = (billingSummary?.credit_balance || 0) >= creditsRequired;
    console.log('canBookAppointment - fallback to billing summary:', fallbackResult, 'billingSummary:', billingSummary);
    return fallbackResult;
  };

  // Get credit balance
  const getCreditBalance = (): number => {
    return billingSummary?.credit_balance || 0;
  };

  // Deduct credits for appointment
  const deductCreditsForAppointment = useMutation({
    mutationFn: async ({ appointmentId, creditsToDeduct = 1 }: { appointmentId: string; creditsToDeduct?: number }) => {
      if (!activeClinic?.clinic_id) throw new Error('No active clinic');

      const { data, error } = await supabase
        .rpc('deduct_appointment_credit', {
          appointment_id_param: appointmentId,
          clinic_id_param: activeClinic.clinic_id,
          credits_to_deduct: creditsToDeduct
        });

      if (error) throw error;
      if (!data) throw new Error('Insufficient credits');

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic-billing-summary'] });
      // Credits deduction happens silently without notification
    },
    onError: (error) => {
      toast.error('Failed to deduct credits', {
        description: error.message
      });
    }
  });

  return {
    // Data
    billingSummary,
    transactions,
    creditPackages: CREDIT_PACKAGES,
    
    // Loading states
    isLoadingSummary,
    isLoadingTransactions,
    isProcessingPayment,
    
    // Actions
    createRazorpayOrder,
    processPaymentSuccess,
    processPaymentFailure,
    deductCreditsForAppointment,
    
    // Utilities
    canBookAppointment,
    getCreditBalance,
    setIsProcessingPayment,
  };
}; 