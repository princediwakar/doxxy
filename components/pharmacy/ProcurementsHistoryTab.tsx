// components/pharmacy/ProcurementHistoryTab.tsx
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
import { Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const supabase = getSupabase();

export function ProcurementsHistoryTab() {
  const { activeClinic } = useAuth();

  const { data: procurements, isLoading } = useQuery({
    queryKey: ["pharmacy_procurements", activeClinic?.clinic_id],
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return [];
      
      const { data, error } = await supabase
        .from("procurements")
        .select("*")
        .eq("clinic_id", activeClinic.clinic_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!activeClinic?.clinic_id,
  });

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {procurements?.length === 0 ? (
          <Card className="p-6">
            <CardContent className="text-center text-muted-foreground">
              No purchase records found.
            </CardContent>
          </Card>
        ) : (
          procurements?.map((proc) => (
            <Card key={proc.id} className="p-4">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{proc.supplier_name}</p>
                    <p className="text-sm text-muted-foreground">{proc.invoice_number}</p>
                  </div>
                  <Badge 
                    variant={proc.status === 'Completed' ? 'default' : 'secondary'} 
                    className={proc.status === 'Completed' ? 'bg-green-500' : ''}
                  >
                    {proc.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Date</span>
                    <p className="font-medium">{proc.invoice_date}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total</span>
                    <p className="font-medium">₹{proc.total_amount.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Purchase Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Dealer</TableHead>
                  <TableHead>Bill No.</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {procurements?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No purchase records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  procurements?.map((proc) => (
                    <TableRow key={proc.id}>
                      <TableCell>{proc.invoice_date}</TableCell>
                      <TableCell className="font-medium">{proc.supplier_name}</TableCell>
                      <TableCell>{proc.invoice_number}</TableCell>
                      <TableCell>₹{proc.total_amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={proc.status === 'Completed' ? 'default' : 'secondary'} className={proc.status === 'Completed' ? 'bg-green-500' : ''}>
                          {proc.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
