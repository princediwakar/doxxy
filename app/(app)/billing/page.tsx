// src/pages/Billing.tsx
"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { Search, Plus, CreditCard, IndianRupee, FileText, Printer, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MonthSelector } from "@/components/ui/MonthSelector";
import { Suspense, lazy } from "react";
import { Spinner } from "@/components/ui/loading";

// Lazy load heavy billing components
const BillingModal = lazy(() =>
  import("@/components/billing/BillingModal").then((module) => ({
    default: module.BillingModal,
  }))
);
import { printBill } from "@/components/billing/billingPrintUtils";
import { useAuth } from "@/contexts/AuthContext";
import { useFABAction } from "@/hooks/useFABAction";
import { useBillingData } from "@/hooks/useBillingData";
import { DbPatient } from "@/types/core";
import { Bill } from "@/types/billing";

interface BillWithDetails extends Bill {
  patient_name?: string;
}

const Billing = () => {
  const { activeClinic } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  const itemsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<BillWithDetails | null>(
    null
  );
  const [modalMode, setModalMode] = useState<"create" | "view" | "edit">(
    "create"
  );

  // Handle FAB quick-action via ?action=new
  useFABAction("new", () => {
    setSelectedBill(null);
    setModalMode("create");
    setIsModalOpen(true);
  });

  const {
    bills,
    isLoadingBills,
    refetchBills,
    stats,
    refetchStats,
  } = useBillingData(activeClinic?.clinic_id, selectedMonth);

  const handleBillClick = (bill: BillWithDetails) => {
    setSelectedBill(bill);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEditBill = (bill: BillWithDetails) => {
    setSelectedBill(bill);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handlePrintBill = async (bill: BillWithDetails) => {
    // Create a minimal patient object for printing
    const patientForPrint: DbPatient | null = bill.patient_name
      ? {
          id: bill.patient_id || "",
          clinic_id: bill.clinic_id || "",
          name: bill.patient_name,
          medical_id: null,
          phone: null,
          email: null,
          age: null,
          gender: null,
          address: null,
          created_at: bill.created_at || new Date().toISOString(),
        }
      : null;

    await printBill(bill, patientForPrint, activeClinic?.clinics || null);
  };

  const handleNewBill = () => {
    setSelectedBill(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    refetchBills();
    refetchStats();
  };

  const { filteredBills, totalPages } = useMemo(() => {
    const filtered = bills.filter(
      (bill) =>
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
            <p className="text-muted-foreground">
              Please select a clinic to view billing.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
            <CreditCard className="w-5 h-5 " />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Billing</h1>
            <p className="text-muted-foreground">
              Manage patient bills and payments
            </p>
          </div>
        </div>
        <Button
          onClick={handleNewBill}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
        >
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
                <p className="text-2xl font-bold text-success">
                  ₹{stats?.totalRevenue.toFixed(2) || "0.00"}
                </p>
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
                <p className="text-2xl font-bold text-primary">
                  {stats?.totalBills || 0}
                </p>
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

        <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {isLoadingBills ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="h-20 bg-muted/50 rounded-md animate-pulse" />
              </Card>
            ))}
          </div>
        ) : filteredBills.length === 0 ? (
          <Card className="p-6">
            <CardContent className="text-center">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No bills found.</p>
            </CardContent>
          </Card>
        ) : (
          filteredBills.map((bill) => (
            <Card
              key={bill.id}
              className="cursor-pointer hover:bg-muted/50 touch-manipulation"
              onClick={() => handleBillClick(bill)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{bill.invoice_number}</h4>
                    <p className="text-sm text-muted-foreground">
                      {bill.patient_name || "N/A"}
                    </p>
                  </div>
                  <p className="font-semibold text-lg">
                    ₹{Number(bill.amount).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <span>
                    {bill.created_at
                      ? new Date(bill.created_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                {bill.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {bill.description}
                  </p>
                )}
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrintBill(bill);
                    }}
                  >
                    <Printer className="h-4 w-4 mr-1" />
                    Print
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditBill(bill);
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="w-[30%]">Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingBills ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading bills...
                </TableCell>
              </TableRow>
            ) : filteredBills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No bills found.
                </TableCell>
              </TableRow>
            ) : (
              filteredBills.map((bill) => (
                <TableRow
                  key={bill.id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleBillClick(bill)}
                >
                  <TableCell className="font-medium">
                    {bill.invoice_number}
                  </TableCell>
                  <TableCell>{bill.patient_name || "N/A"}</TableCell>
                  <TableCell>
                    {bill.created_at
                      ? new Date(bill.created_at).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>₹{Number(bill.amount).toFixed(2)}</TableCell>
                  <TableCell className="truncate max-w-xs">
                    {bill.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrintBill(bill);
                        }}
                        title="Print Bill"
                      >
                        Print
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditBill(bill);
                        }}
                        title="Edit Bill"
                      >
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isModalOpen && (
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-4">
              <Spinner size="sm" />
            </div>
          }
        >
          <BillingModal
            open={isModalOpen}
            onOpenChange={handleModalClose}
            bill={selectedBill}
            mode={modalMode}
            onModeChange={setModalMode}
          />
        </Suspense>
      )}

      <div className="flex items-center justify-center pt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage((p) => Math.max(p - 1, 1));
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
                  setCurrentPage((p) => Math.min(p + 1, totalPages));
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
