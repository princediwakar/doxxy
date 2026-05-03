// src/hooks/useAppointmentMutations.ts
"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { showErrorToast } from "@/lib/error-utils";
import { queryKeys } from "@/lib/query-keys";
import type { AppointmentFormValues } from "@/components/appointments/appointment.utils";
import type { AppointmentData } from "@/types/appointments";
import type { Json } from "@/types/core";

const supabase = getSupabase();

async function generateFallbackInvoiceNumber(clinicId: string): Promise<string> {
  try {
    const { data: latestBill } = await supabase
      .from("bills")
      .select("invoice_number")
      .eq("clinic_id", clinicId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestBill?.invoice_number) {
      const seq = parseInt(latestBill.invoice_number.slice(-6), 10) + 1;
      const prefix = latestBill.invoice_number.slice(0, -6);
      return prefix + String(seq).padStart(6, "0");
    }
  } catch {
    // fall through to last-resort generation
  }

  const { data: clinic } = await supabase
    .from("clinics")
    .select("name")
    .eq("id", clinicId)
    .single();
  const prefix = clinic?.name?.charAt(0).toUpperCase() || "C";
  const year = new Date().getFullYear();
  return `${prefix}${year}000001`;
}

export const useAppointmentMutation = (
  appointment: AppointmentData | null,
  onSuccessCallback: () => void
) => {
  const queryClient = useQueryClient();
  const { activeClinic } = useAuth();

  return useMutation({
    mutationFn: async (values: AppointmentFormValues) => {
      if (!activeClinic?.clinic_id)
        throw new Error("No active clinic selected.");

      const baseAppointmentData = {
        clinic_id: activeClinic.clinic_id,
        date: format(values.date, "yyyy-MM-dd"),
        time: values.time || "",
        patient_id: values.patient_id,
        doctor_id: values.doctor_id,
        type: values.type,
        status: values.status,
        notes: values.notes || "",
      };

      const query = appointment
        ? supabase
            .from("appointments")
            .update(baseAppointmentData)
            .eq("id", appointment.id)
        : supabase.from("appointments").insert(baseAppointmentData);

      const { data, error } = await query.select().single();

      if (error) throw error;

      // Delete bill if appointment status changed to Cancelled
      let billCancelled = false;
      if (appointment && values.status === "Cancelled") {
        try {
          await supabase.from("bills").delete().eq("appointment_id", appointment.id);
          billCancelled = true;
        } catch {
          // non-blocking — the status update already succeeded
        }
      }

      // Auto-generate bill for new appointments if doctor has a consultation_fee
      let billCreated = false;
      if (!appointment) {
        try {
          const { data: existingBill } = await supabase
            .from("bills")
            .select("id")
            .eq("appointment_id", data.id)
            .maybeSingle();

          if (!existingBill) {
            const { data: doctorData } = await supabase
              .from("doctors")
              .select("consultation_fee")
              .eq("id", values.doctor_id)
              .single();

            const fee = doctorData?.consultation_fee;
            if (fee && fee > 0) {
              let invoiceNumber: string;
              try {
                const { data: rpcData, error: rpcError } = await supabase
                  .rpc("generate_invoice_number", { clinic_id_arg: activeClinic.clinic_id });
                if (rpcError || !rpcData) throw rpcError ?? new Error("No invoice number returned");
                invoiceNumber = rpcData as string;
              } catch (rpcError) {
                logger.warn("RPC invoice generation failed, using fallback:", rpcError);
                invoiceNumber = await generateFallbackInvoiceNumber(activeClinic.clinic_id);
              }

              const serviceItems = [{
                description: "Consultation",
                quantity: 1,
                rate: fee,
                amount: fee,
              }];

              await supabase.from("bills").insert({
                patient_id: values.patient_id,
                appointment_id: data.id,
                clinic_id: activeClinic.clinic_id,
                invoice_number: invoiceNumber,
                amount: fee,
                service_items: serviceItems as unknown as Json,
                description: "Consultation fee",
                discount_percentage: 0,
                tax_percentage: 0,
              });

              billCreated = true;
            }
          }
        } catch (err) {
          logger.warn("Auto bill generation failed:", err);
          showErrorToast(err, { title: "Bill generation failed — please create manually" });
        }
      }

      return { ...data, _billCreated: billCreated, _billCancelled: billCancelled };
    },
    onSuccess: (data: { _billCreated?: boolean; _billCancelled?: boolean; patient_id?: string; id: string }) => {
      if (data._billCreated) {
        toast.success("Appointment created and bill automatically generated.");
        queryClient.invalidateQueries({ queryKey: ["bills"] });
        if (data.patient_id) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.billing.byPatient(data.patient_id),
          });
        }
      } else if (data._billCancelled) {
        toast.success("Appointment cancelled.");
        queryClient.invalidateQueries({ queryKey: ["bills"] });
        if (data.patient_id) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.billing.byPatient(data.patient_id),
          });
        }
      } else {
        toast.success(
          appointment ? "Appointment updated!" : "Appointment created!"
        );
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.appointments.byClinic(activeClinic?.clinic_id ?? ""),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.data(activeClinic?.clinic_id ?? ""),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      onSuccessCallback();
    },
    onError: (error: Error) => {
      toast.error(
        appointment
          ? "Failed to update appointment."
          : "Failed to create appointment.",
        {
          description: error.message,
        }
      );
    },
  });
};
