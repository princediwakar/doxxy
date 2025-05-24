
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BillingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: any | null;
}

export function BillingModal({ open, onOpenChange, bill }: BillingModalProps) {
  const isNewBill = !bill;
  const [consultations, setConsultations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    patient_id: "",
    consultation_id: "",
    amount: "",
    status: "Pending" as "Paid" | "Pending" | "Overdue",
    invoice_number: ""
  });

  useEffect(() => {
    if (open) {
      fetchConsultations();
      fetchPatients();
      
      if (bill) {
        setFormData({
          patient_id: bill.patient_id || "",
          consultation_id: bill.consultation_id || "",
          amount: bill.amount?.toString() || "",
          status: bill.status as "Paid" | "Pending" | "Overdue" || "Pending",
          invoice_number: bill.invoice_number || ""
        });
      } else {
        setFormData({
          patient_id: "",
          consultation_id: "",
          amount: "",
          status: "Pending",
          invoice_number: `INV-${Date.now()}`
        });
      }
    }
  }, [open, bill]);

  const fetchConsultations = async () => {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          id, 
          created_at,
          patients (name),
          doctors (name)
        `);
      
      if (error) throw error;
      setConsultations(data || []);
    } catch (error) {
      console.error("Error fetching consultations:", error);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, name');
      
      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.patient_id || !formData.consultation_id || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const billData = {
        patient_id: formData.patient_id,
        consultation_id: formData.consultation_id,
        amount: parseFloat(formData.amount),
        status: formData.status,
        invoice_number: formData.invoice_number
      };
      
      if (isNewBill) {
        const { data, error } = await supabase
          .from('bills')
          .insert(billData)
          .select();
          
        if (error) throw error;
        
        toast.success("Bill created successfully");
      } else {
        const { data, error } = await supabase
          .from('bills')
          .update(billData)
          .eq('id', bill.id)
          .select();
          
        if (error) throw error;
        
        toast.success("Bill updated successfully");
      }
      
      window.location.reload();
    } catch (error) {
      console.error("Error saving bill:", error);
      toast.error(isNewBill ? "Failed to create bill" : "Failed to update bill");
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Paid": return "default";
      case "Pending": return "outline";
      case "Overdue": return "destructive";
      default: return "outline";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isNewBill ? "Create Bill" : "Bill Details"}</DialogTitle>
          <DialogDescription>
            {isNewBill 
              ? "Create a new bill for a consultation." 
              : "View and edit bill details."}
          </DialogDescription>
        </DialogHeader>

        {!isNewBill && (
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Current Status</h3>
            <Badge variant={getStatusColor(bill?.status)}>
              {bill?.status}
            </Badge>
          </div>
        )}

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="invoice_number">Invoice Number</Label>
            <Input
              id="invoice_number"
              name="invoice_number"
              value={formData.invoice_number}
              onChange={handleChange}
              placeholder="Invoice number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="patient">Patient</Label>
            <Select 
              value={formData.patient_id} 
              onValueChange={(value) => handleSelectChange("patient_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient: any) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="consultation">Consultation</Label>
            <Select 
              value={formData.consultation_id} 
              onValueChange={(value) => handleSelectChange("consultation_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select consultation" />
              </SelectTrigger>
              <SelectContent>
                {consultations.map((consultation: any) => (
                  <SelectItem key={consultation.id} value={consultation.id}>
                    {consultation.patients?.name} - {new Date(consultation.created_at).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => handleSelectChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : isNewBill ? "Create Bill" : "Update Bill"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
