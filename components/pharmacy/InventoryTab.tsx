"use client";
import React, { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useInventory, InventoryItemWithMedicine } from "@/hooks/useInventory";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, PackageSearch, Pencil, ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MedicineGroup = {
  medicineId: number | null;
  medicineName: string;
  totalStock: number;
  earliestExpiry: Date;
  items: InventoryItemWithMedicine[];
};

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

type BatchStatus = "expired" | "expiring_soon" | "low_stock" | "ok";

function getBatchStatus(item: InventoryItemWithMedicine, today: Date, nextMonth: Date): BatchStatus {
  const expiry = new Date(item.expiry_date);
  if (expiry < today) return "expired";
  if (expiry <= nextMonth) return "expiring_soon";
  if (item.current_stock <= item.reorder_level) return "low_stock";
  return "ok";
}

const STATUS_PRIORITY: Record<BatchStatus, number> = { expired: 3, expiring_soon: 2, low_stock: 1, ok: 0 };

function getGroupStatus(items: InventoryItemWithMedicine[], today: Date, nextMonth: Date): BatchStatus {
  let worst: BatchStatus = "ok";
  for (const item of items) {
    const s = getBatchStatus(item, today, nextMonth);
    if (STATUS_PRIORITY[s] > STATUS_PRIORITY[worst]) worst = s;
  }
  return worst;
}

