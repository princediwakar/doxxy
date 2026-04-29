// components/pharmacy/ProcurementEntrySheet.tsx
"use client";
import { logger } from "@/lib/logger";

import React, { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateProcurement } from "@/hooks/useProcurements";
import { useProcurementStorage } from "@/hooks/useProcurementStorage";
import { useBillExtraction } from "@/hooks/useBillExtraction";
import { useCreateMedicine } from "@/hooks/useCreateMedicine";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { procurementSchema, ProcurementFormValues } from "@/types/pharmacy";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UploadCloud,
  CheckCircle,
  AlertCircle,
  Save,
  Loader2,
  Trash2,
  Plus,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { MedicineCombobox } from "@/components/ui/medicine-combobox";
import { Medicine, MedicationAutoFillData } from "@/types/prescriptions";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
interface ProcurementEntrySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProcurementEntrySheet({ open, onOpenChange }: ProcurementEntrySheetProps) {
  const { activeClinic } = useAuth();
  const createProcurement = useCreateProcurement();
  const { uploadBillImage, isUploading } = useProcurementStorage();
  const { extractData, isExtracting, extractionStats, resetExtraction } = useBillExtraction();
  const { createMedicine } = useCreateMedicine();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProcurementFormValues>({
    resolver: zodResolver(procurementSchema),
    defaultValues: {
      supplier_name: "",
      invoice_number: "",
      invoice_date: new Date().toISOString().split("T")[0],
      total_amount: 0,
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    if (open) {
      resetExtraction();
    }
  }, [open, resetExtraction]);

  // ── File upload ─────────────────────────────────────────────────────────────

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeClinic?.clinic_id) return;

