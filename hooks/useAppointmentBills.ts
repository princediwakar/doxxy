"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/query-keys";
import type { BillWithDetails, ServiceItem } from "@/types/billing";

const supabase = getSupabase();

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

export function useAppointmentBills(appointmentId?: string | null) {
  return useQuery({
    queryKey: queryKeys.billing.byAppointment(appointmentId ?? ""),
    queryFn: async () => {
      if (!appointmentId) return [];

      const { data, error } = await supabase
        .from("bills")
        .select("*")
        .eq("appointment_id", appointmentId)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);

      return ((data as Record<string, unknown>[]) || []).map((b) => ({
        ...b,
        service_items: parseServiceItems(b.service_items),
      })) as BillWithDetails[];
    },
    enabled: !!appointmentId,
    staleTime: 60 * 1000,
  });
}
