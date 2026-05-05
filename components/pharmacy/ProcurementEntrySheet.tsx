"use client";
import { logger } from "@/lib/logger";
import React, { useEffect, useRef, useState } from "react";
import { useAppState } from "@/contexts/AppStateContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import { saveFullProcurement } from "@/actions/inventory";
import { extractBillData } from "@/lib/bill-extraction";
import { queryKeys } from "@/lib/query-keys";
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
import { UploadCloud, Save, Loader2, Sparkles, X, Camera } from "lucide-react";
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
  const { activeClinicId, user } = useAppState();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Local state for operations that were in hooks
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStats, setExtractionStats] = useState<{ total: number; matched: number } | null>(null);

  // ── Bill image upload (inherently client-side — Supabase Storage) ──
  const uploadBillImage = async (file: File, clinicId: string): Promise<string> => {
    const supabase = getSupabase();
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${clinicId}/${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage
        .from('procurement_bills')
        .upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage
        .from('procurement_bills')
        .getPublicUrl(fileName);
      return data.publicUrl;
    } finally {
      setIsUploading(false);
    }
  };

  // ── Bill extraction (API call) ──
  const handleExtract = async (imageUrl: string) => {
    setIsExtracting(true);
    setExtractionStats(null);
    const infoToastId = toast.info('Extracting details using AI...');
    try {
      const result = await extractBillData(imageUrl);
      form.reset(result.formData);
      setExtractionStats({ total: result.totalCount, matched: result.matchedCount });
      const unmapped = result.totalCount - result.matchedCount;
      if (unmapped === 0) {
        toast.success(`All ${result.totalCount} items added to stock!`);
      } else {
        toast.success(
          `Added ${result.totalCount} items — ${result.matchedCount} found in catalog, ${unmapped} are new.`,
        );
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Bill extraction failed:', msg);
      toast.error(msg || 'Failed to extract bill data');
    } finally {
      toast.dismiss(infoToastId);
      setIsExtracting(false);
    }
  };

  const resetExtraction = () => setExtractionStats(null);

  // ── Create medicine inline (calls API endpoint) ──
  const createMedicine = async (name: string): Promise<{ id: number; name: string } | null> => {
    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/medicines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name }),
      });
      let json: Record<string, unknown> = {};
      try { json = (await res.json()) as Record<string, unknown>; } catch { /* ignore */ }
      if (!res.ok) throw new Error((json.error as string) || 'Failed to create medicine');
      return { id: json.id as number, name: json.name as string };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to create medicine';
      toast.error(msg);
      return null;
    }
  };

  // ── Procurement mutation via server action ──
  const saveMutation = useMutation({
    mutationFn: (data: ProcurementFormValues) => {
      if (!activeClinicId || !user?.id) throw new Error('No active clinic selected.');
      return saveFullProcurement({
        clinicId: activeClinicId,
        userId: user.id,
        supplier_name: data.supplier_name,
        invoice_number: data.invoice_number,
        invoice_date: data.invoice_date,
        total_amount: data.total_amount,
        items: (data.items ?? []).map((item) => ({
          extracted_name: item.extracted_name,
          medicine_id: item.medicine_id,
          batch_number: item.batch_number,
          expiry_date: item.expiry_date,
          quantity: item.quantity,
          unit_price: item.unit_price,
          mrp: item.mrp,
          total_price: item.total_price,
        })),
      });
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy_inventory'] });
      queryClient.invalidateQueries({ queryKey: ['pharmacy_procurements'] });
      const createdCount = result.createdCount ?? 0;
      if (createdCount > 0) {
        toast.success(`Saved! ${createdCount} new medicine(s) added to your stock catalog.`);
      } else {
        toast.success('Saved! Stock has been updated.');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save stock');
    },
  });

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
  }, [open]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!activeClinicId) {
      toast.error("No clinic selected. Please select a clinic first.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      return;
    }

    let publicUrl: string;
    try {
      publicUrl = await uploadBillImage(file, activeClinicId);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      logger.error("Bill image upload failed:", msg);
      toast.error("Failed to upload bill image");
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      return;
    }

    await handleExtract(publicUrl);

    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const onSubmit = (data: ProcurementFormValues) => {
    saveMutation.mutate(data, {
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
                  <SheetClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0 -ml-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </SheetClose>
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
                  type="button"
                  variant="outline"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isUploading || isExtracting}
                  className="w-full sm:w-auto justify-center md:hidden"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
                <Input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={saveMutation.isPending || isExtracting || isUploading}
                  className="w-full sm:w-auto justify-center"
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save to Stock
                </Button>
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