    try {
      const publicUrl = await uploadBillImage(file, activeClinic.clinic_id);
      const result = await extractData(publicUrl);
      if (result) {
        form.reset(result.formData);
        const unmapped = result.totalCount - result.matchedCount;
        if (unmapped === 0) {
          toast.success(`All ${result.totalCount} items added to stock!`);
        } else {
          toast.success(
            `Added ${result.totalCount} items — ${result.matchedCount} found in catalog, ${unmapped} are new.`
          );
        }
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      logger.error("Upload error:", msg);
      toast.error("Failed to upload bill image");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Save ────────────────────────────────────────────────────────────────────

  const onSubmit = (data: ProcurementFormValues) => {
    createProcurement.mutate(data, {
      onSuccess: () => {
        form.reset();
        resetExtraction();
        onOpenChange(false);
      },
    });
  };

  // ── Medicine selection from combobox ────────────────────────────────────────

  const handleCreateMedicine = async (index: number, name: string) => {
    const result = await createMedicine(name);
    if (result) {
      form.setValue(`items.${index}.medicine_id`, result.id);
      form.setValue(`items.${index}.extracted_name`, result.name);
      toast.success(`Medicine "${result.name}" created and linked!`);
    }
  };

  const handleMedicineSelect = (index: number, medicine: Medicine, _autoFill: MedicationAutoFillData) => {
    form.setValue(`items.${index}.extracted_name`, medicine.name);
    form.setValue(`items.${index}.medicine_id`, medicine.id);
  };

  // ── Auto-total calculation ──────────────────────────────────────────────────

  const recalcTotal = (index: number) => {
    const qty = form.getValues(`items.${index}.quantity`) || 0;
    const price = form.getValues(`items.${index}.unit_price`) || 0;
    if (qty > 0 && price > 0) {
      form.setValue(`items.${index}.total_price`, Math.round(qty * price * 100) / 100);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const unmappedCount = fields.filter((_, i) => !form.watch(`items.${i}.medicine_id`)).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[95vh] rounded-t-xl sm:max-w-none flex flex-col p-0 border-t-0 shadow-2xl"
      >
        <div className="flex flex-col h-full bg-background">
          {/* Header */}
          <SheetHeader className="px-6 py-4 border-b bg-card">
            <div className="flex justify-between items-center">
              <div>
                <SheetTitle className="text-xl flex items-center gap-2">
                  Add New Stock
                  {isExtracting && (
                    <Badge
                      variant="secondary"
                      className="animate-pulse bg-blue-100 text-blue-700 hover:bg-blue-100 ml-2 border-0"
                    >
                      <Sparkles className="w-3 h-3 mr-1" /> Scanning...
                    </Badge>
                  )}
                  {extractionStats && !isExtracting && (
                    <Badge
                      variant="secondary"
                      className={
                        extractionStats.matched === extractionStats.total
                          ? "bg-green-100 text-green-700 border-0"
                          : "bg-amber-100 text-amber-700 border-0"
                      }
                    >
                      {extractionStats.matched}/{extractionStats.total} matched
                    </Badge>
                  )}
                </SheetTitle>
                <SheetDescription>
                  Add new medicines to your stock. Upload a bill image to auto-fill details.
                </SheetDescription>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isExtracting}
                  className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <UploadCloud className="w-4 h-4 mr-2" />
                  )}
                  Scan Bill
                </Button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={createProcurement.isPending || isExtracting || isUploading}
                  className="min-w-[140px]"
                >
                  {createProcurement.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save to Stock
                </Button>
              </div>
            </div>

            {/* Unmapped warning banner */}
            {unmappedCount > 0 && fields.length > 0 && !isExtracting && (
              <div className="mt-2 flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>
                  <strong>{unmappedCount}</strong> item{unmappedCount !== 1 ? "s" : ""} will be auto-created in the medicines catalog when saved.
                </span>
              </div>
            )}
          </SheetHeader>

          <ScrollArea className="flex-1 p-6">
            <form
              id="procurement-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 max-w-[1400px] mx-auto"
            >
              {/* Supplier header */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border rounded-xl bg-card shadow-sm">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">
                    Supplier / Dealer
                  </Label>
                  <Input
                    {...form.register("supplier_name")}
                    placeholder="Enter supplier name"
                    className="bg-background"
                  />
                  {form.formState.errors.supplier_name && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.supplier_name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">
                    Bill Number
                  </Label>
                  <Input
                    {...form.register("invoice_number")}
                    placeholder="e.g. INV-12345"
                    className="bg-background"
                  />
                  {form.formState.errors.invoice_number && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.invoice_number.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">
                    Bill Date
                  </Label>
                  <Input type="date" {...form.register("invoice_date")} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">
                    Total Amount (₹)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register("total_amount", { valueAsNumber: true })}
                    className="bg-background font-semibold"
                  />
                </div>
              </div>

              {/* Line items grid */}
              <div className="border rounded-xl shadow-sm bg-card overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b bg-muted/30">
                  <h3 className="font-semibold">
                    Items List
                    {fields.length > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground font-normal">
                        ({fields.length} items)
                      </span>
                    )}
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        extracted_name: "",
                        batch_number: "",
                        expiry_date: "",
                        quantity: 1,
                        unit_price: 0,
                        mrp: 0,
                        total_price: 0,
                      })
                    }
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Row
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-4 py-3 w-[300px]">Medicine</th>
                        <th className="px-4 py-3 w-[150px]">Packet No.</th>
                        <th className="px-4 py-3 w-[150px]">Expiry Date</th>
                        <th className="px-4 py-3 w-[100px]">Qty</th>
                        <th className="px-4 py-3 w-[130px]">Unit Price (₹)</th>
                        <th className="px-4 py-3 w-[130px]">M.R.P (₹)</th>
                        <th className="px-4 py-3 w-[130px]">Total (₹)</th>
                        <th className="px-4 py-3 w-[50px]"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {fields.map((field, index) => (
                        <tr
                          key={field.id}
                          className="hover:bg-muted/20 transition-colors group"
                        >
                          {/* Medicine name + match status */}
                          <td className="px-4 py-2">
                            <Controller
                              name={`items.${index}.extracted_name`}
                              control={form.control}
                              render={({ field: nameField }) => (
                                <div className="flex flex-col gap-0.5">
<MedicineCombobox
                                        value={nameField.value}
                                        onValueChange={nameField.onChange}
                                        onMedicineSelect={(medicine, autoFill) =>
                                          handleMedicineSelect(index, medicine, autoFill)
                                        }
                                        onCreateMedicine={(name) => handleCreateMedicine(index, name)}
                                        placeholder="Select or type..."
                                        className="border-0 shadow-none bg-transparent h-8 px-2"
                                        showCreateButton={false}
                                      />
                                  <Controller
                                    name={`items.${index}.medicine_id`}
                                    control={form.control}
                                    render={({ field: idField }) =>
                                      idField.value ? (
                                        <span className="text-[10px] text-green-600 px-2 flex items-center gap-1">
                                          <CheckCircle className="w-2.5 h-2.5" />
                                          In catalog
                                        </span>
                                      ) : (
                                        <span className="text-[10px] text-amber-600 px-2 flex items-center gap-1 font-medium">
                                          <AlertCircle className="w-2.5 h-2.5" />
                                          New - add to catalog
                                        </span>
                                      )
                                    }
                                  />
                                </div>
                              )}
                            />
                          </td>

                          {/* Batch */}
                          <td className="px-4 py-2">
<Input
                            {...form.register(`items.${index}.batch_number`)}
                            className="h-8 border-0 shadow-none bg-transparent focus-visible:ring-1 focus-visible:bg-background"
                            placeholder="Packet number..."
                          />
                          </td>

                          {/* Expiry */}
                          <td className="px-4 py-2">
                            <Input
                              type="date"
                              {...form.register(`items.${index}.expiry_date`)}
                              className="h-8 border-0 shadow-none bg-transparent focus-visible:ring-1 focus-visible:bg-background"
                            />
                          </td>

                          {/* Quantity */}
                          <td className="px-4 py-2">
                            <Input
                              type="number"
                              min="1"
                              {...form.register(`items.${index}.quantity`, {
                                valueAsNumber: true,
                                onChange: () => recalcTotal(index),
                              })}
                              className="h-8 border-0 shadow-none bg-transparent focus-visible:ring-1 focus-visible:bg-background"
                            />
                          </td>

                          {/* Unit price */}
                          <td className="px-4 py-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...form.register(`items.${index}.unit_price`, {
                                valueAsNumber: true,
                                onChange: () => recalcTotal(index),
                              })}
                              className="h-8 border-0 shadow-none bg-transparent focus-visible:ring-1 focus-visible:bg-background"
                            />
                          </td>

                          {/* M.R.P */}
                          <td className="px-4 py-2">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...form.register(`items.${index}.mrp`, {
                                valueAsNumber: true,
                              })}
                              className="h-8 border-0 shadow-none bg-transparent focus-visible:ring-1 focus-visible:bg-background"
                            />
                          </td>

                          {/* Total */}
                          <td className="px-4 py-2">
                            <Input
                              type="number"
                              step="0.01"
                              {...form.register(`items.${index}.total_price`, {
                                valueAsNumber: true,
                              })}
                              className="h-8 border-0 shadow-none bg-transparent font-medium focus-visible:ring-1 focus-visible:bg-background"
                            />
                          </td>

                          {/* Delete */}
                          <td className="px-4 py-2 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}

                      {/* Empty state */}
                      {fields.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-muted-foreground">
                            <div className="flex flex-col items-center justify-center">
                              <Sparkles className="w-8 h-8 mb-2 opacity-30" />
                              <p>No items added yet.</p>
                              <p className="text-xs">Add a row manually or scan a bill with AI.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </form>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}