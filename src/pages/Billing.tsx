
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, DollarSign, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BillingModal } from "@/components/BillingModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Billing = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    paidBills: 0,
    overdueAmount: 0
  });

  useEffect(() => {
    fetchBills();
    fetchStats();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_bills_with_details');

      if (error) {
        console.error("Error fetching bills:", error);
        toast.error("Failed to load bills");
        setBills([]);
      } else {
        setBills(data || []);
      }
    } catch (error: any) {
      console.error("Error fetching bills:", error);
      toast.error("Failed to load bills");
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: statsData, error } = await supabase
        .rpc('get_billing_stats');

      if (error) {
        console.error("Error fetching stats:", error);
        setStats({
          totalRevenue: 0,
          pendingAmount: 0,
          paidBills: 0,
          overdueAmount: 0
        });
      } else if (statsData && statsData.length > 0) {
        const stat = statsData[0];
        setStats({
          totalRevenue: stat.total_revenue || 0,
          pendingAmount: stat.pending_amount || 0,
          paidBills: stat.paid_bills || 0,
          overdueAmount: stat.overdue_amount || 0
        });
      }
    } catch (error: any) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleBillClick = (bill: any) => {
    setSelectedBill(bill);
    setOpenModal(true);
  };

  const handleNewBill = () => {
    setSelectedBill(null);
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    fetchBills();
    fetchStats();
  };

  const filteredBills = bills.filter((bill) =>
    bill.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Paid": return "default";
      case "Pending": return "outline";
      case "Overdue": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">Manage patient bills and payments</p>
        </div>
        <Button onClick={handleNewBill}>
          <Plus size={18} className="mr-2" />
          Create Bill
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-green-500 mr-2" />
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-orange-500 mr-2" />
              <div className="text-2xl font-bold">${stats.pendingAmount.toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <User className="h-5 w-5 text-blue-500 mr-2" />
              <div className="text-2xl font-bold">{stats.paidBills}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-red-500 mr-2" />
              <div className="text-2xl font-bold">${stats.overdueAmount.toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search bills by patient name, invoice number, or status..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted/50 rounded-md animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    {searchTerm ? "No bills match your search" : "No bills found"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredBills.map((bill) => (
                  <TableRow 
                    key={bill.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleBillClick(bill)}
                  >
                    <TableCell className="font-medium">{bill.invoice_number}</TableCell>
                    <TableCell>{bill.patient_name || "-"}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {new Date(bill.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">${bill.amount?.toFixed(2)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {bill.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(bill.status)}>
                        {bill.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <BillingModal
        open={openModal}
        onOpenChange={handleModalClose}
        bill={selectedBill}
      />
    </div>
  );
};

export default Billing;
