// src/hooks/usePayments.ts
"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { PaymentTransaction } from "@/types/billing";

const supabase = getSupabase();

export interface BillingSummary {
  credit_balance: number;
  total_credits_purchased: number;
  total_credits_used: number;
  current_month_appointments: number;
  current_month_amount: number;
  pending_payments: number;
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

  // 1. Fetch clinic billing summary - DYNAMICALLY CALCULATED
  const { data: billingSummary, isLoading: isLoadingSummary } =
    useQuery<BillingSummary>({
      queryKey: ["clinic-billing-summary", activeClinic?.clinic_id],
      queryFn: async () => {
        if (!activeClinic?.clinic_id) throw new Error("No active clinic");

        // A. Total Purchased
        const { data: completedTransactions, error: transactionsError } =
          await supabase
            .from("payment_transactions")
            .select("credits_purchased")
            .eq("clinic_id", activeClinic.clinic_id)
            .eq("transaction_type", "credit_purchase")
            .eq("payment_status", "completed");

        if (transactionsError) throw transactionsError;

        const totalCreditsPurchased =
          completedTransactions?.reduce(
            (sum, t) => sum + (t.credits_purchased || 0),
            0
          ) || 0;

        // B. Total Used (Based on Status)
        const { count: totalCreditsUsed, error: appointmentsError } =
          await supabase
            .from("appointments")
            .select("id", { count: "exact", head: true })
            .eq("clinic_id", activeClinic.clinic_id)
            .in("status", ["In Progress", "Completed"]);

        if (appointmentsError) throw appointmentsError;

        const safeTotalUsed = totalCreditsUsed || 0;
        const creditBalance = totalCreditsPurchased - safeTotalUsed;

        // C. Pending Payments
        const { count: pendingPayments, error: pendingError } = await supabase
          .from("payment_transactions")
          .select("id", { count: "exact", head: true })
          .eq("clinic_id", activeClinic.clinic_id)
          .eq("payment_status", "pending");

        if (pendingError) throw pendingError;

        // D. Current Month Stats
        const currentMonthStart = new Date();
        currentMonthStart.setDate(1);
        currentMonthStart.setHours(0, 0, 0, 0);

        const { count: currentMonthAppointments, error: currentMonthError } =
          await supabase
            .from("appointments")
            .select("id", { count: "exact", head: true })
            .eq("clinic_id", activeClinic.clinic_id)
            .in("status", ["In Progress", "Completed"])
            .gte("created_at", currentMonthStart.toISOString());

        if (currentMonthError) throw currentMonthError;

        return {
          credit_balance: creditBalance,
          total_credits_purchased: totalCreditsPurchased,
          total_credits_used: safeTotalUsed,
          current_month_appointments: currentMonthAppointments || 0,
          current_month_amount: currentMonthAppointments || 0,
          pending_payments: pendingPayments || 0,
        };
      },
      enabled: !!activeClinic?.clinic_id,
      staleTime: 5000, 
    });

  // 2. Fetch payment transactions
  const { data: transactions = [], isLoading: isLoadingTransactions } =
    useQuery<PaymentTransaction[]>({
      queryKey: ["payment-transactions", activeClinic?.clinic_id],
      queryFn: async () => {
        if (!activeClinic?.clinic_id) return [];

        const { data, error } = await supabase
          .from("payment_transactions")
          .select("*")
          .eq("clinic_id", activeClinic.clinic_id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        return (data || []).map((transaction) => ({
          id: transaction.id,
          clinic_id: transaction.clinic_id,
          amount: transaction.amount,
          payment_method: transaction.payment_method || "",
          status: transaction.payment_status as "pending" | "completed" | "failed" | "refunded",
          transaction_type: (transaction.transaction_type as "credit_purchase" | "bill_payment") || undefined,
          credits_purchased: transaction.credits_purchased || undefined,
          razorpay_payment_id: transaction.razorpay_payment_id || undefined,
          created_at: transaction.created_at || "",
          updated_at: transaction.updated_at || "",
        }));
      },
      enabled: !!activeClinic?.clinic_id,
    });

  // 3. Create Razorpay order
  const createRazorpayOrder = useMutation({
    mutationFn: async ({ packageId, amount, credits }: { packageId: string; amount: number; credits: number; }) => {
      if (!activeClinic?.clinic_id) throw new Error("No active clinic");

      const { data: transaction, error: transactionError } = await supabase
        .from("payment_transactions")
        .insert({
          clinic_id: activeClinic.clinic_id,
          transaction_type: "credit_purchase",
          amount,
          currency: "INR",
          credits_purchased: credits,
          payment_status: "pending",
          metadata: { package_id: packageId },
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-razorpay-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            amount: amount,
            currency: "INR",
            receipt: `cr_${transaction.id.substring(0, 32)}`,
            notes: {
              clinic_id: activeClinic.clinic_id,
              transaction_id: transaction.id,
              credits: credits,
              package_id: packageId,
            },
          }),
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to create Razorpay order";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) { console.error(e) }
        throw new Error(errorMessage);
      }

      const orderData = await response.json();

      const { error: updateError } = await supabase
        .from("payment_transactions")
        .update({ razorpay_order_id: orderData.order.id })
        .eq("id", transaction.id);

      if (updateError) throw updateError;

      return { transaction, order: orderData.order };
    },
    onError: (error) => {
      toast.error("Failed to create payment order", { description: error.message });
    },
  });

