"use client";
import { logger } from "@/lib/logger";
import React, { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateProcurement } from "@/hooks/useProcurements";
import { useProcurementStorage } from "@/hooks/useProcurementStorage";
import { useBillExtraction } from "@/hooks/useBillExtraction";
import { useCreateMedicine } from "@/hooks/useCreateMedicine";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { procurementSchema, ProcurementFormValues } from "@/types/pharmacy";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, Save, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SupplierFields } from "./SupplierFields";
import { ProcurementItemsTable } from "./ProcurementItemsTable";

interface ProcurementEntrySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
    if (open) resetExtraction();
  }, [open, resetExtraction]);
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
  const onSubmit = (data: ProcurementFormValues) => {
    createProcurement.mutate(data, {
      onSuccess: () => {
        form.reset();
        resetExtraction();
        onOpenChange(false);
      },
    });
  };
  const unmappedCount = fields.filter((_, i) => !form.watch(`items.${i}.medicine_id`)).length;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[95vh] rounded-t-xl sm:max-w-none flex flex-col p-0 border-t-0 shadow-2xl [&>button:last-of-type]:hidden"
      >
        <div className="flex flex-col h-full bg-background">
          <SheetHeader className="px-6 py-4 border-b bg-card">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
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
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isExtracting}
                  className="w-full sm:w-auto justify-center bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
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
                  className="w-full sm:w-auto justify-center"
                >
                  {createProcurement.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save to Stock
                </Button>
                <SheetClose asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </SheetClose>
              </div>
            </div>
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
              <SupplierFields form={form} />
              <ProcurementItemsTable
                form={form}
                fields={fields}
                append={append}
                remove={remove}
                createMedicine={createMedicine}
              />
            </form>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
