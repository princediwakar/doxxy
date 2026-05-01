"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import type { BillingFormValues, BillingTotals, Bill } from "@/types/billing";
import type { Json } from "@/types/core";

const supabase = getSupabase();

export function useSaveBill(mode: string, bill: Bill | null | undefined, totals: BillingTotals) {
  const queryClient = useQueryClient();
  const { activeClinic } = useAuth();

  return useMutation({
    mutationFn: async (values: BillingFormValues) => {
      if (!activeClinic?.clinic_id) throw new Error("No active clinic selected");

      const billData = {
        patient_id: values.patient_id,
        appointment_id: values.appointment_id,
        clinic_id: activeClinic.clinic_id,
        invoice_number: values.invoice_number,
        amount: totals.total,
        description: values.description,
        service_items: values.service_items as unknown as Json,
        discount_percentage: values.discount_percentage,
        tax_percentage: values.tax_percentage,
        notes: values.notes,
      };

      if (mode === "edit" && bill) {
        const { data, error } = await supabase
          .from("bills")
          .update(billData)
          .eq("id", bill.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("bills")
          .insert(billData)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.byClinic(activeClinic?.clinic_id ?? "") });
      toast.success(mode === "edit" ? "Bill updated successfully!" : "Bill created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || `Failed to ${mode === "edit" ? "update" : "create"} bill`);
    },
  });
}
