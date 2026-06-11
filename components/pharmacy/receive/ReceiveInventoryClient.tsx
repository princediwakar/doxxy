// Path: components/pharmacy/receive/ReceiveInventoryClient.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SmartInventoryDropzone } from "@/components/pharmacy/SmartInventoryDropzone";
import { ProcurementEntryForm } from "./ProcurementEntryForm";
import { InventoryBulkImportFlow } from "./InventoryBulkImportFlow";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PackagePlus } from "lucide-react";

export function ReceiveInventoryClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  const [file, setFile] = useState<File | undefined>();

  const handleBillFile = (file: File) => {
    setFile(file);
    router.push("/pharmacy/receive?mode=bill");
  };

  const handleSpreadsheetFile = (file: File) => {
    setFile(file);
    router.push("/pharmacy/receive?mode=spreadsheet");
  };

  const handleManual = () => {
    setFile(undefined);
    router.push("/pharmacy/receive?mode=manual");
  };

  const handleCancel = () => {
    setFile(undefined);
    router.back();
  };

  return (
    <div className="flex flex-col h-full w-full bg-background/50 backdrop-blur-sm overflow-hidden">
      <div className="flex-none px-4 py-4 sm:px-6 border-b border-border/50 bg-background/50 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/pharmacy")} className="shrink-0 rounded-full hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
              <PackagePlus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Receive Inventory</h1>
              <p className="text-xs font-medium text-muted-foreground">
                {mode === "manual" ? "Manual Entry Mode" : mode === "bill" ? "Invoice Processing" : mode === "spreadsheet" ? "Bulk Import" : "Select Source"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col relative">
        {(!mode || mode === "dropzone") && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-8 animation-fade-in">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                  Update your stock in seconds
                </h2>
                <p className="text-base text-muted-foreground max-w-md mx-auto">
                  Drag and drop a supplier invoice or a spreadsheet. Our AI will automatically extract and categorize everything for you.
                </p>
              </div>

              <SmartInventoryDropzone
                className="w-full h-72 shadow-xl shadow-indigo-500/5 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300"
                onBillImage={handleBillFile}
                onSpreadsheet={handleSpreadsheetFile}
              />

              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase font-medium tracking-widest">
                  <span className="bg-background px-4 text-muted-foreground">Or</span>
                </div>
              </div>
              
              <Button variant="outline" size="lg" className="w-full max-w-sm rounded-xl font-medium border-border/50 hover:bg-muted/50" onClick={handleManual}>
                Enter Details Manually
              </Button>
            </div>
          </div>
        )}

        {(mode === "bill" || mode === "manual") && (
          <ProcurementEntryForm
            initialFile={file}
            onCancel={handleCancel}
          />
        )}

        {mode === "spreadsheet" && (
          <InventoryBulkImportFlow
            initialFile={file}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
