"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/query-keys";

const supabase = getSupabase();

export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.profile.user(userId ?? ""),
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
