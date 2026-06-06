// hooks/useRealtimeSubscription.ts
"use client";

import { useEffect, useMemo, useRef } from "react";
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

  // Unique suffix per hook instance — prevents collisions when multiple
  // components subscribe to the same table+clinic (e.g. schedule page +
  // billing modal both listen on "bills"), and avoids Strict Mode
  // double-mount races since removeChannel() is async.
  const instanceId = useMemo(() => Math.random().toString(36).slice(2, 9), []);

  useEffect(() => {
    if (!clinicId) return;

    const supabase = getSupabase();
    const channelName = `realtime:${table}:${clinicId}:${instanceId}`;

    const channel = supabase
      .channel(channelName)
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
          const msg = err instanceof Error ? err.message : String(err ?? '');
          // Suppress transport errors — harmless Strict Mode / HMR artifact.
          // React double-mounts in dev, and removeChannel() closes the
          // WebSocket before it connects, producing "transport failure".
          if (msg.includes('transport failure')) return;
          console.error(`Realtime subscription failed for ${table}:`, err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, clinicId, instanceId, queryKeys, queryClient]);
}
