"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { showErrorToast } from "@/lib/error-utils";
import { queryKeys } from "@/lib/query-keys";

const supabase = getSupabase();

export function useInventory() {
  const { activeClinic } = useAuth();
  const queryClient = useQueryClient();

  const { data: inventory, isLoading } = useQuery({
    queryKey: queryKeys.inventory.byClinic(activeClinic?.clinic_id ?? ""),
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return [];

      const { data, error } = await supabase
        .from("inventory_items")
        .select(`
          *,
          medicines:medicine_id (name, manufacturer_name)
        `)
        .eq("clinic_id", activeClinic.clinic_id)
        .order("expiry_date", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!activeClinic?.clinic_id,
  });

  const updateStock = useMutation({
    mutationFn: async ({ itemId, newStock }: { itemId: string; newStock: number }) => {
      const { error } = await supabase
        .from("inventory_items")
        .update({ current_stock: newStock } as any)
        .eq("id", itemId);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
    onError: (error) => {
      showErrorToast(error, { title: "Failed to update stock" });
    },
  });

  return { inventory, isLoading, updateStock };
}
