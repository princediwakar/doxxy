"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryTab } from "@/components/pharmacy/InventoryTab";
import { ProcurementsHistoryTab } from "@/components/pharmacy/ProcurementsHistoryTab";
import { ProcurementEntrySheet } from "@/components/pharmacy/ProcurementEntrySheet";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";
import type { InventoryItemWithMedicine, DbProcurement } from "@/types/core";

interface PharmacyPageClientProps {
  serverInventory: InventoryItemWithMedicine[];
  serverProcurements: DbProcurement[];
}

export default function PharmacyPageClient({
  serverInventory,
  serverProcurements,
}: PharmacyPageClientProps) {
  const [isEntrySheetOpen, setIsEntrySheetOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Pharmacy Store</h1>
            <p className="hidden sm:block text-muted-foreground">Manage medicine stock, track expiry dates, and add new purchases.</p>
          </div>
        </div>
        <Button onClick={() => setIsEntrySheetOpen(true)} className="gap-2 bg-primary shrink-0">
          <Plus className="w-4 h-4" />
          Add Stock
        </Button>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="inventory" className="text-sm">Stock</TabsTrigger>
          <TabsTrigger value="procurements" className="text-sm">Purchase Records</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory" className="border-none p-0">
          <InventoryTab inventory={serverInventory} />
        </TabsContent>
        <TabsContent value="procurements" className="border-none p-0">
          <ProcurementsHistoryTab procurements={serverProcurements} />
        </TabsContent>
      </Tabs>

      <ProcurementEntrySheet
        open={isEntrySheetOpen}
        onOpenChange={setIsEntrySheetOpen}
      />
    </div>
  );
}
