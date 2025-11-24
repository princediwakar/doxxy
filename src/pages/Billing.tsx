import { useState, useMemo } from "react";
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
import { Search, Plus, CreditCard, IndianRupee, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BillingModal } from "@/components/billing/BillingModal";
import { MonthSelector } from "@/components/ui/MonthSelector";
import { getSupabase } from '@/integrations/supabase/client';
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Database } from "@/integrations/supabase/types";

const supabase = getSupabase();

type BillRow = Database["public"]["Tables"]["bills"]["Row"];

interface BillWithDetails extends BillRow {
  patient_name?: string;
}

interface BillingStats {
  totalRevenue: number;
  totalBills: number;
}

const Billing = () => {
  const { activeClinic } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const itemsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<BillWithDetails | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'view' | 'edit'>('create');
  
  const { data: bills = [], isLoading: isLoadingBills, refetch: refetchBills } = useQuery({
    queryKey: ['bills', activeClinic?.clinic_id, selectedMonth],
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return [];

      const [year, month] = selectedMonth.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const { data, error } = await supabase
        .from('bills')
        .select(`*, patients(name)`)
        .eq('clinic_id', activeClinic.clinic_id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);

      return (data || []).map(b => {
        const { patients, ...billData } = b;
        return {
          ...billData,
          patient_name: patients?.name,
        };
      }) as BillWithDetails[];
    },
    enabled: !!activeClinic?.clinic_id
  });

  const { data: stats, refetch: refetchStats } = useQuery<BillingStats, Error>({
    queryKey: ['billingStats', activeClinic?.clinic_id, selectedMonth],
    queryFn: async () => {
      if (!activeClinic?.clinic_id) return { totalRevenue: 0, totalBills: 0 };

      const [year, month] = selectedMonth.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const { data, error } = await supabase
        .from('bills')
        .select('amount')
        .eq('clinic_id', activeClinic.clinic_id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw new Error(error.message);

      const totalRevenue = data.reduce((sum, bill) => sum + Number(bill.amount), 0);
      const totalBills = data.length;

      return { totalRevenue, totalBills };
    },
    enabled: !!activeClinic?.clinic_id
  });

  const handleBillClick = (bill: BillWithDetails) => {
    setSelectedBill(bill);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditBill = (bill: BillWithDetails) => {
    setSelectedBill(bill);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleNewBill = () => {
    setSelectedBill(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    refetchBills();
    refetchStats();
  };

  const { filteredBills, totalPages } = useMemo(() => {
    const filtered = bills.filter((bill) =>
      bill.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

    return { filteredBills: paginatedData, totalPages };
  }, [bills, searchTerm, currentPage, itemsPerPage]);

  if (!activeClinic) {
    return (
      <Card className="m-6">
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between space-y-4 sm:space-y-0">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
              <CreditCard className="w-5 h-5 " />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Billing</h1>
              <p className="text-muted-foreground">Manage patient bills and payments</p>
            </div>
          </div>
        </div>
        <Button onClick={handleNewBill} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus size={18} className="mr-2" />
          Create Bill
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-success">₹{stats?.totalRevenue.toFixed(2) || '0.00'}</p>
              </div>
              <div className="bg-success/10 p-3 rounded-lg">
                <IndianRupee className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bills</p>
                <p className="text-2xl font-bold text-primary">{stats?.totalBills || 0}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-border focus:ring-primary"
          />
        </div>

        <MonthSelector
          value={selectedMonth}
          onChange={setSelectedMonth}
        />
      </div>

      <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
              <TableHead>Invoice #</TableHead>
                <TableHead>Patient</TableHead>
              <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
              <TableHead className="w-[40%]">Description</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {isLoadingBills ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Loading bills...</TableCell>
              </TableRow>
            ) : filteredBills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No bills found.</TableCell>
              </TableRow>
            ) : (
              filteredBills.map((bill) => (
                <TableRow key={bill.id} className="hover:bg-muted/50">
                  <TableCell
                    className="font-medium cursor-pointer"
                    onClick={() => handleBillClick(bill)}
                  >
                    {bill.invoice_number}
                  </TableCell>
                  <TableCell
                    className="cursor-pointer"
                    onClick={() => handleBillClick(bill)}
                  >
                    {bill.patient_name || 'N/A'}
                  </TableCell>
                  <TableCell
                    className="cursor-pointer"
                    onClick={() => handleBillClick(bill)}
                  >
                    {bill.created_at ? new Date(bill.created_at).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell
                    className="cursor-pointer"
                    onClick={() => handleBillClick(bill)}
                  >
                    ₹{Number(bill.amount).toFixed(2)}
                  </TableCell>
                  <TableCell
                    className="truncate max-w-xs cursor-pointer"
                    onClick={() => handleBillClick(bill)}
                  >
                    {bill.description}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditBill(bill)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
              )}
            </TableBody>
          </Table>
      </div>

      {isModalOpen && (
        <BillingModal
          open={isModalOpen}
          onOpenChange={handleModalClose}
          bill={selectedBill}
          mode={modalMode}
          onModeChange={setModalMode}
        />
      )}

      <div className="flex items-center justify-center pt-4">
              <Pagination>
                <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  setCurrentPage(p => Math.max(p - 1, 1)); 
                }} 
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i}>
                <PaginationLink 
                  href="#" 
                  isActive={currentPage === i + 1} 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    setCurrentPage(i + 1); 
                  }}
                >
                  {i + 1}
                          </PaginationLink>
                        </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  setCurrentPage(p => Math.min(p + 1, totalPages)); 
                }} 
              />
            </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
    </div>
  );
};

export default Billing;


