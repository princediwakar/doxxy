// components/schedule/BillingSection.tsx
"use client";

import { Eye, Receipt } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Spinner } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import type { Bill } from "@/types/billing";

interface BillingSectionProps {
  patientBills: Bill[];
  isLoadingBills: boolean;
  showCreateBill?: boolean;
  onCreateBill?: () => void;
  onViewBill: (bill: Bill) => void;
}

export function BillingSection({
  patientBills = [],
  isLoadingBills = false,
  showCreateBill = false,
  onCreateBill,
  onViewBill,
}: BillingSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          Bills ({patientBills.length})
        </h3>
        {patientBills.length > 0 && showCreateBill && onCreateBill && (
          <Button size="sm" variant="outline" onClick={onCreateBill}>
            <Receipt className="h-3.5 w-3.5 mr-1.5" />
            Create Bill
          </Button>
        )}
      </div>

      {isLoadingBills ? (
        <div className="flex items-center justify-center py-4">
          <Spinner size="sm" />
        </div>
      ) : patientBills.length === 0 ? (
        <div className="text-center py-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            No bills for this patient.
          </p>
          {showCreateBill && onCreateBill && (
            <Button size="sm" variant="outline" onClick={onCreateBill}>
              <Receipt className="h-3.5 w-3.5 mr-1.5" />
              Create Bill
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {patientBills.map((bill) => (
            <button
              key={bill.id}
              onClick={() => onViewBill(bill)}
              className="w-full text-left rounded-lg border p-3 hover:bg-muted/50 transition-colors flex items-center justify-between group"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {bill.invoice_number ??
                    `INV-${bill.id.slice(0, 8)}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {bill.created_at
                    ? format(parseISO(bill.created_at), "MMM dd, yyyy")
                    : ""}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-semibold">
                  ₹{Number(bill.amount).toLocaleString("en-IN")}
                </span>
                <Eye className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
