// src/components/billing/BillingModal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, Edit, Printer, Download, MessageCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { sendWhatsAppMessage, isMetaConfigError } from "@/lib/whatsapp";
import { isWhatsAppEnabled } from "@/lib/feature-flags";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useBilling, BillingFormValues } from "@/hooks/useBilling";
import { toast } from "sonner";
import { ServiceItemsSection } from "./ServiceItemsSection";
import { generateBillFilename } from "./billingPrintUtils";
import { pdf } from '@react-pdf/renderer';
import { BillingPDF } from './BillingPDF';
import { useAppState } from "@/contexts/AppStateContext";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import type { Bill, AppointmentForBilling } from "@/types/billing";
import type { DbPatient } from "@/types/core";

interface BillingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill?: Bill | null;
  patient?: DbPatient | null;
  appointment?: AppointmentForBilling | null;
  mode?: "create" | "view" | "edit";
  onModeChange?: (mode: "create" | "view" | "edit") => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export const BillingModal: React.FC<BillingModalProps> = ({
  open,
  onOpenChange,
  bill,
  patient,
  appointment,
  mode = "create",
  onModeChange,
  onDirtyChange,
}) => {
  const {
    form,
    appointments,
    patients,
    appointmentsError,
    calculateTotals,
    addServiceItem,
    removeServiceItem,
    updateServiceItem,
    selectMedicineForItem,
    saveBill,
    isSubmitting,
  } = useBilling({ bill, patient, appointment, mode, open });

  useEffect(() => {
    if (appointmentsError) toast.error('Failed to load billing data');
  }, [appointmentsError]);

  const billRef = useRef(bill);
  billRef.current = bill;

  const { activeClinicName, activeClinicId, userClinics } = useAppState();
  const queryClient = useQueryClient();

  const clinic = activeClinicId
    ? userClinics.find((c) => c.clinic_id === activeClinicId)?.clinics ?? null
    : null;

  const billingQueryKeys = useMemo(
    () => [["bills"], ["billing-context"], ["billingStats"]] as unknown[][],
    [],
  );
  useRealtimeSubscription({ table: "bills", clinicId: activeClinicId ?? "", queryKeys: billingQueryKeys });

  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [isGeneratingDocument, setIsGeneratingDocument] = useState(false);

  const onSubmit = async (values: BillingFormValues) => {
    try {
      await saveBill(values);
      toast.success(mode === "edit" ? "Bill updated successfully!" : "Bill created successfully!");
      queryClient.invalidateQueries({ queryKey: ["patient", values.patient_id, "bills"] });
      if (mode === "edit") {
        form.reset(values);
        onModeChange?.("view");
      } else {
        form.reset();
        onOpenChange(false);
      }
    } catch {
      // error toast handled in useBilling
    }
  };

  const buildCurrentBillData = (): Bill | null => {
    const currentBill = billRef.current;
    if (!currentBill && mode !== "create") return null;
    const currentFormValues = form.getValues();
    return {
      ...currentBill,
      ...currentFormValues,
      service_items:
        currentFormValues.service_items && currentFormValues.service_items.length > 0
          ? currentFormValues.service_items
          : null,
    } as Bill;
  };

  const handlePrint = async () => {
    const billData = buildCurrentBillData();
    if (!billData) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Please allow popups for this site to print.");
      return;
    }

    printWindow.document.write('<html><head><title>Preparing invoice...</title></head><body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; color: #64748b;"><h2>Preparing document for print...</h2></body></html>');

    try {
      setIsGeneratingDocument(true);
      const doc = <BillingPDF billData={billData} patient={patient || null} clinic={clinic} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      printWindow.location.href = url;
    } catch {
      printWindow.close();
      toast.error("Failed to prepare document for printing.");
    } finally {
      setIsGeneratingDocument(false);
    }
  };

  const handleDownload = async () => {
    const billData = buildCurrentBillData();
    if (!billData) return;

    try {
      setIsGeneratingDocument(true);
      const toastId = toast.loading("Preparing download...");
      const doc = <BillingPDF billData={billData} patient={patient || null} clinic={clinic} />;
      const blob = await pdf(doc).toBlob();
      const filename = generateBillFilename(billData, patient || null, activeClinicName);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Download started", { id: toastId });
    } catch {
      toast.error("Failed to download bill PDF");
    } finally {
      setIsGeneratingDocument(false);
    }
  };

  const handleSendWhatsapp = async () => {
    const billData = buildCurrentBillData();
    if (!billData || !patient?.phone) return;

    const toastId = toast.loading("Generating document...");

    try {
      setIsGeneratingDocument(true);
      const doc = <BillingPDF billData={billData} patient={patient || null} clinic={clinic} />;
      const blob = await pdf(doc).toBlob();

      const reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onloadend = async () => {
        try {
          const base64data = reader.result as string;
          const base64Pdf = base64data.split(",")[1];
          const filename = generateBillFilename(billData, patient || null, activeClinicName);

          toast.loading("Transmitting via WhatsApp...", { id: toastId });

          const result = await sendWhatsAppMessage({
            type: "document",
            to: patient.phone,
            base64Pdf,
            filename: `${filename}.pdf`,
            caption: `Invoice from ${activeClinicName}`,
            clinicId: activeClinicId,
            patientId: patient.id,
          });

          if (result.success) {
            toast.success("Sent via WhatsApp successfully", { id: toastId });

            // Also send the billing_invoice_delivery template notification
            const billDate = billData.created_at
              ? new Date(billData.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
              : new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
            const totalAmount = calculateTotals.total > 0
              ? `₹${calculateTotals.total.toFixed(2)}`
              : "₹0";
            sendWhatsAppMessage({
              type: "template",
              to: patient.phone,
              templateName: "billing_invoice_delivery",
              patientId: patient.id,
              clinicId: activeClinicId,
              bodyParams: [
                { type: "text", text: activeClinicName || "Clinic" },
                { type: "text", text: totalAmount },
                { type: "text", text: billDate },
              ],
            }).catch(() => {}); // fire-and-forget; PDF already delivered
          } else if (isMetaConfigError(result)) {
            toast.error("WhatsApp setup incomplete. Add a payment method and verify your number in the Meta Business dashboard to send messages.", { duration: Infinity, closeButton: true, id: toastId });
          } else {
            throw new Error(result.error || "Failed delivery");
          }
        } catch (err: any) {
          toast.error(err.message || "Failed to send to WhatsApp", { id: toastId });
        } finally {
          setIsGeneratingDocument(false);
        }
      };
    } catch {
      toast.error("Failed to generate document", { id: toastId });
      setIsGeneratingDocument(false);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case "view":
        return "View Bill";
      case "edit":
        return "Edit Bill";
      default:
        return "Create Bill";
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      if (form.formState.isDirty) {
        setShowDiscardDialog(true);
        return;
      }
      form.reset();
      onOpenChange(false);
    }
  };

  const handleDiscard = () => {
    setShowDiscardDialog(false);
    form.reset();
    onDirtyChange?.(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {getModalTitle()}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-1.5">
              {isWhatsAppEnabled && bill && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleSendWhatsapp}
                          disabled={isGeneratingDocument || !patient?.phone}
                          className="flex items-center gap-2 border-green-500 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950 hover:text-green-700 dark:hover:text-green-300"
                        >
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {!patient?.phone && (
                      <TooltipContent>
                        <p>No phone number</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              )}

              {bill && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isGeneratingDocument}
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}

              {bill && (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handlePrint}
                  disabled={isGeneratingDocument}
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
              )}

              {mode === "view" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onModeChange?.("edit")}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}

              {(mode === "create" || mode === "edit") && (
                <Button
                  type="button"
                  size="sm"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isSubmitting || calculateTotals.total <= 0}
                >
                  {isSubmitting
                    ? "Saving..."
                    : mode === "edit"
                    ? "Update"
                    : "Create"}
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh] overflow-y-auto">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 p-1 pb-4"
            >
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="patient_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={mode === "view" || !!appointment}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select patient" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patients?.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.name} {patient.uhid}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="appointment_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Appointment (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                        disabled={mode === "view" || !!appointment}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select appointment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Appointment</SelectItem>
                          {appointments?.map((apt) => (
                            <SelectItem key={apt.id} value={apt.id}>
                              {apt.patient_name} - {apt.date} {apt.time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoice_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={
                            mode === "create"
                              ? "Auto-generated on save"
                              : "Invoice number"
                          }
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="Bill description"
                          disabled={mode === "view"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Service Items */}
              <ServiceItemsSection
                serviceItems={form.watch("service_items") || []}
                onUpdateItem={updateServiceItem}
                onAddItem={addServiceItem}
                onRemoveItem={removeServiceItem}
                onSelectMedicine={selectMedicineForItem}
                mode={mode}
              />

              {/* Calculation Summary */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₹{calculateTotals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>₹{calculateTotals.total.toFixed(2)}</span>
                </div>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>

      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved bill?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes to this bill. Discarding will lose all entered information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscard}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};
