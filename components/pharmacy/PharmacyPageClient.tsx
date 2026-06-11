"use client";
// Path: components/pharmacy/PharmacyPageClient.tsx

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryTab } from "@/components/pharmacy/InventoryTab";
import { ProcurementsHistoryTab } from "@/components/pharmacy/ProcurementsHistoryTab";
import { PharmacyNewSale } from "@/components/pharmacy/PharmacyNewSale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package, AlertTriangle, Plus, ShoppingBag, X,
} from "lucide-react";
import { useAppState } from "@/contexts/AppStateContext";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import type { InventoryItemWithMedicine, DbProcurement } from "@/types/core";

interface PharmacyPageClientProps {
  serverInventory: InventoryItemWithMedicine[];
  serverProcurements: DbProcurement[];
}

export default function PharmacyPageClient({
  serverInventory,
  serverProcurements,
}: PharmacyPageClientProps) {
  const [alertDismissed, setAlertDismissed] = useState(false);
  const { activeClinicId } = useAppState();
  const router = useRouter();



  const pharmacyQueryKeys = useMemo(
    () => [["pharmacy_inventory"], ["pharmacy_procurements"]] as unknown[][],
    [],
  );
  useRealtimeSubscription({ table: "inventory_items", clinicId: activeClinicId ?? "", queryKeys: pharmacyQueryKeys, onChange: () => router.refresh() });
  useRealtimeSubscription({ table: "procurements", clinicId: activeClinicId ?? "", queryKeys: pharmacyQueryKeys, onChange: () => router.refresh() });

  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(today.getMonth() + 1);

  const stats = useMemo(() => {
    const uniqueSkus = new Set(serverInventory.map((i) => i.medicine_id)).size;
    const totalUnits = serverInventory.reduce((s, i) => s + i.current_stock, 0);
    const lowStock = serverInventory.filter((i) => i.current_stock > 0 && i.current_stock <= i.reorder_level).length;
    const expiringSoon = serverInventory.filter((i) => {
      const exp = new Date(i.expiry_date);
      return exp > today && exp <= nextMonth;
    }).length;
    const expired = serverInventory.filter((i) => new Date(i.expiry_date) < today).length;
    return { uniqueSkus, totalUnits, lowStock, expiringSoon, expired };
  }, [serverInventory]);

  const showAlert = !alertDismissed && (stats.lowStock > 0 || stats.expiringSoon > 0 || stats.expired > 0);

  return (
    <div className="space-y-0">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="border-b border-border/50 bg-card px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Pharmacy</h1>
              <p className="hidden text-sm text-muted-foreground sm:block">
                Inventory · Dispensing · Purchase Records
              </p>
            </div>
          </div>

          {/* Actions row */}
          <div className="flex flex-wrap items-center gap-2">
            <PharmacyNewSale />
            <Button
              variant="outline"
              asChild
              className="gap-2 shrink-0"
            >
              <Link href="/pharmacy/receive">
                <Plus className="h-4 w-4" />
                Add Stock
              </Link>
            </Button>
          </div>
        </div>

        {/* ── Stats row ──────────────────────────────────────────────── */}
        {serverInventory.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "SKUs", value: stats.uniqueSkus, sub: "medicines" },
              { label: "Total Units", value: stats.totalUnits.toLocaleString(), sub: "in stock" },
              {
                label: "Low Stock",
                value: stats.lowStock,
                sub: "items",
                accent: stats.lowStock > 0 ? "text-amber-600" : undefined,
              },
              {
                label: "Expiring",
                value: stats.expiringSoon + stats.expired,
                sub: "in 30 days",
                accent: stats.expiringSoon + stats.expired > 0 ? "text-orange-600" : undefined,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col gap-0.5 rounded-lg border bg-background px-4 py-2.5"
              >
                <span className={`text-xl font-bold tabular-nums ${stat.accent ?? "text-foreground"}`}>
                  {stat.value}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                  <span className="text-[10px] text-muted-foreground/60">{stat.sub}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Alert Banner ────────────────────────────────────────────────── */}
      {showAlert && (
        <div className="flex items-start justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
          <div className="flex items-start gap-2 text-amber-800 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-x-2">
              {stats.expired > 0 && (
                <span>
                  <strong>{stats.expired}</strong> expired batch{stats.expired > 1 ? "es" : ""} in stock.
                </span>
              )}
              {stats.expiringSoon > 0 && (
                <span>
                  <strong>{stats.expiringSoon}</strong> batch{stats.expiringSoon > 1 ? "es" : ""} expiring within 30 days.
                </span>
              )}
              {stats.lowStock > 0 && (
                <span>
                  <strong>{stats.lowStock}</strong> medicine{stats.lowStock > 1 ? "s" : ""} below reorder level.
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30"
            onClick={() => setAlertDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* ── Empty State: Hero Dropzone (Day 0 Onboarding) ─────────────────── */}
      {serverInventory.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-20 sm:px-6">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
            <Package className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight">Welcome to your pharmacy</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm text-center">
            Start by scanning a purchase invoice or importing inventory from a spreadsheet.
          </p>
          <Button asChild className="mt-8 w-full max-w-xs gap-2">
            <Link href="/pharmacy/receive">
              <Plus className="h-4 w-4" /> Add Stock
            </Link>
          </Button>
        </div>
      ) : (
        /* ── Tabs (Populated State) ───────────────────────────────────── */
        <div className="px-4 pt-4 sm:px-6">
          <Tabs defaultValue="inventory" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="inventory" className="gap-1.5 text-sm">
                <Package className="h-3.5 w-3.5" />
                Stock
                <Badge variant="secondary" className="ml-1 text-xs h-4 px-1.5 rounded-full">{stats.uniqueSkus}</Badge>
              </TabsTrigger>
              <TabsTrigger value="procurements" className="gap-1.5 text-sm">
                <ShoppingBag className="h-3.5 w-3.5" />
                Purchase Records
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inventory" className="border-none p-0">
              <InventoryTab inventory={serverInventory} />
            </TabsContent>
            <TabsContent value="procurements" className="border-none p-0">
              <ProcurementsHistoryTab procurements={serverProcurements} />
            </TabsContent>
          </Tabs>
        </div>
      )}


    </div>
  );
}
