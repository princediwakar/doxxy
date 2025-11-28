// src/components/payments/PaymentsDashboard.tsx
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Plus,
  IndianRupee,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { usePayments } from "@/hooks/usePayments";
import { PaymentTransaction } from "@/types/billing";
import { CreditPurchaseModal } from "./CreditPurchaseModal";
import { format } from "date-fns";

export const PaymentsDashboard: React.FC = () => {
  const {
    billingSummary,
    transactions,
    isLoadingSummary,
    isLoadingTransactions,
  } = usePayments();

  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "failed":
        return "destructive";
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (isLoadingSummary) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Billing & Credits</h1>
          <p className="text-muted-foreground">
            Manage your appointment credits and payment history
          </p>
        </div>
        <Button onClick={() => setIsCreditModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Purchase Credits
        </Button>
      </div>

      {/* Usage Progress */}
      {billingSummary && billingSummary.total_credits_purchased > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Credit Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Used: {billingSummary.total_credits_used}</span>
                <span>Remaining: {billingSummary.credit_balance}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (billingSummary.total_credits_used /
                        billingSummary.total_credits_purchased) *
                      100
                    }%`,
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {(
                  (billingSummary.total_credits_used /
                    billingSummary.total_credits_purchased) *
                  100
                ).toFixed(1)}
                % of purchased credits used
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No transactions yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Purchase your first credit package to get started
              </p>
              <Button onClick={() => setIsCreditModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Purchase Credits
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions
                .slice(0, 10)
                .map((transaction: PaymentTransaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(transaction.status)}
                      <div>
                        <div className="font-medium">
                          {transaction.transaction_type === "credit_purchase"
                            ? "Credit Purchase"
                            : "Monthly Billing"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(
                            new Date(transaction.created_at || ""),
                            "MMM dd, yyyy • h:mm a"
                          )}
                        </div>
                        {transaction.credits_purchased && (
                          <div className="text-sm text-blue-600">
                            +{transaction.credits_purchased} credits
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold flex items-center">
                        <IndianRupee className="h-4 w-4" />
                        {transaction.amount}
                      </div>
                      <Badge
                        variant={getStatusBadgeVariant(transaction.status)}
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}

              {transactions.length > 10 && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm">
                    View All Transactions
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Credit Warning */}
      {billingSummary && billingSummary.credit_balance < 5 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800">
                  Low Credit Balance
                </h3>
                <p className="text-yellow-700">
                  You have {billingSummary.credit_balance} credits remaining.
                  Consider purchasing more credits to avoid appointment booking
                  interruptions.
                </p>
              </div>
              <Button
                onClick={() => setIsCreditModalOpen(true)}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Purchase Credits
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Credit Purchase Modal */}
      <CreditPurchaseModal
        open={isCreditModalOpen}
        onOpenChange={setIsCreditModalOpen}
      />
    </div>
  );
};
