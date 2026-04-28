// components/pharmacy/InventoryTab.tsx
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
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
import { AlertTriangle, PackageSearch } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const supabase = getSupabase();

export function InventoryTab() {
  const { activeClinic } = useAuth();

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

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(today.getMonth() + 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PackageSearch className="w-5 h-5 text-primary" />
          Current Stock
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medicine</TableHead>
              <TableHead>Batch No.</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No inventory records found. Start by adding a procurement bill.
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
                      <span className={isLowStock ? "text-destructive font-bold" : ""}>
                        {item.current_stock}
                      </span>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      {isExpired && <Badge variant="destructive">Expired</Badge>}
                      {isExpiringSoon && <Badge variant="secondary" className="bg-yellow-500 text-white">Expiring</Badge>}
                      {isLowStock && <Badge variant="outline" className="text-red-500 border-red-500"><AlertTriangle className="w-3 h-3 mr-1" /> Low</Badge>}
                      {!isExpired && !isExpiringSoon && !isLowStock && <Badge variant="default" className="bg-green-500">Healthy</Badge>}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
