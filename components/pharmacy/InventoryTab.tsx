// components/pharmacy/InventoryTab.tsx
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, PackageSearch, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const supabase = getSupabase();

export function InventoryTab() {
  const { activeClinic, activeClinicRole } = useAuth();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newStock, setNewStock] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const canEditStock = activeClinicRole === "superadmin" || activeClinicRole === "staff";

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["pharmacy_inventory", activeClinic?.clinic_id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return [];

      const { data, error } = await supabase
        .from("inventory_items")
        .select(`
          *,
          medicines:medicine_id (name, manufacturer_name)
        `)
        .eq("clinic_id", activeClinic.clinic_id)
        .order("expiry_date", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!activeClinic?.clinic_id,
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ itemId, newStock }: { itemId: string; newStock: number }) => {
      const { error } = await supabase
        .from("inventory_items")
        .update({ current_stock: newStock } as any)
        .eq("id", itemId);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy_inventory"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      setNewStock("");
    },
  });

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setNewStock(item.current_stock.toString());
    setIsDialogOpen(true);
  };

  const handleSaveStock = () => {
    if (!editingItem || newStock === "") return;
    const stockValue = parseInt(newStock, 10);
    if (isNaN(stockValue) || stockValue < 0) return;

    updateStockMutation.mutate({ itemId: editingItem.id, newStock: stockValue });
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(today.getMonth() + 1);

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {inventory?.length === 0 ? (
          <Card className="p-6">
            <CardContent className="text-center text-muted-foreground">
              No stock records found. Start by adding a purchase order.
            </CardContent>
          </Card>
        ) : (
          inventory?.map((item) => {
            const expiryDate = new Date(item.expiry_date);
            const isExpiringSoon = expiryDate <= nextMonth && expiryDate >= today;
            const isExpired = expiryDate < today;
            const isLowStock = item.current_stock <= item.reorder_level;

            return (
              <Card key={item.id} className="p-4">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">
                      {(item.medicines as any)?.name || "Unknown"}
                    </CardTitle>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {isExpired && <Badge variant="destructive">Expired</Badge>}
                      {isExpiringSoon && <Badge variant="secondary" className="bg-yellow-500 text-white">Expiring Soon</Badge>}
                      {isLowStock && <Badge variant="outline" className="text-red-500 border-red-500">Low Stock</Badge>}
                      {!isExpired && !isExpiringSoon && !isLowStock && <Badge variant="default" className="bg-green-500">In Stock</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Batch No.</span>
                      <p className="font-medium">{item.batch_number}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expiry</span>
                      <p className={isExpired ? "text-destructive font-bold" : ""}>{item.expiry_date}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Stock</span>
                      <p className={isLowStock ? "text-destructive font-bold" : ""}>{item.current_stock}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">MRP</span>
                      <p className="font-medium">₹{item.mrp?.toFixed(2) ?? "0.00"}</p>
                    </div>
                    {canEditStock && (
                      <div className="col-span-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleEditClick(item)}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Update Stock
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
)}
        </div>

        {/* Desktop Table View */}
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
                    <TableHead>Medicine</TableHead>
                    <TableHead>Packet No.</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Cost (₹)</TableHead>
                    <TableHead>MRP (₹)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No stock records found. Start by adding a purchase order.
                      </TableCell>
                    </TableRow>
                  ) : (
                    inventory?.map((item) => {
                      const expiryDate = new Date(item.expiry_date);
                      const isExpiringSoon = expiryDate <= nextMonth && expiryDate >= today;
                      const isExpired = expiryDate < today;
                      const isLowStock = item.current_stock <= item.reorder_level;

                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {(item.medicines as any)?.name || "Unknown"}
                          </TableCell>
                          <TableCell>{item.batch_number}</TableCell>
                          <TableCell>
                            <span className={isExpired ? "text-destructive font-bold" : ""}>
                              {item.expiry_date}
                            </span>
                          </TableCell>
                          <TableCell>
                            {canEditStock ? (
                              <div className="flex items-center gap-2">
                                <span className={isLowStock ? "text-destructive font-bold" : ""}>
                                  {item.current_stock}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleEditClick(item)}
                                >
                                  <Pencil className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <span className={isLowStock ? "text-destructive font-bold" : ""}>
                                {item.current_stock}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.unit_cost_price?.toFixed(2) ?? "0.00"}
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.mrp?.toFixed(2) ?? "0.00"}
                          </TableCell>
                          <TableCell className="flex gap-2">
                            {isExpired && <Badge variant="destructive">Expired</Badge>}
                            {isExpiringSoon && <Badge variant="secondary" className="bg-yellow-500 text-white">Expiring Soon</Badge>}
                            {isLowStock && <Badge variant="outline" className="text-red-500 border-red-500"><AlertTriangle className="w-3 h-3 mr-1" /> Low Stock</Badge>}
                            {!isExpired && !isExpiringSoon && !isLowStock && <Badge variant="default" className="bg-green-500">In Stock</Badge>}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Stock</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Medicine</Label>
                <p className="text-sm font-medium">{(editingItem?.medicines as any)?.name || "Unknown"}</p>
              </div>
              <div className="space-y-2">
                <Label>Packet No.</Label>
                <p className="text-sm text-muted-foreground">{editingItem?.batch_number}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">New Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveStock}
                disabled={updateStockMutation.isPending}
              >
                {updateStockMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </>
  );
}