export function InventoryTab() {
  const { activeClinicRole } = useAuth();
  const { inventory, isLoading, updateItem } = useInventory();
  const [editingItem, setEditingItem] = useState<InventoryItemWithMedicine | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const canEditStock = activeClinicRole === "superadmin" || activeClinicRole === "staff";

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

  const handleSave = () => {
    if (!editingItem) return;
    updateItem.mutate({
      id: editingItem.id,
      batch_number: editingItem.batch_number,
      expiry_date: editingItem.expiry_date,
      current_stock: editingItem.current_stock,
      reorder_level: editingItem.reorder_level,
      unit_cost_price: editingItem.unit_cost_price,
      mrp: editingItem.mrp,
    }, {
      onSuccess: () => { setIsDialogOpen(false); setEditingItem(null); },
    });
  };

  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(today.getMonth() + 1);

  const groups = useMemo(() => (inventory ? groupByMedicine(inventory) : []), [inventory]);

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Spinner size="lg" /></div>;
  }

  return (
    <>
      {/* ── Mobile Card View ── */}
      <div className="md:hidden space-y-3">
        {groups.length === 0 ? (
          <Card className="p-6"><CardContent className="text-center text-muted-foreground">No stock records found.</CardContent></Card>
        ) : (
          groups.map((group) => {
            const groupKey = group.medicineId?.toString() ?? group.medicineName;
            const isExpanded = expandedGroups.has(groupKey);
            const groupStatus = getGroupStatus(group.items, today, nextMonth);

            return (
              <Card key={groupKey} className="p-4">
                <div className="flex items-start justify-between cursor-pointer" onClick={() => toggleExpand(groupKey)}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                      <h3 className="font-semibold text-sm">{group.medicineName}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 ml-6 text-sm">
                      <div><span className="text-muted-foreground">Total Stock: </span><span className="font-medium">{group.totalStock}</span></div>
                      <div><span className="text-muted-foreground">Earliest Expiry: </span><span className="font-medium">{group.earliestExpiry.toLocaleDateString("en-IN")}</span></div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-wrap shrink-0">
                    {groupStatus === "expired" && <Badge variant="destructive">Expired</Badge>}
                    {groupStatus === "expiring_soon" && <Badge variant="secondary" className="bg-yellow-500 text-white">Expiring Soon</Badge>}
                    {groupStatus === "low_stock" && <Badge variant="outline" className="text-red-500 border-red-500">Low Stock</Badge>}
                    {groupStatus === "ok" && <Badge variant="default" className="bg-green-500">In Stock</Badge>}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 ml-6 space-y-2 border-t pt-3">
                    {group.items.map((item) => {
                      const status = getBatchStatus(item, today, nextMonth);
                      return (
                        <div key={item.id} className="grid grid-cols-3 gap-2 text-sm p-2 rounded bg-muted/50">
                          <div><span className="text-muted-foreground">Batch: </span><span className="font-medium">{item.batch_number}</span></div>
                          <div><span className="text-muted-foreground">Exp: </span><span className={status === "expired" ? "text-destructive font-bold" : ""}>{item.expiry_date}</span></div>
                          <div><span className="text-muted-foreground">Stock: </span><span className="font-medium">{item.current_stock}</span></div>
                          <div><span className="text-muted-foreground">MRP: </span>₹{item.mrp?.toFixed(2) ?? "0.00"}</div>
                          <div><span className="text-muted-foreground">Cost: </span>₹{item.unit_cost_price?.toFixed(2) ?? "0.00"}</div>
                          {canEditStock && (
                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleEditClick(item); }}>
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
          })
        )}
      </div>

      {/* ── Desktop Table View ── */}
      <div className="hidden md:block">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageSearch className="w-5 h-5 text-primary" />
              Medicine Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Medicine</TableHead>
                  <TableHead className="text-right">Total Stock</TableHead>
                  <TableHead>Earliest Expiry</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No stock records found.</TableCell>
                  </TableRow>
                ) : (
                  groups.map((group) => {
                    const groupKey = group.medicineId?.toString() ?? group.medicineName;
                    const isExpanded = expandedGroups.has(groupKey);
                    const groupStatus = getGroupStatus(group.items, today, nextMonth);

                    return (
                      <React.Fragment key={groupKey}>
                        <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleExpand(groupKey)}>
                          <TableCell>{isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</TableCell>
                          <TableCell className="font-medium">{group.medicineName}</TableCell>
                          <TableCell className="text-right font-medium">{group.totalStock}</TableCell>
                          <TableCell>{group.earliestExpiry.toLocaleDateString("en-IN")}</TableCell>
                          <TableCell>
                            {groupStatus === "expired" && <Badge variant="destructive">Expired</Badge>}
                            {groupStatus === "expiring_soon" && <Badge variant="secondary" className="bg-yellow-500 text-white">Expiring Soon</Badge>}
                            {groupStatus === "low_stock" && <Badge variant="outline" className="text-red-500 border-red-500"><AlertTriangle className="w-3 h-3 mr-1" />Low Stock</Badge>}
                            {groupStatus === "ok" && <Badge variant="default" className="bg-green-500">In Stock</Badge>}
                          </TableCell>
                        </TableRow>
                        {isExpanded && group.items.map((item) => {
                          const status = getBatchStatus(item, today, nextMonth);
                          return (
                            <TableRow key={item.id} className="bg-muted/30">
                              <TableCell></TableCell>
                              <TableCell className="text-sm text-muted-foreground pl-8">Batch: {item.batch_number}</TableCell>
                              <TableCell className="text-right text-sm">{item.current_stock}</TableCell>
                              <TableCell className="text-sm">
                                <span className={status === "expired" ? "text-destructive font-bold" : ""}>{item.expiry_date}</span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>Cost: ₹{item.unit_cost_price?.toFixed(2) ?? "0.00"}</span>
                                  <span>MRP: ₹{item.mrp?.toFixed(2) ?? "0.00"}</span>
                                  {canEditStock && (
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); handleEditClick(item); }}>
                                      <Pencil className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Stock Item</DialogTitle></DialogHeader>
          {editingItem && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Medicine</Label>
                <p className="text-sm font-medium">{editingItem.medicines?.name || "Unknown"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batch">Batch No.</Label>
                  <Input
                    id="batch"
                    value={editingItem.batch_number}
                    onChange={(e) => setEditingItem({ ...editingItem, batch_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    type="date"
                    value={editingItem.expiry_date}
                    onChange={(e) => setEditingItem({ ...editingItem, expiry_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={editingItem.current_stock}
                    onChange={(e) => setEditingItem({ ...editingItem, current_stock: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reorder">Reorder Level</Label>
                  <Input
                    id="reorder"
                    type="number"
                    min="0"
                    value={editingItem.reorder_level}
                    onChange={(e) => setEditingItem({ ...editingItem, reorder_level: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost Price (₹)</Label>
                  <Input
                    id="cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingItem.unit_cost_price}
                    onChange={(e) => setEditingItem({ ...editingItem, unit_cost_price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mrp">MRP (₹)</Label>
                  <Input
                    id="mrp"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingItem.mrp}
                    onChange={(e) => setEditingItem({ ...editingItem, mrp: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={updateItem.isPending}>{updateItem.isPending ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
