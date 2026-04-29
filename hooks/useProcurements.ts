"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { showErrorToast } from "@/lib/error-utils";
import { queryKeys } from "@/lib/query-keys";
import type { ProcurementFormValues } from "@/types/pharmacy";

const supabase = getSupabase();

export function useProcurements() {
  const { activeClinic } = useAuth();

  return useQuery({
    queryKey: queryKeys.procurements.byClinic(activeClinic?.clinic_id ?? ""),
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return [];

      const { data, error } = await supabase
        .from("procurements")
        .select("*")
        .eq("clinic_id", activeClinic.clinic_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!activeClinic?.clinic_id,
  });
}

export function useAuthToken() {
  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  };

  return { getToken };
}

export function useCreateProcurement() {
  const { activeClinic, user } = useAuth();
  const queryClient = useQueryClient();
  const { getToken } = useAuthToken();

  return useMutation({
    mutationFn: async (data: ProcurementFormValues) => {
      if (!activeClinic?.clinic_id || !user?.id) {
        throw new Error("No active clinic selected.");
      }

      const token = await getToken();

      // Phase 1: Create procurement header
      const { data: procurement, error: procError } = await supabase
        .from("procurements")
        .insert({
          clinic_id: activeClinic.clinic_id,
          supplier_name: data.supplier_name,
          invoice_number: data.invoice_number,
          invoice_date: data.invoice_date,
          total_amount: data.total_amount,
          status: "Completed",
          created_by: user.id,
        })
        .select()
        .single();

      if (procError) throw procError;

      if (!data.items || data.items.length === 0) {
        return { procurement, createdCount: 0 };
      }

      // Phase 2: Batch-create unmapped medicines
      const unmappedNames = data.items
        .filter((item) => !item.medicine_id && item.extracted_name?.trim())
        .map((item) => item.extracted_name!.trim());

      const uniqueUnmapped = unmappedNames.filter((name, i) => unmappedNames.indexOf(name) === i);
      const nameToIdMap = new Map<string, number>();

      if (uniqueUnmapped.length > 0) {
        const res = await fetch("/api/medicines", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ names: uniqueUnmapped, is_auto_created: true }),
        });

        if (!res.ok) {
          let json: { error?: string } = {};
          try { json = (await res.json()) as { error?: string }; } catch { /* body unparseable */ }
          throw new Error(json.error || "Failed to create unmapped medicines");
        }

        const created: { name: string; id: number }[] = await res.json();
        for (const med of created) {
          nameToIdMap.set(med.name, med.id);
        }
      }

      // Phase 3: Insert procurement_items + upsert inventory_items
      const itemInserts: {
        procurement_id: string;
        medicine_id: number | null;
        extracted_name: string;
        batch_number: string;
        expiry_date: string | null;
        quantity: number;
        unit_price: number;
        total_price: number;
      }[] = [];
      const inventoryUpserts: {
        clinic_id: string;
        medicine_id: number;
        batch_number: string;
        expiry_date: string;
        current_stock: number;
        unit_cost_price: number;
        mrp: number;
      }[] = [];

      for (const item of data.items) {
        const medicineId = item.medicine_id ?? nameToIdMap.get(item.extracted_name ?? "") ?? null;

        itemInserts.push({
          procurement_id: procurement.id,
          medicine_id: medicineId,
          extracted_name: item.extracted_name ?? "",
          batch_number: item.batch_number ?? "",
          expiry_date: item.expiry_date || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        });

        if (medicineId) {
          inventoryUpserts.push({
            clinic_id: activeClinic.clinic_id,
            medicine_id: medicineId,
            batch_number: item.batch_number ?? "",
            expiry_date: item.expiry_date,
            current_stock: item.quantity,
            unit_cost_price: item.unit_price,
            mrp: item.mrp ?? 0,
          });
        }
      }

      await supabase.from("procurement_items").insert(itemInserts);

      for (const inv of inventoryUpserts) {
        const { data: existing } = await supabase
          .from("inventory_items")
          .select("id, current_stock")
          .eq("clinic_id", activeClinic.clinic_id)
          .eq("medicine_id", inv.medicine_id)
          .eq("batch_number", inv.batch_number)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("inventory_items")
            .update({ current_stock: existing.current_stock + inv.current_stock })
            .eq("id", existing.id);
        } else {
          await supabase.from("inventory_items").insert(inv);
        }
      }

      return { procurement, createdCount: nameToIdMap.size };
    },
    onSuccess: (_result, _variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.procurements.all });

      const createdCount = _result.createdCount ?? 0;
      if (createdCount > 0) {
        toast.success(
          `Saved! ${createdCount} new medicine(s) added to your stock catalog.`
        );
      } else {
        toast.success("Saved! Stock has been updated.");
      }
    },
    onError: (error) => {
      showErrorToast(error, { title: "Failed to save stock" });
    },
  });
}
