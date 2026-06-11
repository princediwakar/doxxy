"use client";

import { type UseFormReturn } from "react-hook-form";
import { ProcurementFormValues } from "@/types/pharmacy";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SupplierFieldsProps {
  form: UseFormReturn<ProcurementFormValues>;
}

export function SupplierFields({ form }: SupplierFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6  rounded-xl bg-card shadow-sm">
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-muted-foreground">Supplier / Dealer</Label>
        <Input {...form.register("supplier_name")} placeholder="Enter supplier name" className="bg-background" />
        {form.formState.errors.supplier_name && (
          <p className="text-xs text-destructive">{form.formState.errors.supplier_name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-muted-foreground">Bill Number</Label>
        <Input {...form.register("invoice_number")} placeholder="e.g. INV-12345" className="bg-background" />
        {form.formState.errors.invoice_number && (
          <p className="text-xs text-destructive">{form.formState.errors.invoice_number.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-muted-foreground">Bill Date</Label>
        <Input type="date" {...form.register("invoice_date")} className="bg-background" />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-muted-foreground">Total Amount (₹)</Label>
        <Input
          type="number"
          step="0.01"
          {...form.register("total_amount", { valueAsNumber: true })}
          className="bg-background font-semibold"
        />
      </div>
    </div>
  );
}
