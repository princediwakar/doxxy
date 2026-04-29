"use client";

import { useState } from "react";
import { showErrorToast } from "@/lib/error-utils";
import { useAuthToken } from "@/hooks/useProcurements";

interface CreatedMedicine {
  id: number;
  name: string;
}

export function useCreateMedicine() {
  const [isCreating, setIsCreating] = useState(false);
  const { getToken } = useAuthToken();

  const createMedicine = async (name: string): Promise<CreatedMedicine | null> => {
    setIsCreating(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/medicines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name }),
      });

      let json: Record<string, unknown> = {};
      try {
        json = (await res.json()) as Record<string, unknown>;
      } catch {
        // body unparseable — fall through to response.ok check
      }

      if (!res.ok) {
        throw new Error((json.error as string) || "Failed to create medicine");
      }

      return { id: json.id as number, name: json.name as string };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to create medicine";
      showErrorToast(new Error(msg));
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return { createMedicine, isCreating };
}
