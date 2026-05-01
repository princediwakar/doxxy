"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBillingData } from "@/hooks/useBillingData";
import { useOutstandingBalances } from "@/hooks/useOutstandingBalances";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MonthSelector } from "@/components/ui/MonthSelector";
import { Spinner } from "@/components/ui/loading";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, IndianRupee, CreditCard, AlertCircle, FileText } from "lucide-react";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import type { BillWithDetails } from "@/types/billing";

const BillingModal = dynamic(() =>
  import("@/components/billing/BillingModal").then((mod) => mod.BillingModal)
);

const ITEMS_PER_PAGE = 10;

type StatColor = "success" | "primary" | "warning" | "destructive";

const colorClasses: Record<StatColor, { text: string; bg: string }> = {
  success: { text: "text-success", bg: "bg-success/10" },
  primary: { text: "text-primary", bg: "bg-primary/10" },
  warning: { text: "text-warning", bg: "bg-warning/10" },
  destructive: { text: "text-destructive", bg: "bg-destructive/10" },
};

export default function FinancialsPage() {
  const { activeClinic } = useAuth();
  const clinicId = activeClinic?.clinic_id;

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [selectedBill, setSelectedBill] = useState<BillWithDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { bills, isLoadingBills, stats } = useBillingData(clinicId, selectedMonth);
  const { data: outstandingData } = useOutstandingBalances();

  const totalOutstanding = useMemo(
    () => (outstandingData ?? []).reduce((sum, p) => sum + p.total_due, 0),
    [outstandingData]
  );

  const statCards = useMemo(() => [
    { label: "Monthly Revenue", value: `₹${stats?.totalRevenue.toFixed(2) || "0.00"}`, icon: IndianRupee, color: "success" as StatColor },
    { label: "Monthly Bills", value: stats?.totalBills || 0, icon: CreditCard, color: "primary" as StatColor },
    { label: "Outstanding", value: `₹${totalOutstanding.toFixed(2)}`, icon: AlertCircle, color: "warning" as StatColor },
    { label: "Patients with Dues", value: outstandingData?.length ?? 0, icon: FileText, color: "destructive" as StatColor },
  ], [stats, totalOutstanding, outstandingData]);

  const { filteredBills, totalPages } = useMemo(() => {
    const q = searchTerm.toLowerCase();
    const filtered = bills.filter(
      (bill) =>
        bill.patient_name?.toLowerCase().includes(q) ||
        bill.invoice_number?.toLowerCase().includes(q) ||
        bill.description?.toLowerCase().includes(q)
    );
    const pages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return { filteredBills: filtered.slice(start, start + ITEMS_PER_PAGE), totalPages: pages };
  }, [bills, searchTerm, currentPage]);

  if (!activeClinic) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Select a clinic to view financials.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
          <IndianRupee className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Financials</h1>
          <p className="text-muted-foreground">Revenue, bills, and outstanding balances.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          const cls = colorClasses[s.color];
          return (
            <Card key={s.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className={`text-2xl font-bold ${cls.text}`}>{s.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${cls.bg}`}>
                    <Icon className={`w-5 h-5 ${cls.text}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bills..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-10"
          />
        </div>
        <MonthSelector value={selectedMonth} onChange={(v) => { setSelectedMonth(v); setCurrentPage(1); }} />
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingBills ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">Loading bills...</TableCell></TableRow>
            ) : filteredBills.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No bills found.</TableCell></TableRow>
            ) : (
              filteredBills.map((bill) => (
                <TableRow
                  key={bill.id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => { setSelectedBill(bill); setIsModalOpen(true); }}
                >
                  <TableCell className="font-medium">{bill.invoice_number}</TableCell>
                  <TableCell>{bill.patient_name || "N/A"}</TableCell>
                  <TableCell>{bill.created_at ? new Date(bill.created_at).toLocaleDateString() : "N/A"}</TableCell>
                  <TableCell className="text-right">₹{Number(bill.amount).toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-center pt-2">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.max(p - 1, 1)); }} />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink href="#" isActive={currentPage === i + 1} onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.min(p + 1, totalPages)); }} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {isModalOpen && (
        <Suspense fallback={<div className="flex items-center justify-center p-4"><Spinner size="sm" /></div>}>
          <BillingModal open={isModalOpen} onOpenChange={() => setIsModalOpen(false)} bill={selectedBill} mode="view" />
        </Suspense>
      )}
    </div>
  );
}
