"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import { Bill, ServiceItem, BillWithDetails } from "@/types/billing";

const supabase = getSupabase();

interface BillingStats {
  totalRevenue: number;
  totalBills: number;
}

function parseServiceItems(jsonData: unknown): ServiceItem[] | null {
  if (!jsonData || !Array.isArray(jsonData)) return null;
  const items: ServiceItem[] = [];
  for (const item of jsonData) {
    if (typeof item === "object" && item !== null) {
      const obj = item as Record<string, unknown>;
      if (
        typeof obj.description === "string" &&
        typeof obj.quantity === "number" &&
        typeof obj.rate === "number" &&
        typeof obj.amount === "number"
      ) {
        items.push({
          description: obj.description,
          quantity: obj.quantity,
          rate: obj.rate,
          amount: obj.amount,
        });
      }
    }
  }
  return items.length > 0 ? items : null;
}

export function useBillingData(clinicId?: string, selectedMonth?: string) {
  const billsQuery = useQuery({
    queryKey: queryKeys.billing.byClinic(clinicId ?? "", selectedMonth ?? ""),
    queryFn: async () => {
      if (!clinicId || !selectedMonth) return [];

      const [year, month] = selectedMonth.split("-").map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const { data, error } = await supabase
        .from("bills")
        .select(`*, patients(name)`)
        .eq("clinic_id", clinicId)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);

      return ((data as Record<string, unknown>[]) || []).map((b) => {
        const { patients, ...billData } = b;
        return {
          ...billData,
          service_items: parseServiceItems(billData.service_items),
          patient_name: (patients as { name?: string } | null)?.name,
        } as BillWithDetails;
      });
    },
    enabled: !!clinicId,
  });

  const statsQuery = useQuery<BillingStats>({
    queryKey: queryKeys.billing.stats(clinicId ?? "", selectedMonth ?? ""),
    queryFn: async () => {
      if (!clinicId || !selectedMonth) return { totalRevenue: 0, totalBills: 0 };

      const [year, month] = selectedMonth.split("-").map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const { data, error } = await supabase
        .from("bills")
        .select("amount")
        .eq("clinic_id", clinicId)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (error) throw new Error(error.message);

      const totalRevenue = (data as { amount: number }[]).reduce(
        (sum, bill) => sum + Number(bill.amount),
        0
      );
      return { totalRevenue, totalBills: (data as unknown[]).length };
    },
    enabled: !!clinicId,
  });

  return {
    bills: billsQuery.data ?? [],
    isLoadingBills: billsQuery.isLoading,
    refetchBills: billsQuery.refetch,
    stats: statsQuery.data ?? { totalRevenue: 0, totalBills: 0 },
    refetchStats: statsQuery.refetch,
  };
}
