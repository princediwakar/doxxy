
import { useState } from "react";
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
import { Search, Plus, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Mock billing data
const billingData = [
  { id: 1, patientName: "Sarah Johnson", appointmentDate: "10/05/2023", doctor: "Dr. Michael Chen", department: "Neurology", amount: 150.00, status: "Paid" },
  { id: 2, patientName: "Robert Williams", appointmentDate: "22/04/2023", doctor: "Dr. Emily Parker", department: "Ophthalmology", amount: 200.00, status: "Pending" },
  { id: 3, patientName: "Emma Davis", appointmentDate: "15/03/2023", doctor: "Dr. Michael Chen", department: "Neurology", amount: 120.00, status: "Pending" },
  { id: 4, patientName: "Thomas Brown", appointmentDate: "05/05/2023", doctor: "Dr. James Wilson", department: "Neurology", amount: 180.00, status: "Paid" },
  { id: 5, patientName: "Lisa Wilson", appointmentDate: "30/04/2023", doctor: "Dr. Sarah Adams", department: "Ophthalmology", amount: 250.00, status: "Overdue" },
];

const Billing = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Filter bills based on search term and status filter
  const filteredBills = billingData.filter((bill) => {
    let match = bill.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               bill.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter && statusFilter !== 'all') {
      match = match && bill.status === statusFilter;
    }
    
    return match;
  });

  const handleMarkAsPaid = (billId: number) => {
    toast({
      title: "Bill marked as paid",
      description: "The bill has been successfully marked as paid.",
    });
  };

  const handleSendReminder = (billId: number) => {
    toast({
      title: "Payment reminder sent",
      description: "A payment reminder has been sent to the patient.",
    });
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "Paid": return "default";
      case "Pending": return "outline";
      case "Overdue": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">Manage and track patient billing</p>
        </div>
        <Button>
          <Plus size={18} className="mr-2" />
          Create Bill
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patients or doctors..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-[200px]">
          <Select value={statusFilter || "all"} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead className="hidden md:table-cell">Doctor</TableHead>
              <TableHead className="hidden md:table-cell">Department</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{bill.patientName}</div>
                    <div className="text-sm text-muted-foreground">{bill.appointmentDate}</div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{bill.doctor}</TableCell>
                <TableCell className="hidden md:table-cell">{bill.department}</TableCell>
                <TableCell>${bill.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(bill.status)}>
                    {bill.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {bill.status !== "Paid" ? (
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleMarkAsPaid(bill.id)}>
                        Mark Paid
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleSendReminder(bill.id)}>
                        Send Reminder
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm">
                      <FileText size={16} className="mr-2" /> Invoice
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredBills.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No bills found. Try adjusting your search or filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default Billing;
