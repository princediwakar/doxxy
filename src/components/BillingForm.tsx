
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface BillingFormProps {
  bill?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const BillingForm = ({ bill, onSubmit, onCancel }: BillingFormProps) => {
  const { toast } = useToast();
  const [patients, setPatients] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    patient_id: bill?.patient_id || "",
    consultation_id: bill?.consultation_id || "",
    amount: bill?.amount || "",
    status: bill?.status || "Pending",
    notes: bill?.notes || ""
  });

  // Mock data for patients and consultations
  useEffect(() => {
    // In a real app, fetch from Supabase
    setPatients([
      { id: "1", name: "Sarah Johnson" },
      { id: "2", name: "Robert Williams" },
      { id: "3", name: "Emma Davis" }
    ]);

    setConsultations([
      { id: "1", patient_id: "1", doctor: "Dr. Michael Chen", date: "2023-05-15", department: "Neurology" },
      { id: "2", patient_id: "2", doctor: "Dr. Emily Parker", date: "2023-05-15", department: "Ophthalmology" },
      { id: "3", patient_id: "3", doctor: "Dr. Michael Chen", date: "2023-05-16", department: "Neurology" }
    ]);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    // If selecting a patient, filter consultations to that patient
    if (name === "patient_id") {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        consultation_id: "" // Reset consultation when patient changes
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.patient_id || !formData.consultation_id || !formData.amount) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real app, send to Supabase
      onSubmit(formData);
      toast({
        title: bill ? "Bill updated" : "Bill created",
        description: bill 
          ? "The billing information has been updated successfully." 
          : "A new bill has been created successfully."
      });
    } catch (error) {
      console.error("Error saving bill:", error);
      toast({
        title: "Error",
        description: "Failed to save billing information.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get filtered consultations based on selected patient
  const filteredConsultations = formData.patient_id 
    ? consultations.filter(c => c.patient_id === formData.patient_id)
    : consultations;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="patient_id">Patient</Label>
        <Select 
          value={formData.patient_id} 
          onValueChange={(value) => handleSelectChange("patient_id", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select patient" />
          </SelectTrigger>
          <SelectContent>
            {patients.map(patient => (
              <SelectItem key={patient.id} value={patient.id}>
                {patient.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="consultation_id">Consultation</Label>
        <Select 
          value={formData.consultation_id} 
          onValueChange={(value) => handleSelectChange("consultation_id", value)}
          disabled={!formData.patient_id}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select consultation" />
          </SelectTrigger>
          <SelectContent>
            {filteredConsultations.map(consultation => (
              <SelectItem key={consultation.id} value={consultation.id}>
                {consultation.doctor} - {consultation.date} ({consultation.department})
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
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
          min="0"
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

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full h-24 px-3 py-2 border rounded-md"
          placeholder="Additional notes or payment instructions..."
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : bill ? "Update Bill" : "Create Bill"}
        </Button>
      </div>
    </form>
  );
};
