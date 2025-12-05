// File: hooks/usePayments.ts
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { PaymentTransaction } from "@/types/billing";

// Define strict type locally to ensure no import errors
interface DbPaymentTransactionInsert {
  clinic_id: string;
  transaction_type: string;
  amount: number;
  currency: string;
  credits_purchased: number;
  payment_status: string;
  metadata?: any;
}

const supabase = getSupabase();

export interface BillingSummary {
  credit_balance: number;
  total_credits_purchased: number;
  total_credits_used: number;
  pending_payments_count: number;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  amount: number;
  description: string;
  popular?: boolean;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "Junior",
    name: "Junior Pack",
    credits: 50,
    amount: 499,
    description: "50 appointments",
  },
  {
    id: "Senior",
    name: "Senior Pack",
    credits: 200,
    amount: 1999,
    description: "200 appointments",
    popular: true,
  },
  {
    id: "Professional",
    name: "Professional Pack",
    credits: 1000,
    amount: 9999,
    description: "1000 appointments",
  },
];

export const usePayments = () => {
  const { activeClinic } = useAuth();
  const queryClient = useQueryClient();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // 1. Fetch Clinic Billing Summary
  const { data: billingSummary, isLoading: isLoadingSummary } =
    useQuery<BillingSummary>({
      queryKey: ["clinic-billing-summary", activeClinic?.clinic_id],
      queryFn: async () => {
        if (!activeClinic?.clinic_id) throw new Error("No active clinic");

        // Fetch clinic credits data
        // PRODUCTION FIX: Used .maybeSingle() instead of .single()
        // This prevents the app from crashing for new users who don't have a row in 'clinic_credits' yet.
        const { data: clinicCredits, error: clinicError } = await supabase
          .from("clinic_credits")
          .select("*")
          .eq("clinic_id", activeClinic.clinic_id)
          .maybeSingle(); 

        if (clinicError) {
          console.error("Error fetching credits:", clinicError);
          throw clinicError;
        }

        const { count: pendingCount } = await supabase
          .from("payment_transactions")
          .select("*", { count: "exact", head: true })
          .eq("clinic_id", activeClinic.clinic_id)
          .eq("payment_status", "pending");

        return {
          credit_balance: clinicCredits?.credit_balance || 0,
          total_credits_purchased: clinicCredits?.total_credits_purchased || 0,
          total_credits_used: clinicCredits?.total_credits_used || 0,
          pending_payments_count: pendingCount || 0,
        };
      },
      enabled: !!activeClinic?.clinic_id,
    });

  // 2. Fetch Transactions
  const { data: transactions = [], isLoading: isLoadingTransactions } =
    useQuery<PaymentTransaction[]>({
      queryKey: ["payment-transactions", activeClinic?.clinic_id],
      queryFn: async () => {
        if (!activeClinic?.clinic_id) return [];

        const { data, error } = await supabase
          .from("payment_transactions")
          .select("*")
          .eq("clinic_id", activeClinic.clinic_id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) throw error;
        
        return data as PaymentTransaction[];
      },
      enabled: !!activeClinic?.clinic_id,
    });

  // 3. Create Order Mutation
  const createRazorpayOrder = useMutation({
    mutationFn: async ({ packageId, amount, credits }: { packageId: string; amount: number; credits: number; }) => {
      if (!activeClinic?.clinic_id) throw new Error("No active clinic");

      // Insert Pending Transaction
      const transactionData: DbPaymentTransactionInsert = {
        clinic_id: activeClinic.clinic_id,
        transaction_type: "credit_purchase",
        amount,
        currency: "INR",
        credits_purchased: credits,
        payment_status: "pending",
        metadata: { package_id: packageId },
      };

      const { data: transaction, error: txError } = await supabase
        .from("payment_transactions")
        .insert(transactionData)
        .select()
        .single();

      if (txError) throw txError;

      // Invoke Edge Function
      const { data: orderResponse, error: fnError } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount,
          currency: "INR",
          receipt: `rcpt_${transaction.id.slice(0, 8)}`,
          notes: {
            clinic_id: activeClinic.clinic_id,
            transaction_id: transaction.id,
            credits: credits.toString()
          }
        }
      });

      if (fnError || !orderResponse?.order) {
        throw new Error(fnError?.message || "Failed to init payment gateway");
      }

      // Update transaction with Order ID
      await supabase
        .from("payment_transactions")
        .update({ razorpay_order_id: orderResponse.order.id })
        .eq("id", transaction.id);

      return { transaction, order: orderResponse.order };
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create order", { description: error.message });
    },
  });

  // 4. Verification Mutation
  const processPaymentSuccess = useMutation({
    mutationFn: async ({ transactionId, paymentId, signature }: { transactionId: string; paymentId: string; signature: string }) => {
      const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
        body: {
          transaction_id: transactionId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature
        }
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      return data;
    },
    onSuccess: () => {
      // Invalidate the summary query to force a re-fetch of the new balance
      queryClient.invalidateQueries({ queryKey: ["clinic-billing-summary"] });
      queryClient.invalidateQueries({ queryKey: ["payment-transactions"] });
      toast.success("Payment Successful", { description: "Credits have been added to your account." });
    },
    onError: (error) => {
      toast.error("Payment Verification Failed", { 
        description: "If money was deducted, please contact support with your Payment ID." 
      });
      console.error("Verification error:", error);
    },
  });

  const canBookAppointment = (requiredCredits = 1): boolean => {
    return (billingSummary?.credit_balance || 0) >= requiredCredits;
  };

  return {
    billingSummary,
    transactions,
    creditPackages: CREDIT_PACKAGES,
    isLoadingSummary,
    isLoadingTransactions,
    isProcessingPayment,
    setIsProcessingPayment,
    createRazorpayOrder,
    processPaymentSuccess,
    canBookAppointment,
  };
};