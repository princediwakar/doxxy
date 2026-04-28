"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryTab } from "@/components/pharmacy/InventoryTab";
import { ProcurementsHistoryTab } from "@/components/pharmacy/ProcurementsHistoryTab";
import { ProcurementEntrySheet } from "@/components/pharmacy/ProcurementEntrySheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function PharmacyPage() {
  const [isEntrySheetOpen, setIsEntrySheetOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Pharmacy & Inventory</h1>
          <p className="text-muted-foreground">Manage stock, track expiry dates, and add new procurements.</p>
        </div>
        <Button onClick={() => setIsEntrySheetOpen(true)} className="gap-2 bg-primary">
          <Plus className="w-4 h-4" />
          New Procurement
        </Button>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="inventory" className="text-sm">Current Inventory</TabsTrigger>
          <TabsTrigger value="procurements" className="text-sm">Procurement History</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory" className="border-none p-0">
          <InventoryTab />
        </TabsContent>
        <TabsContent value="procurements" className="border-none p-0">
          <ProcurementsHistoryTab />
        </TabsContent>
      </Tabs>

      <ProcurementEntrySheet 
        open={isEntrySheetOpen} 
        onOpenChange={setIsEntrySheetOpen} 
      />
    </div>
  );
}
