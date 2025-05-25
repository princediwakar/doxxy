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
import { Patient } from "@/types/database";
import { AppointmentType } from "./AppointmentModal";

// Define interface for the fetched appointment data with joined patient and doctor details
interface FetchedAppointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  time: string;
  type: "Walk-in" | "Digital";
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  department: "Neurology" | "Ophthalmology";
  notes: string | null;
  created_at: string;
  // Joined patient and doctor details
  patients: { id: string; name: string } | null; // Assuming single object from inner join
  doctors: { id: string; name: string } | null; // Assuming single object from inner join
}

interface BillingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: any | null;
  appointment?: AppointmentType | null;
}

export function BillingModal({ open, onOpenChange, bill, appointment }: BillingModalProps) {
  const isNewBill = !bill;
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    patient_id: "",
    appointment_id: "",
    amount: "",
    status: "Pending" as "Paid" | "Pending" | "Overdue",
    invoice_number: "",
    description: ""
  });

  useEffect(() => {
    if (open) {
      fetchAppointments();
      fetchPatients();
      
      if (bill) {
        setFormData({
          patient_id: bill.patient_id || "",
          appointment_id: bill.appointment_id || "",
          amount: bill.amount?.toString() || "",
          status: bill.status as "Paid" | "Pending" | "Overdue" || "Pending",
          invoice_number: bill.invoice_number || "",
          description: bill.description || ""
        });
      } else {
        setFormData({
          patient_id: "",
          appointment_id: "",
          amount: "",
          status: "Pending",
          invoice_number: `INV-${Date.now()}`,
          description: ""
        });
        if (appointment) {
          setFormData(prev => ({
            ...prev,
            patient_id: appointment.patient_id || "",
            appointment_id: appointment.id || "",
          }));
        }
      }
    }
  }, [open, bill, appointment]);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients!inner(id, name),
          doctors!inner(id, name)
        `)
        .order('date', { ascending: false }) as { data: FetchedAppointment[] | null, error: any }; // Cast fetched data
      
      if (error) {
        console.error("Error fetching appointments:", error);
        setAppointments([]);
      } else {
        // Map fetched data to match AppointmentType structure
        const formattedAppointments: AppointmentType[] = (data || []).map(apt => ({
          ...apt,
          // Assuming fetched patients and doctors are single objects from inner join
          patients: apt.patients ? [{ name: apt.patients.name }] : null, // Map to { name: string }[]
          doctors: apt.doctors ? [{ name: apt.doctors.name, specialization: '' }] : null, // Map to { name: string, specialization: string }[]
          // Add other properties from AppointmentType that might be missing in the fetched data if necessary
          time: apt.time || '', // Ensure time is a string
          type: apt.type || 'Walk-in', // Ensure type has a default or is mapped correctly
          status: apt.status || 'Scheduled', // Ensure status has a default or is mapped correctly
          department: apt.department || 'Neurology', // Ensure department has a default or is mapped correctly
        }));
        setAppointments(formattedAppointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Error fetching patients:", error);
        setPatients([]);
      } else {
        setPatients(data || []);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "appointment_id") {
      const selectedAppointment = appointments.find((a: any) => a.id === value);
      if (selectedAppointment) {
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          patient_id: selectedAppointment.patient_id
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.patient_id || !formData.appointment_id || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const billData = {
        patient_id: formData.patient_id,
        appointment_id: formData.appointment_id,
        amount: parseFloat(formData.amount),
        status: formData.status,
        invoice_number: formData.invoice_number,
        description: formData.description
      };
      
      if (isNewBill) {
        const { error } = await supabase
          .from('bills')
          .insert(billData);
          
        if (error) {
          console.error("Error creating bill:", error);
          throw error;
        }
        
        toast.success("Bill created successfully");
      } else {
        const { error } = await supabase
          .from('bills')
          .update(billData)
          .eq('id', bill.id);
          
        if (error) {
          console.error("Error updating bill:", error);
          throw error;
        }
        
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

  const filteredAppointments = formData.patient_id 
    ? appointments.filter((a: any) => a.patient_id === formData.patient_id)
    : appointments;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isNewBill ? "Create Bill" : "Bill Details"}</DialogTitle>
          <DialogDescription>
            {isNewBill 
              ? "Create a new bill for an appointment." 
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
            <Label htmlFor="appointment">Appointment</Label>
            <Select 
              value={formData.appointment_id} 
              onValueChange={(value) => handleSelectChange("appointment_id", value)}
              disabled={!formData.patient_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select appointment" />
              </SelectTrigger>
              <SelectContent>
                {filteredAppointments.map((appointment: any) => (
                  <SelectItem key={appointment.id} value={appointment.id}>
                    {appointment.date} - {appointment.time} ({appointment.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
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
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full h-20 px-3 py-2 border rounded-md"
              placeholder="Bill description or notes..."
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
