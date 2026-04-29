"use client";
import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

const supabase = getSupabase();

export function useInvoiceNumber(open: boolean, mode: string, hasExistingInvoice: boolean) {
  const { activeClinic } = useAuth();

  return useQuery({
    queryKey: ["newInvoiceNumber", activeClinic?.clinic_id, open, mode],
    queryFn: async () => {
      if (!activeClinic?.clinic_id) throw new Error("No active clinic selected");

      logger.log("Calling generate_invoice_number with clinic_id:", activeClinic.clinic_id);

      try {
        const { data, error } = await supabase
          .rpc("generate_invoice_number", { clinic_id_arg: activeClinic.clinic_id });
        logger.log("RPC Response:", { data, error });
        if (error) throw error;
        if (data) {
          logger.log("Database function returned:", data);
          return data;
        }
      } catch (error) {
        logger.warn("Database invoice generation failed:", error);
        toast.warning("Using locally generated invoice number.");
      }

      const clinic = await supabase
        .from("clinics")
        .select("name")
        .eq("id", activeClinic.clinic_id)
        .single();

      const clinicPrefix = clinic.data?.name?.charAt(0).toUpperCase() || "C";
      const year = new Date().getFullYear();
      const timestamp = Date.now().toString().slice(-4);
      const random = Math.floor(Math.random() * 100).toString().padStart(2, "0");

      return `${clinicPrefix}${year}${timestamp}${random}`;
    },
    enabled: open && !!activeClinic?.clinic_id && mode === "create" && !hasExistingInvoice,
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}