  // 4. Process payment success
  const processPaymentSuccess = useMutation({
    mutationFn: async ({ transactionId, paymentId, signature, credits }: { transactionId: string; paymentId: string; signature: string; credits: number; }) => {
      if (!activeClinic?.clinic_id) throw new Error("No active clinic");

      const verifyResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/verify-razorpay-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            razorpay_payment_id: paymentId,
            razorpay_signature: signature,
            transaction_id: transactionId,
          }),
        }
      );

      if (!verifyResponse.ok) throw new Error("Payment verification failed");

      // Update transaction status
      const { error: updateError } = await supabase
        .from("payment_transactions")
        .update({
          payment_status: "completed",
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          updated_at: new Date().toISOString(),
        })
        .eq("id", transactionId);

      if (updateError) throw updateError;

      // Keep legacy table sync if needed, but UI relies on calculation
      await supabase.rpc("add_clinic_credits", {
        clinic_id_param: activeClinic.clinic_id,
        credits_to_add: credits,
        transaction_id_param: transactionId,
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-billing-summary"] });
      queryClient.invalidateQueries({ queryKey: ["payment-transactions"] });
      toast.success("Payment successful! Credits added to your account.");
    },
    onError: (error) => {
      toast.error("Payment processing failed", { description: error.message });
    },
  });

  // 5. Process payment failure
  const processPaymentFailure = useMutation({
    mutationFn: async ({ transactionId, error }: { transactionId: string; error: string }) => {
      const { error: updateError } = await supabase
        .from("payment_transactions")
        .update({
          payment_status: "failed",
          metadata: { error },
          updated_at: new Date().toISOString(),
        })
        .eq("id", transactionId);

      if (updateError) throw updateError;
    },
  });

  // 6. Check if appointment can be booked (sufficient credits)
  // This replaces the need for a separate 'deduct' function.
  // We check before we change status.
  const canBookAppointment = async (creditsRequired: number = 1): Promise<boolean> => {
    if (!activeClinic?.clinic_id) {
      console.error("No active clinic ID for credit check");
      return false;
    }

    try {
      // Get Total Purchased
      const { data: transactions, error: transactionsError } = await supabase
        .from("payment_transactions")
        .select("credits_purchased")
        .eq("clinic_id", activeClinic.clinic_id)
        .eq("transaction_type", "credit_purchase")
        .eq("payment_status", "completed");

      if (transactionsError) {
        console.error("Error fetching payment transactions:", transactionsError);
        // Don't return false immediately - check if it's an RLS policy error
        if (transactionsError.code === '42501' || transactionsError.message?.includes('permission denied')) {
          console.error("RLS POLICY ERROR: Doctor cannot read payment_transactions table");
          console.error("Please ensure the RLS policy 'payment_transactions_read_for_clinic_members' exists and includes 'doctor' role");
        }
        return false;
      }

      const totalPurchased = transactions?.reduce((sum, t) => sum + (t.credits_purchased || 0), 0) || 0;

      // Get Total Used (In Progress + Completed)
      const { count: totalUsed, error: appointmentsError } = await supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("clinic_id", activeClinic.clinic_id)
        .in("status", ["In Progress", "Completed"]);

      if (appointmentsError) {
        console.error("Error fetching appointments count:", appointmentsError);
        return false;
      }

      const balance = totalPurchased - (totalUsed || 0);

      // Debug logging
      console.debug(`Credit check: purchased=${totalPurchased}, used=${totalUsed || 0}, balance=${balance}, required=${creditsRequired}`);

      return balance >= creditsRequired;
    } catch (error) {
      console.error("Unexpected error checking credits:", error);
      return false;
    }
  };

  const getCreditBalance = (): number => {
    return billingSummary?.credit_balance || 0;
  };

  return {
    billingSummary,
    transactions,
    creditPackages: CREDIT_PACKAGES,
    isLoadingSummary,
    isLoadingTransactions,
    isProcessingPayment,
    createRazorpayOrder,
    processPaymentSuccess,
    processPaymentFailure,
    // Removed: deductCreditsForAppointment
    canBookAppointment,
    getCreditBalance,
    setIsProcessingPayment,
  };
};