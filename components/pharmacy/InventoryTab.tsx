"use client";
// Path: components/pharmacy/InventoryTab.tsx
import React, { useState, useMemo } from "react";
import { useAppState } from "@/contexts/AppStateContext";
import type { InventoryItemWithMedicine } from "@/types/core";
import { updateItem as updateItemAction } from "@/actions/inventory";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle, Pencil, ChevronDown, ChevronRight, Search, SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

type MedicineGroup = {
  medicineId: number | null;
  medicineName: string;
  totalStock: number;
  earliestExpiry: Date;
  items: InventoryItemWithMedicine[];
};

type BatchStatus = "expired" | "expiring_soon" | "low_stock" | "out_of_stock" | "ok";
type FilterStatus = "all" | "low_stock" | "expiring_soon" | "expired" | "out_of_stock";

// ── Helpers ────────────────────────────────────────────────────────────────────

function groupByMedicine(inventory: InventoryItemWithMedicine[]): MedicineGroup[] {
  const map = new Map<string, MedicineGroup>();
  for (const item of inventory) {
    const key = item.medicine_id?.toString() ?? `__unnamed_${item.id}`;
    const existing = map.get(key);
    const expiryDate = new Date(item.expiry_date);
    if (existing) {
      existing.totalStock += item.current_stock;
      if (expiryDate < existing.earliestExpiry) existing.earliestExpiry = expiryDate;
      existing.items.push(item);
    } else {
      map.set(key, {
        medicineId: item.medicine_id,
        medicineName: item.medicines?.name ?? item.batch_number ?? "Unknown",
        totalStock: item.current_stock,
        earliestExpiry: expiryDate,
        items: [item],
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.medicineName.localeCompare(b.medicineName));
}

function getBatchStatus(item: InventoryItemWithMedicine, today: Date, nextMonth: Date): BatchStatus {
  if (item.current_stock <= 0) return "out_of_stock";
  const expiry = new Date(item.expiry_date);
  if (expiry < today) return "expired";
  if (expiry <= nextMonth) return "expiring_soon";
  if (item.current_stock <= item.reorder_level) return "low_stock";
  return "ok";
}

const STATUS_PRIORITY: Record<BatchStatus, number> = {
  expired: 4, out_of_stock: 3, expiring_soon: 2, low_stock: 1, ok: 0,
};

function getGroupStatus(items: InventoryItemWithMedicine[], today: Date, nextMonth: Date): BatchStatus {
  let worst: BatchStatus = "ok";
  for (const item of items) {
    const s = getBatchStatus(item, today, nextMonth);
    if (STATUS_PRIORITY[s] > STATUS_PRIORITY[worst]) worst = s;
  }
  return worst;
}

function StatusBadge({ status, compact }: { status: BatchStatus; compact?: boolean }) {
  const cls = cn("shrink-0", compact && "text-[10px] px-1.5 py-0 h-4");
  if (status === "expired") return <Badge variant="destructive" className={cls}>Expired</Badge>;
  if (status === "out_of_stock") return <Badge variant="destructive" className={cn(cls, "bg-gray-700")}>Out of Stock</Badge>;
  if (status === "expiring_soon") return <Badge className={cn(cls, "bg-orange-500 border-0 text-white")}>{compact ? "Exp" : "Expiring Soon"}</Badge>;
  if (status === "low_stock") return (
    <Badge variant="outline" className={cn(cls, "text-amber-600 border-amber-400")}>
      <AlertTriangle className={cn("mr-1", compact ? "w-2.5 h-2.5" : "w-3 h-3")} />
      {compact ? "Low" : "Low Stock"}
    </Badge>
  );
  return <Badge className={cn(cls, "bg-green-500 border-0 text-white")}>In Stock</Badge>;
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface InventoryTabProps {
  inventory: InventoryItemWithMedicine[];
  onOpenBulkImport?: () => void;
}

export function InventoryTab({ inventory, onOpenBulkImport }: InventoryTabProps) {
  const { activeClinicRole } = useAppState();
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItemWithMedicine | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const canEditStock = activeClinicRole === "superadmin" || activeClinicRole === "staff";

  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(today.getMonth() + 1);

  const toggleExpand = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleEditClick = (item: InventoryItemWithMedicine) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingItem) return;
    setIsSaving(true);
    try {
      const result = await updateItemAction({
        id: editingItem.id,
        batch_number: editingItem.batch_number,
        expiry_date: editingItem.expiry_date,
        current_stock: editingItem.current_stock,
        reorder_level: editingItem.reorder_level,
        unit_cost_price: editingItem.unit_cost_price,
        mrp: editingItem.mrp,
      });
      if ('error' in result && result.error) { toast.error(result.error); return; }
      setIsDialogOpen(false);
      setEditingItem(null);
      toast.success('Item updated');
    } catch {
      toast.error('Failed to update item');
    } finally {
      setIsSaving(false);
    }
  };

  const allGroups = useMemo(() => groupByMedicine(inventory ?? []), [inventory]);

  const filteredGroups = useMemo(() => {
    let groups = allGroups;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      groups = groups.filter((g) => g.medicineName.toLowerCase().includes(q));
    }

    if (filterStatus !== "all") {
      groups = groups.filter((g) => {
        const status = getGroupStatus(g.items, today, nextMonth);
        return status === filterStatus;
      });
    }

    return groups;
  }, [allGroups, searchQuery, filterStatus]);

  if (inventory.length === 0) return null;

  const activeFilters = filterStatus !== "all" ? 1 : 0;

  return (
    <>
      {/* Search + filter bar */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="inventory-search"
            placeholder="Search medicines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 h-9 shrink-0">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter
              {activeFilters > 0 && (
                <Badge className="ml-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] rounded-full">
                  {activeFilters}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-xs">Status Filter</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(["all", "low_stock", "expiring_soon", "expired", "out_of_stock"] as FilterStatus[]).map((f) => (
              <DropdownMenuCheckboxItem
                key={f}
                checked={filterStatus === f}
                onCheckedChange={() => setFilterStatus(f)}
                className="text-xs capitalize"
              >
                {f === "all" ? "All Items" : f.replace(/_/g, " ")}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {filteredGroups.length !== allGroups.length && (
          <span className="text-xs text-muted-foreground shrink-0">
            {filteredGroups.length} of {allGroups.length}
          </span>
        )}
      </div>

      {filteredGroups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No medicines match your search or filter.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── Mobile Card View ── */}
          <div className="md:hidden space-y-3">
            {filteredGroups.map((group) => {
              const groupKey = group.medicineId?.toString() ?? group.medicineName;
              const isExpanded = expandedGroups.has(groupKey);
              const groupStatus = getGroupStatus(group.items, today, nextMonth);

              return (
                <Card key={groupKey} className="overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer select-none"
                    onClick={() => toggleExpand(groupKey)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{group.medicineName}</h3>
                        <p className="text-xs text-muted-foreground">
                          {group.totalStock} units · exp {group.earliestExpiry.toLocaleDateString("en-IN", { month: "short", year: "2-digit" })}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={groupStatus} compact />
                  </div>

                  {isExpanded && (
                    <div className="border-t bg-muted/30 divide-y">
                      {group.items.map((item) => {
                        const status = getBatchStatus(item, today, nextMonth);
                        return (
                          <div key={item.id} className="p-3 grid grid-cols-3 gap-2 text-sm">
                            <div><span className="text-muted-foreground text-xs">Batch</span><p className="font-medium text-xs">{item.batch_number}</p></div>
                            <div><span className="text-muted-foreground text-xs">Expiry</span><p className={cn("text-xs font-medium", status === "expired" && "text-destructive")}>{new Date(item.expiry_date).toLocaleDateString("en-IN", { month: "short", year: "2-digit" })}</p></div>
                            <div><span className="text-muted-foreground text-xs">Stock</span><p className="font-medium text-xs">{item.current_stock} units</p></div>
                            <div><span className="text-muted-foreground text-xs">MRP</span><p className="text-xs">₹{item.mrp?.toFixed(2) ?? "0.00"}</p></div>
                            <div><span className="text-muted-foreground text-xs">Cost</span><p className="text-xs">₹{item.unit_cost_price?.toFixed(2) ?? "0.00"}</p></div>
                            {canEditStock && (
                              <Button variant="outline" size="sm" className="h-7 text-xs w-full" onClick={(e) => { e.stopPropagation(); handleEditClick(item); }}>
                                <Pencil className="w-3 h-3 mr-1" />Edit
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* ── Desktop Table View ── */}
          <div className="hidden md:block rounded-lg border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Medicine</TableHead>
                  <TableHead className="text-right">Total Stock</TableHead>
                  <TableHead>Earliest Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGroups.map((group) => {
                  const groupKey = group.medicineId?.toString() ?? group.medicineName;
                  const isExpanded = expandedGroups.has(groupKey);
                  const groupStatus = getGroupStatus(group.items, today, nextMonth);

                  return (
                    <React.Fragment key={groupKey}>
                      <TableRow
                        className="cursor-pointer hover:bg-muted/40 transition-colors"
                        onClick={() => toggleExpand(groupKey)}
                      >
                        <TableCell className="w-8 text-muted-foreground">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </TableCell>
                        <TableCell className="font-medium">{group.medicineName}</TableCell>
                        <TableCell className="text-right font-mono font-medium tabular-nums">{group.totalStock}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {group.earliestExpiry.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </TableCell>
                        <TableCell><StatusBadge status={groupStatus} /></TableCell>
                        <TableCell />
                      </TableRow>

                      {isExpanded && group.items.map((item) => {
                        const status = getBatchStatus(item, today, nextMonth);
                        return (
                          <TableRow key={item.id} className="bg-muted/20 hover:bg-muted/30 transition-colors">
                            <TableCell />
                            <TableCell>
                              <div className="pl-4 flex flex-col gap-0.5">
                                <span className="text-xs font-medium text-foreground">Batch: {item.batch_number}</span>
                                <span className="text-[11px] text-muted-foreground">
                                  MRP ₹{item.mrp?.toFixed(2) ?? "0.00"} · Cost ₹{item.unit_cost_price?.toFixed(2) ?? "0.00"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-mono tabular-nums text-sm">{item.current_stock}</TableCell>
                            <TableCell>
                              <span className={cn("text-sm", status === "expired" && "text-destructive font-semibold")}>
                                {new Date(item.expiry_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                              </span>
                            </TableCell>
                            <TableCell><StatusBadge status={status} compact /></TableCell>
                            <TableCell>
                              {canEditStock && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={(e) => { e.stopPropagation(); handleEditClick(item); }}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Stock Item</DialogTitle></DialogHeader>
          {editingItem && (
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Medicine</Label>
                <p className="text-sm font-semibold">{editingItem.medicines?.name || "Unknown"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-batch">Batch No.</Label>
                  <Input id="edit-batch" value={editingItem.batch_number} onChange={(e) => setEditingItem({ ...editingItem, batch_number: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-expiry">Expiry Date</Label>
                  <Input id="edit-expiry" type="date" value={editingItem.expiry_date} onChange={(e) => setEditingItem({ ...editingItem, expiry_date: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-stock">Stock</Label>
                  <Input id="edit-stock" type="number" min="0" value={editingItem.current_stock} onChange={(e) => setEditingItem({ ...editingItem, current_stock: parseInt(e.target.value, 10) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-reorder">Reorder Level</Label>
                  <Input id="edit-reorder" type="number" min="0" value={editingItem.reorder_level} onChange={(e) => setEditingItem({ ...editingItem, reorder_level: parseInt(e.target.value, 10) || 0 })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-cost">Cost Price (₹)</Label>
                  <Input id="edit-cost" type="number" min="0" step="0.01" value={editingItem.unit_cost_price} onChange={(e) => setEditingItem({ ...editingItem, unit_cost_price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-mrp">MRP (₹)</Label>
                  <Input id="edit-mrp" type="number" min="0" step="0.01" value={editingItem.mrp} onChange={(e) => setEditingItem({ ...editingItem, mrp: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
