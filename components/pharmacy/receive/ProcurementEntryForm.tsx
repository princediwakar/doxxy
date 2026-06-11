// components/pharamacy/ProcurementEntryForm.tsx
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, Save, Loader2, Sparkles, X, Camera } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SupplierFields } from "../SupplierFields";
import { ProcurementItemsTable } from "../ProcurementItemsTable";

interface ProcurementEntryFormProps {
  onCancel: () => void;
  initialFile?: File;
}

export function ProcurementEntryForm({ onCancel, initialFile }: ProcurementEntryFormProps) {
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


  // Auto-process a file dropped via SmartInventoryDropzone
  const initialFileProcessed = useRef(false);
  useEffect(() => {
    if (initialFile && !initialFileProcessed.current && activeClinicId) {
      initialFileProcessed.current = true;
      (async () => {
        try {
          const url = await uploadBillImage(initialFile, activeClinicId);
          await handleExtract(url);
        } catch {
          // uploadBillImage already toasts on error
        }
      })();
    }
    
  }, [initialFile, activeClinicId]);

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
        onCancel();
      },
    });
  };
  const unmappedCount = fields.filter((_, i) => !form.watch(`items.${i}.medicine_id`)).length;
  return (
    <div className="flex flex-col h-full w-full animate-in fade-in duration-300">
      <div className="flex-none p-4 sm:p-6 border-b border-border/50 bg-background/50">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground tracking-tight">
                  Invoice Details
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
                </h2>
                <p className="text-sm text-muted-foreground">
                  Add new medicines to your stock. Upload a bill image to auto-fill details.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />
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
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <form
              id="procurement-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 max-w-5xl mx-auto"
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
          </div>

          {/* ── Sticky Bottom Footer ──────────────────────────────────────────────── */}
          <div className="flex-none border-t bg-background px-4 sm:px-6 py-4 flex items-center justify-between gap-6 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={onCancel} className="text-muted-foreground hover:text-destructive">
              Cancel
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="hidden sm:flex border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 text-indigo-600 dark:border-indigo-900/50 dark:hover:bg-indigo-900/30 dark:text-indigo-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              disabled={isExtracting}
            >
              {isExtracting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {isExtracting ? "Scanning AI..." : "Scan Bill"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isUploading || isExtracting}
              className="flex sm:hidden"
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
            <Button type="submit" form="procurement-form" size="default" className="shadow-md bg-foreground text-background hover:bg-foreground/90" disabled={isExtracting || form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save to Stock
            </Button>
          </div>
        </div>
    </div>
  );
}
