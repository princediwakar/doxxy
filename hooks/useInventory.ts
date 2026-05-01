"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { showErrorToast } from "@/lib/error-utils";
import { queryKeys } from "@/lib/query-keys";
import { DbInventoryItem, DbInventoryItemUpdate, DbMedicine } from "@/types/core";

const supabase = getSupabase();

export type InventoryItemWithMedicine = DbInventoryItem & {
  medicines: Pick<DbMedicine, 'name' | 'manufacturer_name'> | null;
};

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
    staleTime: 2 * 60 * 1000,
  });

  const updateStock = useMutation({
    mutationFn: async ({ itemId, newStock }: { itemId: string; newStock: number }) => {
      const { error } = await supabase
        .from("inventory_items")
        .update({ current_stock: newStock } as unknown as DbInventoryItemUpdate)
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

  const updateItem = useMutation({
    mutationFn: async (item: {
      id: string;
      batch_number: string;
      expiry_date: string;
      current_stock: number;
      reorder_level: number;
      unit_cost_price: number;
      mrp: number;
    }) => {
      const { id, ...fields } = item;
      const { error } = await supabase
        .from("inventory_items")
        .update(fields as unknown as DbInventoryItemUpdate)
        .eq("id", id);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
    onError: (error) => {
      showErrorToast(error, { title: "Failed to update item" });
    },
  });

  return { inventory, isLoading, updateStock, updateItem };
}
