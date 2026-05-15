// src/components/billing/BillingModal.tsx
import React, { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, Edit, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { printBill, generateBillPrintContent, generateBillFilename } from "./billingPrintUtils";
import { useAppState } from "@/contexts/AppStateContext";
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
    isLoadingInvoiceNumber,
    appointmentsError,
    patientsError,
    doctorFeeError,
    calculateTotals,
    addServiceItem,
    removeServiceItem,
    updateServiceItem,
    selectMedicineForItem,
    saveBill,
    isSubmitting,
    refetchInvoiceNumber,
  } = useBilling({ bill, patient, appointment, mode, open });

  // Show error toasts for failed queries
  useEffect(() => {
    if (appointmentsError) toast.error('Failed to load appointments');
    if (patientsError) toast.error('Failed to load patients');
    if (doctorFeeError) toast.error('Failed to load doctor fee information');
  }, [appointmentsError, patientsError, doctorFeeError]);

  useEffect(() => {
    onDirtyChange?.(form.formState.isDirty);
  }, [form.formState.isDirty, onDirtyChange]);

  const billRef = useRef(bill);
  billRef.current = bill;

  const { activeClinicName } = useAppState();
  const queryClient = useQueryClient();
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const onSubmit = async (values: BillingFormValues) => {
    try {
      await saveBill(values);
      toast.success(mode === "edit" ? "Bill updated successfully!" : "Bill created successfully!");
      queryClient.invalidateQueries({ queryKey: ["patient", values.patient_id, "bills"] });
      if (mode === "edit") {
        onModeChange?.("view");
      } else {
        onOpenChange(false);
      }
    } catch {
      // error toast handled in useBilling
    }
  };

  const buildCurrentBillData = (): Bill | null => {
    const currentBill = billRef.current;
    if (!currentBill) return null;
    const formServiceItems = form.watch("service_items");
    return {
      ...currentBill,
      service_items:
        formServiceItems && formServiceItems.length > 0
          ? formServiceItems
          : null,
    };
  };

  const handlePrint = async () => {
    const billData = buildCurrentBillData();
    if (!billData) return;
    await printBill(billData, patient || null, null);
  };

  const handleDownload = async () => {
    const billData = buildCurrentBillData();
    if (!billData) return;

    try {
      const html = generateBillPrintContent(billData, patient || null, null);

      const [jsPDFModule, html2canvasModule] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const jsPDF = jsPDFModule.default;
      const html2canvas = html2canvasModule.default;

      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "-9999px";
      container.innerHTML = html;
      document.body.appendChild(container);

      await new Promise((resolve) => setTimeout(resolve, 800));

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      document.body.removeChild(container);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = generateBillFilename(billData, patient || null, activeClinicName);
      pdf.save(filename);
    } catch (error) {
      toast.error("Failed to download bill PDF");
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
        {/* Top Actions - Positioned left of the Close X */}
        <div className="absolute right-12 top-4 flex items-center gap-2 z-50">
          {bill && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          )}

          {bill && (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
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
              <span className="hidden sm:inline">Edit</span>
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

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {getModalTitle()}
          </DialogTitle>
          <DialogDescription>
            {mode === "view"
              ? "View billing details and invoice information"
              : mode === "edit"
              ? "Edit billing information and service items"
              : "Create a new bill for the selected patient and appointment"}
          </DialogDescription>
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
                              {patient.name} {patient.medical_id}
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
                        <div className="flex gap-2">
                          <Input
                            {...field}
                            placeholder={
                              isLoadingInvoiceNumber
                                ? "Generating invoice number..."
                                : "Invoice number"
                            }
                            disabled={mode === "view" || isLoadingInvoiceNumber}
                          />
                          {mode === "create" && !isLoadingInvoiceNumber && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => refetchInvoiceNumber()}
                              disabled={isLoadingInvoiceNumber}
                            >
                              Generate
                            </Button>
                          )}
                        </div>
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
