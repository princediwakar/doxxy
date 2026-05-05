// components/payments/PaymentsDashboard.tsx
"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CreditCard,
  Plus,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  History,
  Wallet,
} from "lucide-react";
import type { BillingSummary, PaymentTransaction } from "@/types/billing";
import { CreditPurchaseModal } from "./CreditPurchaseModal";
import { format } from "date-fns";

interface PaymentsDashboardProps {
  serverBillingSummary: BillingSummary | null;
  serverTransactions: PaymentTransaction[];
}

export const PaymentsDashboard: React.FC<PaymentsDashboardProps> = ({
  serverBillingSummary,
  serverTransactions,
}) => {
  const billingSummary = serverBillingSummary;
  const transactions = serverTransactions;
  const isLoadingSummary = false;
  const isLoadingTransactions = false;

  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

  // Calculate usage percentage safely (prevent division by zero)
  const usagePercentage = React.useMemo(() => {
    if (!billingSummary || billingSummary.total_credits_purchased === 0) return 0;
    const pct = (billingSummary.total_credits_used / billingSummary.total_credits_purchased) * 100;
    return Math.min(pct, 100);
  }, [billingSummary]);

  return (
    <div className="space-y-6 px-4 md:px-0 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Payments</h1>
            <p className="hidden sm:block text-muted-foreground">Credits and transaction history</p>
          </div>
        </div>
        <Button onClick={() => setIsCreditModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Credits
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Balance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${
                  (billingSummary?.credit_balance || 0) < 10 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {billingSummary?.credit_balance || 0}
                </span>
                <span className="text-sm text-muted-foreground">credits</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {billingSummary?.total_credits_used || 0}
                </span>
                <span className="text-sm text-muted-foreground">appointments</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant={(billingSummary?.credit_balance || 0) > 0 ? "default" : "destructive"}>
                  {(billingSummary?.credit_balance || 0) > 0 ? "Active" : "Low Credits"}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {!isLoadingSummary && billingSummary && billingSummary.total_credits_purchased > 0 && (
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="pt-6">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span>Credit Usage</span>
              <span>{usagePercentage.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${usagePercentage > 90 ? 'bg-orange-500' : 'bg-blue-600'}`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-right">
              {billingSummary.total_credits_used} used of {billingSummary.total_credits_purchased} total purchased
            </p>
          </CardContent>
        </Card>
      )}

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Transaction History</CardTitle>
          </div>
          <CardDescription>Recent payments and credit purchases.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
              <CreditCard className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No transactions found.</p>
              <Button variant="link" onClick={() => setIsCreditModalOpen(true)}>
                Purchase your first pack
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Status Icon */}
                    {tx.payment_status === 'completed' ? (
                      <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 shrink-0" />
                    ) : tx.payment_status === 'failed' ? (
                      <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 shrink-0" />
                    ) : (
                      <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 shrink-0" />
                    )}
                    
                    <div className="min-w-0">
                      <div className="font-medium text-sm sm:text-base">
                        {tx.transaction_type === 'credit_purchase' ? 'Credit Top-up' : 'Bill Payment'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {tx.created_at ? format(new Date(tx.created_at), "MMM dd, yyyy • h:mm a") : '-'}
                      </div>
                      {tx.credits_purchased && (
                        <span className="inline-flex items-center text-xs font-medium text-blue-600 mt-1">
                          <Plus className="w-3 h-3 mr-0.5" />
                          {tx.credits_purchased} credits
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 ml-auto sm:ml-0">
                    <div className="font-bold text-sm sm:text-base">₹{tx.amount}</div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs capitalize shrink-0 ${
                        tx.payment_status === 'completed' 
                          ? 'border-green-200 text-green-700 bg-green-50' 
                          : tx.payment_status === 'failed'
                          ? 'border-red-200 text-red-700 bg-red-50'
                          : 'border-yellow-200 text-yellow-700 bg-yellow-50'
                      }`}
                    >
                      {tx.payment_status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreditPurchaseModal 
        open={isCreditModalOpen} 
        onOpenChange={setIsCreditModalOpen} 
      />
    </div>
  );
};