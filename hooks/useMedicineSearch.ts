"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { queryKeys } from "@/lib/query-keys";
import { logger } from "@/lib/logger";

export function useMedicineSearch(searchQuery: string, selectedValue?: string) {
  const { session, initialLoading } = useAuth();

  const medicinesQuery = useQuery({
    queryKey: queryKeys.medicines.search(searchQuery),
    queryFn: async () => {
      if (!session?.access_token) return [];

      const supabase = getSupabase();

      if (!searchQuery.trim()) {
        const { data, error } = await supabase.rpc("search_medicines", {
          search_term: "",
          limit_count: 50,
        });
        if (error) {
          logger.error("Error fetching medicines:", error);
          return [];
        }
        return data || [];
      }

      const { data, error } = await supabase.rpc("search_medicines", {
        search_term: searchQuery.toLowerCase(),
        limit_count: 50,
      });
      if (error) {
        logger.error("Error searching medicines:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!session?.access_token && !initialLoading,
  });

  const selectedMedicineQuery = useQuery({
    queryKey: queryKeys.medicines.selected(selectedValue ?? ""),
    queryFn: async () => {
      if (!session?.access_token || !selectedValue) return null;

      const supabase = getSupabase();
      const { data, error } = await supabase.rpc("search_medicines", {
        search_term: selectedValue,
        limit_count: 1,
      });
      if (error) {
        logger.error("Error fetching selected medicine:", error.message || error);
        return null;
      }
      return data?.[0] || null;
    },
    enabled: !!selectedValue && !!session?.access_token && !initialLoading,
  });

  return {
    medicines: medicinesQuery.data ?? [],
    isLoading: medicinesQuery.isLoading,
    initialLoading,
    selectedMedicine: selectedMedicineQuery.data ?? null,
    isFetchingSelected: selectedMedicineQuery.isFetching,
  };
}
