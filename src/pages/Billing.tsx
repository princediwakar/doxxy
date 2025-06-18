import { useState, useEffect, useMemo, useCallback } from "react";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, Plus, Calendar, User, IndianRupee, CreditCard, Activity, Shield, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedBillingModal } from "@/components/billing/BillingModal";
import { getSupabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from '@tanstack/react-query';

const supabase = getSupabase();

interface BillWithDetails {
  id: string;
  amount: number;
  status: string;
  invoice_number?: string;
  description?: string;
  created_at: string;
  patient_name?: string;
}

interface BillingStats {
  totalRevenue: number;
  pendingAmount: number;
  paidBills: number;
  overdueAmount: number;
}

const Billing = () => {
  const { activeClinic } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [openModal, setOpenModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [bills, setBills] = useState<BillWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<BillingStats>({
    totalRevenue: 0,
    pendingAmount: 0,
    paidBills: 0,
    overdueAmount: 0
  });

  const fetchBills = useCallback(async () => {
    if (!activeClinic?.clinic_id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bills')
        .select(`
          *,
          patients(name),
          service_items,
          discount_percentage,
          tax_percentage,
          billing_type,
          notes
        `)
        .eq('clinic_id', activeClinic.clinic_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching bills:", error);
        toast.error("Failed to load bills");
        setBills([]);
      } else {
        const formattedBills: BillWithDetails[] = (data || []).map(bill => ({
          id: bill.id,
          amount: Number(bill.amount),
          status: bill.status,
          invoice_number: bill.invoice_number,
          description: bill.description,
          created_at: bill.created_at,
          patient_name: bill.patients?.name
        }));
        setBills(formattedBills);
      }
    } catch (error) {
      console.error("Error fetching bills:", error);
      toast.error("Failed to load bills");
      setBills([]);
    } finally {
      setLoading(false);
    }
  }, [activeClinic?.clinic_id]);

  const fetchStats = useCallback(async () => {
    if (!activeClinic?.clinic_id) return;
    
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('amount, status')
        .eq('clinic_id', activeClinic.clinic_id);

      if (error) {
        console.error("Error fetching billing stats:", error);
        setStats({
          totalRevenue: 0,
          pendingAmount: 0,
          paidBills: 0,
          overdueAmount: 0
        });
      } else if (data) {
        const totalRevenue = data.reduce((sum, bill) => sum + Number(bill.amount), 0);
        const pendingAmount = data
          .filter(bill => bill.status === 'Pending')
          .reduce((sum, bill) => sum + Number(bill.amount), 0);
        const paidBills = data.filter(bill => bill.status === 'Paid').length;
        const overdueAmount = data
          .filter(bill => bill.status === 'Overdue')
          .reduce((sum, bill) => sum + Number(bill.amount), 0);

        setStats({
          totalRevenue,
          pendingAmount,
          paidBills,
          overdueAmount
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, [activeClinic?.clinic_id]);

  useEffect(() => {
    if (activeClinic?.clinic_id) {
      fetchBills();
      fetchStats();
    }
  }, [activeClinic?.clinic_id, fetchBills, fetchStats]);

  const handleBillClick = (bill: BillWithDetails) => {
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

  const { filteredBills, totalPages } = useMemo(() => {
    const filtered = bills.filter((bill) =>
      bill.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

    return { filteredBills: paginatedData, totalPages };
  }, [bills, searchTerm, currentPage, itemsPerPage]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Paid": return "default";
      case "Pending": return "outline";
      case "Overdue": return "destructive";
      default: return "outline";
    }
  };

  if (!activeClinic) {
    return (
      <Card className="medical-card m-6">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Please select a clinic to view billing.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 ">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between space-y-4 sm:space-y-0">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">Billing</h1>
              <p className="text-muted-foreground">Manage patient bills and payments</p>
            </div>
          </div>
        </div>
        <Button 
          onClick={handleNewBill}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-medical"
        >
          <Plus size={18} className="mr-2" />
          Create Bill
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="medical-card shadow-medical">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-success">₹{stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-success/10 p-3 rounded-lg">
                <IndianRupee className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="medical-card shadow-medical">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold text-warning">₹{stats.pendingAmount.toFixed(2)}</p>
              </div>
              <div className="bg-warning/10 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="medical-card shadow-medical">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid Bills</p>
                <p className="text-2xl font-bold text-primary">{stats.paidBills}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <User className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="medical-card shadow-medical">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue Amount</p>
                <p className="text-2xl font-bold text-destructive">₹{stats.overdueAmount.toFixed(2)}</p>
              </div>
              <div className="bg-destructive/10 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Section */}
      <Card className="medical-card">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search bills by patient name, invoice number, or status..."
              className="pl-10 bg-background border-border focus:ring-primary"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted/50 rounded-md animate-pulse"></div>
          ))}
        </div>
      ) : (
        <Card className="medical-card shadow-medical">
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
                    className="cursor-pointer hover:bg-primary/5"
                    onClick={() => handleBillClick(bill)}
                  >
                    <TableCell className="font-medium">{bill.invoice_number}</TableCell>
                    <TableCell>{bill.patient_name || "-"}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {new Date(bill.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">₹{bill.amount?.toFixed(2)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {bill.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        bill.status === 'Paid' ? 'default' :
                        bill.status === 'Pending' ? 'secondary' :
                        bill.status === 'Overdue' ? 'destructive' :
                        'outline'
                      } className={`status-badge ${
                        bill.status === 'Paid' ? 'status-active' :
                        bill.status === 'Pending' ? 'status-pending' :
                        bill.status === 'Overdue' ? 'status-urgent' :
                        'status-inactive'
                      }`}>
                        {bill.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 px-6 pb-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (pageNum <= totalPages && pageNum > 0) {
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNum)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </Card>
      )}

      <EnhancedBillingModal
        open={openModal}
        onOpenChange={handleModalClose}
        bill={selectedBill}
        mode={selectedBill ? 'view' : 'create'}
      />
    </div>
  );
};

export default Billing;
