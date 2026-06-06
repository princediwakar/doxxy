// hooks/useRealtimeSubscription.ts
"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface RealtimeConfig {
  table: string;
  clinicId: string;
  queryKeys: unknown[][];
  onChange?: () => void;
}

export function useRealtimeSubscription({
  table,
  clinicId,
  queryKeys,
  onChange,
}: RealtimeConfig) {
  const queryClient = useQueryClient();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!clinicId) return;

    const supabase = getSupabase();

    const channel = supabase
      .channel(`realtime:${table}:${clinicId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: `clinic_id=eq.${clinicId}`,
        },
        () => {
          for (const key of queryKeys) {
            queryClient.invalidateQueries({ queryKey: key });
          }
          onChangeRef.current?.();
        }
      )
      .subscribe((status, err) => {
        if (status === "CHANNEL_ERROR") {
          console.error(`Realtime subscription failed for ${table}:`, err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, clinicId, queryKeys, queryClient]);
}
